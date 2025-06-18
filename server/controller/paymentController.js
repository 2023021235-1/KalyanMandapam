// controllers/paymentController.js
const crypto = require('crypto');
require('dotenv').config();
const Booking = require('../models/bookModel');

const ERROR_CODE_MAP = {
    E000: 'Transaction successful',
    E001: 'Unauthorized Payment Mode',
    E002: 'Unauthorized Key',
    E003: 'Unauthorized Packet',
    E004: 'Unauthorized Merchant',
    E005: 'Unauthorized Return URL',
    E006: 'Transaction is already paid',
    E007: 'Transaction Failed',
    E008: 'Failure from Third Party',
    E009: 'Bill Already Expired',
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

// Handle return callback
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

    if (!signatureMatches) {
        console.warn('❌ Signature Mismatch. Transaction ignored.');
        return respondToUser('failure');
    }

    if (code === 'E000') {
        console.log('🎉 SUCCESS:', message);
        try {
            // parse booking ID (bid) from mandatory fields: last segment
            const mand = req.body['mandatory fields'];
            const parts = mand.split('|');
            const bid = parts[parts.length - 1];
            // find and update booking
            const booking = await Booking.findOne({ booking_id: bid });
            if (booking) {
                booking.transaction_id = req.body.ReferenceNo;
                booking.isPaid = true;
                booking.booking_status = 'Confirmed';
                await booking.save();
                console.log(`Updated booking ${bid} with transaction ${booking.transaction_id}`);
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
        respondToUser('failure');
    }
};

// Verification endpoint
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

        // fetch booking by transaction_id
        const booking = await Booking.findOne({ transaction_id: pgreferenceno });
        console.log('Fetched booking for verification:', booking);

        // optional: include booking in response
        return res.json({ state: paymentState, booking });
    } catch (err) {
        console.error('Verification error:', err);
        return res.status(500).json({ error: 'Verification failed', details: err.message });
    }
};


exports.generateEazypayUrl = async (req, res) => {
    try {
        const bid= req.query.bid; // Booking ID from query params
         const booking = await Booking.findOne({ booking_id: bid });
        var amt=0;
            if (booking) {
               amt= booking.booking_amount;
            }
        const uniqueRefNo = `REF${Date.now()}`;
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
        res.json({ url: eazypayUrl, reference: uniqueRefNo });
   
    } catch (error) {
        console.error('Error generating URL:', error);
        res.status(500).send('Failed to generate Eazypay URL.');
    }
};