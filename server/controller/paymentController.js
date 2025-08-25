// controllers/paymentController.js
const crypto = require('crypto');
require('dotenv').config();
const Hall = require('../models/hallModel');
const Booking = require('../models/bookModel');

const ERROR_CODE_MAP = {
    E000: 'Transaction successful. Settlement process is initiated for the transaction.',
    E001: 'Unauthorized Payment Mode',
    E002: 'Unauthorized Key',
    E003: 'Unauthorized Packet',
    E004: 'Unauthorized Merchant',
    E005: 'Unauthorized Return URL',
    E006: 'Transaction is already paid',
    E007: 'Transaction Failed',
    E008: 'Failure from Third Party due to Technical Error',
    E009: 'Bill Already Expired',
    E0031: 'Mandatory fields coming from merchant are empty',
    E0032: 'Mandatory fields coming from database are empty',
    E0033: 'Payment mode coming from merchant is empty',
    E0034: 'PG Reference number coming from merchant is empty',
    E0035: 'Sub merchant id coming from merchant is empty',
    E0036: 'Transaction amount coming from merchant is empty',
    E0037: 'Payment mode coming from merchant is other than 0 to 9',
    E0038: 'Transaction amount coming from merchant is more than 9 digit length',
    E0039: 'Mandatory value Email in wrong format',
    E00310: 'Mandatory value mobile number in wrong format',
    E00311: 'Mandatory value amount in wrong format',
    E00312: 'Mandatory value Pan card in wrong format',
    E00313: 'Mandatory value Date in wrong format',
    E00314: 'Mandatory value String in wrong format',
    E00315: 'Optional value Email in wrong format',
    E00316: 'Optional value mobile number in wrong format',
    E00317: 'Optional value amount in wrong format',
    E00318: 'Optional value pan card number in wrong format',
    E00319: 'Optional value date in wrong format',
    E00320: 'Optional value string in wrong format',
    E00321: 'Request packet mandatory columns is not equal to mandatory columns set in enrolment or optional columns are not equal to optional columns length set in enrolment',
    E00322: 'Reference Number Blank',
    E00323: 'Mandatory Columns are Blank',
    E00324: 'Merchant Reference Number and Mandatory Columns are Blank',
    E00325: 'Merchant Reference Number Duplicate',
    E00326: 'Sub merchant id coming from merchant is non numeric',
    E00327: 'Cash Challan Generated',
    E00328: 'Cheque Challan Generated',
    E00329: 'NEFT Challan Generated',
    E00330: 'Transaction Amount and Mandatory Transaction Amount mismatch in Request URL',
    E00331: 'UPI Transaction Initiated Please Accept or Reject the Transaction',
    E00332: 'Challan Already Generated, Please re-initiate with unique reference number',
    E00333: 'Referer is null/invalid Referer',
    E00334: 'Mandatory Parameters Reference No and Request Reference No parameter values are not matched',
    E00335: 'Transaction Cancelled By User',
    E00336: 'WIRE Challan Generated',
    E00337: 'Net_banking ICICI Transaction Pending for Checker Approval',
    E0801: 'FAIL',
    E0802: 'User Dropped',
    E0803: 'Canceled by user',
    E0804: 'User Request arrived but card brand not supported',
    E0805: 'Checkout page rendered Card function not supported',
    E0806: 'Forwarded / Exceeds withdrawal amount limit',
    E0807: 'PG Fwd Fail / Issuer Authentication Server failure',
    E0808: 'Session expiry / Failed Initiate Check, Card BIN not present',
    E0809: 'Reversed / Expired Card',
    E0810: 'Unable to Authorize',
    E0811: 'Invalid Response Code or Guide received from Issuer',
    E0812: 'Do not honor',
    E0813: 'Invalid transaction',
    E0814: 'Not Matched with the entered amount',
    E0815: 'Not sufficient funds',
    E0816: 'No Match with the card number',
};

const AES_KEY = Buffer.from(process.env.PG_TEST_KEY, 'ascii'); // 16 bytes

function generateRSHash(body) {
    const parts = [
        body.ID, body['Response Code'], body['Unique Ref Number'],
        body['Service Tax Amount'], body['Processing Fee Amount'],
        body['Total Amount'], body['Transaction Amount'], body['Transaction Date'],
        body['Interchange Value'] || '', body.TDR || '', body['Payment Mode'],
        body.SubMerchantId, body.ReferenceNo, body.TPS, process.env.PG_TEST_KEY
    ];
    const concatenated = parts.join('|');
    const hash = crypto.createHash('sha512').update(concatenated, 'utf8').digest('hex');
    return { concatenated, hash };
}

// Exported for URL generation
exports.generatePaymentURL = (params) => {
    const BASE = 'https://eazypayuat.icicibank.com/EazyPG';
    let parts = [`merchantid=${params.merchantid}`];
    const encryptedKeys = ['mandatory fields', 'optional fields', 'returnurl',
        'Reference No', 'submerchantid', 'transaction amount', 'paymode'];
    for (const [key, val] of Object.entries(params)) {
        if (key === 'merchantid') continue;
        if (encryptedKeys.includes(key)) {
            const cipher = crypto.createCipheriv('aes-128-ecb', AES_KEY, null);
            cipher.setAutoPadding(true);
            let encrypted = cipher.update(val, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(encrypted)}`);
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
        }
    }
    return `${BASE}?${parts.join('&')}`;
};

// Helper: fetch ICICI verify endpoint
async function fetchAndPopulateTransactionDetails(pgreferenceno) {
    const params = new URLSearchParams({
        merchantid: process.env.EAZYPAY_MERCHANT_ID,
        pgreferenceno,
        dstatus: 'Y',
    });
    const VERIFY_BASE_URL = 'https://eazypayuat.icicibank.com/EazyPGVerify';
    const verifyUrl = `${VERIFY_BASE_URL}?${params.toString()}`;

    const response = await fetch(verifyUrl);
    if (!response.ok) {
        throw new Error(`Eazypay verification failed with status ${response.status}`);
    }
    const text = await response.text();
    const result = {};
    new URLSearchParams(text).forEach((v, k) => result[k] = v);
    return result;
}

const updateHallAvailability = async (hallId, bookingDate, floor, bookingId, markAsBooked) => {
    const hall = await Hall.findById(hallId);
    if (!hall) return false;

    const normalizedBookingDate = new Date(bookingDate);
    normalizedBookingDate.setUTCHours(0, 0, 0, 0);
    const dateString = normalizedBookingDate.toISOString().split('T')[0];

    const availabilityIndex = hall.availability_details.findIndex(
        (detail) =>
            detail.date.toISOString().split('T')[0] === dateString &&
            detail.floor === floor
    );

    if (markAsBooked) {
        if (availabilityIndex > -1) {
            hall.availability_details[availabilityIndex].status = 'booked';
            hall.availability_details[availabilityIndex].booking_id = bookingId;
        } else {
            hall.availability_details.push({
                date: normalizedBookingDate,
                floor: floor,
                status: 'booked',
                booking_id: bookingId,
            });
        }
    } else { // Mark as available (e.g., on cancellation of a confirmed booking)
        if (availabilityIndex > -1) {
            // Only remove if it was booked by this specific booking
            if (hall.availability_details[availabilityIndex].booking_id && hall.availability_details[availabilityIndex].booking_id.toString() === bookingId.toString()) {
                hall.availability_details.splice(availabilityIndex, 1);
            }
        }
    }
    await hall.save();
    return true;
};

exports.eazypayReturn = async (req, res) => {
    console.log('\n📥 Payment callback received:');
    console.log(req.body);

    const { concatenated, hash } = generateRSHash(req.body);
    const receivedRS = (req.body.RS || '').toLowerCase();
    const signatureMatches = hash === receivedRS;
    const code = req.body['Response Code'];
    const message = ERROR_CODE_MAP[code] || 'Unknown response code';

    console.log(`Signature Match: ${signatureMatches}, Response Code: ${code} (${message})`);

    const respondToUser = (status) => {
        const title = status === 'success' ? 'Payment Complete' : 'Payment Failed';
        const bodyText = status === 'success'
            ? 'Payment successful. You can close this window.'
            : 'Payment failed. Please try again. You may close this window.';
        res.send(`
            <!DOCTYPE html><html><head><title>${title}</title></head>
            <body><p>${bodyText}</p>
            <script>
                setTimeout(() => { window.close(); }, 3000);
                setTimeout(() => { if (!window.closed) { window.location.href = '/'; } }, 3500);
            </script></body></html>
        `);
    };

    const mand = req.body['mandatory fields'];
    const parts = mand.split('|');
    const bid = parts[parts.length - 1];
    const booking = await Booking.findOne({ booking_id: bid });
     const hall = await Hall.findById(booking.hall_id);
        if (!hall) {
            console.log('Hall not found for the booking.');
            return res.status(404).json({ message: 'Hall not found for this booking.' });
        }

        const desiredBookingDate = new Date(booking.booking_date); // Use booking.booking_date
        desiredBookingDate.setUTCHours(0, 0, 0, 0);

        const isSlotConfirmedByOther = hall.availability_details.some(
            (detail) =>
                detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
                detail.floor === booking.floor && // Use booking.floor
                detail.status === 'booked'
        );

        if (isSlotConfirmedByOther) {
            console.log('This hall floor is already confirmed by another booking for the selected date.');
            booking.transaction_id = null;
            booking.booking_status = 'Refund-Pending'; 
            await booking.save();
            return res.status(400).json({ message: 'This hall floor is already confirmed by another booking for the selected date. ' });
        }
        
    if (code === 'E000') {
        
    if (!signatureMatches) {
        console.warn('❌ Signature Mismatch. Transaction ignored.');
        return respondToUser('failure');
    }
        console.log('🎉 SUCCESS:', message);
        try {
            // parse booking ID (bid) from mandatory fields: last segment

            // find and update booking

            if (booking) {
                booking.transaction_id = req.body.ReferenceNo;
                booking.isPaid = true;
                booking.booking_status = 'Confirmed';
                await booking.save();
                console.log(`Updated booking ${bid} with transaction ${booking.transaction_id}`);
                // Update hall availability
                const hallUpdated = await updateHallAvailability(booking.hall_id, booking.booking_date, booking.floor, booking._id, true);
                console.log(`Hall availability updated for booking ${bid}: ${hallUpdated}`);
            } else {
                console.warn(`Booking not found for ID ${bid}`);
            }
            respondToUser('success');
        } catch (err) {
            console.error('Error updating booking:', err);
            respondToUser('failure');
        }
    } else {

        console.warn('❌ FAILURE:', message);
        if (booking) {
            booking.booking_status = 'Payment-Failed';
            booking.isPaid = false;
            booking.transaction_id = null; // Clear transaction ID
            await booking.save();
            console.log(`Updated booking ${bid} to Payment-Failed status`);
        } else {
            console.warn(`Booking not found for ID ${bid}`);
        }
        respondToUser('failure');
    }
};

exports.verifyEazypayPayment = async (req, res) => {
    try {
        const { pgreferenceno } = req.query;
        if (!pgreferenceno) {
            return res.status(400).json({ error: 'Invalid or missing reference number' });
        }

        // 1) Call ICICI Verify endpoint
        const result = await fetchAndPopulateTransactionDetails(pgreferenceno);
        console.log('Parsed verification result:', result);

        // 2) Determine state
        let paymentState;
        if (result.status === 'Success') {
            paymentState = 'success';
        } else if (['RIP', 'SIP'].includes(result.status)) {
            paymentState = 'processing';
        } else {
            paymentState = 'failed';
        }

        console.log(`Payment state determined: ${paymentState}`);
        const booking = await Booking.findOne({ transaction_id: pgreferenceno });
        console.log('Fetched booking for verification:', booking);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found for this transaction' });
        }

        console.log(`Updating booking ${booking.booking_id} with payment state: ${paymentState}`);
        if (paymentState === 'success') {
            booking.isPaid = true;
            booking.booking_status = 'Confirmed';
        } else if (paymentState === 'processing') {
            booking.booking_status = 'Payment-Processing';
        } else {
            booking.booking_status = 'Payment-Failed';
            booking.isPaid = false;
            booking.transaction_id = null; // Clear transaction ID on failure
        }
        await booking.save();
        return res.json({ state: paymentState });
    } catch (err) {
        console.error('Verification error:', err);
        return res.status(500).json({ error: 'Verification failed', details: err.message });
    }
};


exports.generateEazypayUrl = async (req, res) => {
    try {
        const bid = req.query.bid;
        const booking = await Booking.findOne({ booking_id: bid });
        var amt = 0;
        const uniqueRefNo = `REF${Date.now()}`;
        if (!booking) {
            return res.status(404).json({ success:false,message: 'Booking not found' });
        }

        if (booking) {
            amt = booking.booking_amount;
            booking.transaction_id = uniqueRefNo;
            booking.booking_status = 'Payment-Processing';
        }

        // Fetch the Hall details to check availability
        const hall = await Hall.findById(booking.hall_id);
        if (!hall) {
            console.log('Hall not found for the booking.');
            return res.status(404).json({ success:false,message: 'Hall not found for this booking.' });
        }

        const desiredBookingDate = new Date(booking.booking_date); // Use booking.booking_date
        desiredBookingDate.setUTCHours(0, 0, 0, 0);

        const isSlotConfirmedByOther = hall.availability_details.some(
            (detail) =>
                detail.date.toISOString().split('T')[0] === desiredBookingDate.toISOString().split('T')[0] &&
                detail.floor === booking.floor && // Use booking.floor
                detail.status === 'booked'
        );

        if (isSlotConfirmedByOther) {
            console.log('This hall floor is already confirmed by another booking for the selected date.');
            booking.transaction_id = null;
            booking.booking_status = 'Cancelled'; // Set status to Cancelled if slot is taken
            await booking.save();
            return res.json({ success:false,message: 'This hall floor is already confirmed by another booking for the selected date.' });
        }

        await booking.save();
        console.log('Generating Eazypay URL with reference:', uniqueRefNo);
        const params = {
            merchantid: process.env.EAZYPAY_MERCHANT_ID, // Use env var
            'mandatory fields': `${uniqueRefNo}|45|${amt}|xyz|xyz|${bid}`,
            'optional fields': '',
            returnurl: process.env.EAZYPAY_RETURN_URL, // Use env var
            'Reference No': uniqueRefNo,
            submerchantid: '45',
            'transaction amount': `${amt}`,
            paymode: '9'
        };

        const eazypayUrl = exports.generatePaymentURL(params); // Use the exported function
        console.log('Generated Eazypay URL:', eazypayUrl);
        res.json({ success:true,url: eazypayUrl, reference: uniqueRefNo });

    } catch (error) {
        console.error('Error generating URL:', error);
        res.status(500).send('Failed to generate Eazypay URL.');
    }
};