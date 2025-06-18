import React, { useState, useEffect, Fragment, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/BookNow.css'; // Assuming BookNow.css is in a 'styles' subfolder
import { CircleCheck,Clock, CircleX, CircleDot, CalendarDays, Edit3, XSquare, PlusCircle, AlertTriangle, Info as InfoIcon, Building as BuildingIcon, DollarSign as DollarSignIcon, Zap as ZapIcon, Users as UsersIcon, MapPin as MapPinIcon, X as CloseIcon, Download as DownloadIcon, Home as HomeIcon, RefreshCw } from 'lucide-react'; // Added HomeIcon for rooms and RefreshCw for CAPTCHA
import html2pdf from 'html2pdf.js';
import BookingCertificate from './BookingCertificate'; // Import the new certificate component

const BookNowSection = ({ languageType = 'en', user }) => {
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState(null);
    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);
    const [selectedHallFullDetails, setSelectedHallFullDetails] = useState(null);
    const [loadingHallDetails, setLoadingHallDetails] = useState(false);
    const [hallDetailsError, setHallDetailsError] = useState(null);
    const [isAcSelected, setIsAcSelected] = useState(false);
    const [selectedAreaOption, setSelectedAreaOption] = useState('none');

    const [bookingFormData, setBookingFormData] = useState({
        booking_id: '',
        hall_id_string: '',
        booking_date: '',
        floor: 1,
        function_type: '',
        area_sqft: '',
        booking_amount: 0,
        booking_type: '',
        is_parking: false,
        is_conference_hall: false,
        is_food_prep_area: false,
        is_lawn: false,
        is_ac: false,
        num_ac_rooms_booked: 0,
        num_non_ac_rooms_booked: 0,
    });

    const [editingBookingId, setEditingBookingId] = useState(null);
    const [isViewOnly, setIsViewOnly] = useState(false); // New state for view-only mode


    // State for certificate PREVIEW modal
    const [showCertificatePreviewModal, setShowCertificatePreviewModal] = useState(false);
    const [currentBookingForCertificate, setCurrentBookingForCertificate] = useState(null);
    const certificatePreviewRef = useRef();

    // Toast State
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    // CAPTCHA State
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");

    // State for Cancel Confirmation Modal
    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
    const [bookingIdToCancelState, setBookingIdToCancelState] = useState(null);

    // State for Pay Now Confirmation Modal
    const [showPayNowConfirmModal, setShowPayNowConfirmModal] = useState(false);
    const [bookingIdToPayState, setBookingIdToPayState] = useState(null);


    // API Base URL Configuration
    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api'; // Original API
    const API_BASE_URL2 = 'https://kalyanmandapam.onrender.com/'; // New localhost API

    const getAuthToken = () => localStorage.getItem('token');

    const showToast = (message, type = 'info', duration = 4000) => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast(prevToast => ({ ...prevToast, show: false }));
        }, duration);
    };
    const closeToast = () => {
        setToast(prevToast => ({ ...prevToast, show: false }));
    };

    const content = useMemo(() => ({
        en: {
            sectionHeading: 'Book Community Hall',
            disclaimerHeading: 'Important Disclaimer',
            disclaimerPoints: [
                'Please read all terms & conditions carefully before proceeding with the booking.',
                'Users must provide accurate information. Incorrect details may lead to booking cancellation and penalties as per terms.',
                'For technical or other assistance, contact us at it@example.gov.in or visit the Welfare Department Helpdesk.',
                'Single-use plastics are banned under the Clean India Mission. Please adhere strictly.',
                'Arrange your own valet parking. A penalty of Rs. 5000 will be deducted from the security deposit for non-compliance.',
                'The Community Hall manager will ensure valet parking arrangements are checked upon handover.',
                'Bookings are non-transferable and non-changeable.',
            ],
            disclaimerAgreeButton: 'Agree & Proceed',
            disclaimerCloseButton: 'Close',
            newBookingButton: 'New Booking',
            previousBookingsHeading: 'Your Bookings',
            tableHeaders: ['S.No.', 'Booking ID', 'Hall Name', 'Floor', 'Function', 'Amount', 'Status', 'Transaction ID', 'Paid', 'AC', 'Date', 'Actions'],
            editButton: 'Edit Booking', // General title for editing
            viewEditButton: 'View/Edit', // For table button
            viewBookingTitle: 'View Booking', // Title for view-only modal
            updateBookingButton: 'Update Booking', // Button text for submit in edit mode
            createBookingButton: 'Create Booking', // Button text for submit in new booking mode
            closeButtonText: 'Close', // Generic close button text
            cancelButton: 'Cancel',
            payNowButton: 'Pay Now',
            downloadButton: 'Download Certificate',
            noBookingsMessage: 'No bookings found. Click "New Booking" to get started!',
            loadingMessage: 'Loading...',
            errorMessage: 'An error occurred.',
            selectHallPlaceholder: 'Select Hall',
            loadingHallsMessage: 'Loading halls...',
            hallsErrorMessage: 'Failed to load halls.',
            loadingDetailsMessage: 'Fetching hall details...',
            detailsErrorMessage: 'Failed to fetch hall details.',
            acNonAcLabel: 'AC / Non-AC:',
            acOption: 'AC',
            nonAcOption: 'Non-AC',
            bookingTypeLabel: 'Booking Category:',
            municipalType: 'Municipal Staff',
            municipalityType: 'General Public (City)',
            panchayatType: 'General Public (Rural)',
            optionalAddonsLabel: 'Optional Add-ons:',
            parkingOption: 'Parking',
            conferenceHallOption: 'Conference Hall',
            foodPrepAreaOption: 'Food Prep Area',
            lawnOption: 'Lawn',
            areaSqftLabel: 'Area (sq. ft.):',
            areaOptionLabel: 'Select Area Option:',
            areaOptionFull: 'Full Area',
            areaOptionHalf: 'Half Area',
            areaOptionPartial: 'Partial Area (Specify)',
            calculatedAmountLabel: 'Estimated Total Amount:',
            closeModalButton: 'Close Modal',
            fixedPriceBlocksHeading: 'Fixed Price Services (Per Day)',
            eventSpecificPricingHeading: 'Event Specific Charges (Per Sq. Ft. Per Day)',
            categoryHeader: 'Service',
            municipalHeader: 'Staff Rate',
            municipalityHeader: 'City Rate',
            panchayatHeader: 'Rural Rate',
            eventType: 'Event Type',
            details: 'Details',
            conferenceHallAc: 'Conference Hall (AC)',
            conferenceHallNonAc: 'Conference Hall (Non-AC)',
            foodPrepAreaAc: 'Food Prep Area (AC)',
            foodPrepAreaNonAc: 'Food Prep Area (Non-AC)',
            lawnAc: 'Lawn (AC)',
            lawnNonAc: 'Lawn (Non-AC)',
            perAcRoomLabel: 'AC Room (Per Room/Day)',
            perNonAcRoomLabel: 'Non-AC Room (Per Room/Day)',
            parking: 'Parking',
            electricityAc: 'Electricity (AC)',
            electricityNonAc: 'Electricity (Non-AC)',
            cleaning: 'Cleaning Charges',
            numAcRoomsLabel: 'AC Rooms Required:',
            numNonAcRoomsLabel: 'Non-AC Rooms Required:',
            availableRoomsText: (count) => `(Max: ${count} Available)`,
            confirmCancelMessage: 'Are you sure you want to cancel this booking? This action cannot be undone.',
            confirmPayMessage: 'Are you sure you want to proceed with payment for this booking? This action will confirm your booking.',
            selectFunctionPlaceholder: 'Select Function Type',
            formValidation: {
                hallRequired: 'Please select a hall.',
                dateRequired: 'Please select a booking date.',
                functionTypeRequired: 'Please select a function type.',
                bookingTypeRequired: 'Please select a booking category.',
                areaRequired: 'Area (sq. ft.) is required for this function and must be greater than 0.',
                roomsRequired: 'Number of rooms must be 0 or a positive integer.',
            },
            bookingSuccess: 'Booking application submitted successfully! Awaiting admin approval.',
            updateSuccess: 'Booking updated successfully!',
            cancelSuccess: 'Booking cancelled successfully!',
            paymentSuccess: 'Payment successful! Booking confirmed.',
            errorPrefix: 'Error: ',
            authError: 'Authentication failed. Please log in again.',
            hallNotFound: (id) => `Hall with ID ${id} not found.`,
            bookingNotFound: 'Booking not found.',
            previewModalTitle: 'Certificate Preview',
            previewModalDownloadButton: 'Download PDF',
            previewModalCloseButton: 'Close',
            captchaLabel: 'CAPTCHA:',
            captchaPlaceholder: 'Enter CAPTCHA',
            captchaRefreshAlt: 'Refresh CAPTCHA',
            captchaErrorLoad: 'Failed to load CAPTCHA. Try again.',
            captchaErrorVerifyGeneral: 'CAPTCHA verification failed. Please try again.',
            captchaErrorInvalid: 'Invalid CAPTCHA. Please try again.',
            captchaErrorEmpty: 'Please enter the CAPTCHA.',
            confirmCancellationTitle: 'Confirm Cancellation',
            confirmPaymentTitle: 'Confirm Payment',
            confirmActionPrompt: (action) => `Please complete the CAPTCHA to ${action}.`,
            confirmCancelButtonText: 'Confirm Cancel',
            confirmPayButtonText: 'Confirm Payment',
            dismissButtonText: 'Dismiss',
        },
        hi: {
            sectionHeading: 'सामुदायिक भवन बुक करें',
            disclaimerHeading: 'महत्वपूर्ण अस्वीकरण',
            disclaimerPoints: [
                'कृपया बुकिंग के साथ आगे बढ़ने से पहले सभी नियमों और शर्तों को ध्यान से पढ़ें।',
                'उपयोगकर्ताओं को सटीक जानकारी प्रदान करनी होगी। गलत विवरण के कारण बुकिंग रद्द हो सकती है और शर्तों के अनुसार दंड लगाया जा सकता है।',
                'तकनीकी या अन्य सहायता के लिए, हमें it@example.gov.in पर संपर्क करें या कल्याण विभाग हेल्पडेस्क पर जाएँ।',
                'स्वच्छ भारत मिशन के तहत एकल-उपयोग प्लास्टिक प्रतिबंधित है। कृपया सख्ती से पालन करें।',
                'अपनी वैले पार्किंग की व्यवस्था स्वयं करें। अनुपालन न करने पर सुरक्षा जमा राशि से 5000 रुपये का जुर्माना काटा जाएगा।',
                'सामुदायिक भवन प्रबंधक सौंपने पर वैले पार्किंग व्यवस्था की जाँच सुनिश्चित करेंगे।',
                'बुकिंग अहस्तांतरणीय और अपरिवर्तनीय हैं।',
            ],
            disclaimerAgreeButton: 'सहमत हूँ और आगे बढ़ें',
            disclaimerCloseButton: 'बंद करें',
            newBookingButton: 'नई बुकिंग',
            previousBookingsHeading: 'आपकी बुकिंग',
            tableHeaders: ['क्र.सं.', 'बुकिंग आईडी', 'हॉल का नाम', 'मंजिल', 'समारोह', 'राशि', 'स्थिति', 'लेन-देन आईडी', 'भुगतान', 'एसी', 'तिथि', 'कार्रवाई'],
            editButton: 'बुकिंग संपादित करें', // General title for editing
            viewEditButton: 'देखें/संपादित करें', // For table button
            viewBookingTitle: 'बुकिंग देखें', // Title for view-only modal
            updateBookingButton: 'अपडेट करें', // Button text for submit in edit mode
            createBookingButton: 'बुक करें', // Button text for submit in new booking mode
            closeButtonText: 'बंद करें', // Generic close button text
            cancelButton: 'रद्द करें',
            payNowButton: 'अभी भुगतान करें',
            downloadButton: 'प्रमाणपत्र डाउनलोड करें',
            noBookingsMessage: 'कोई बुकिंग नहीं मिली। आरंभ करने के लिए "नई बुकिंग" पर क्लिक करें!',
            loadingMessage: 'लोड हो रहा है...',
            errorMessage: 'एक त्रुटि हुई।',
            selectHallPlaceholder: 'हॉल चुनें',
            loadingHallsMessage: 'हॉल लोड हो रहे हैं...',
            hallsErrorMessage: 'हॉल लोड करने में विफल।',
            loadingDetailsMessage: 'हॉल विवरण प्राप्त हो रहे हैं...',
            detailsErrorMessage: 'हॉल विवरण प्राप्त करने में विफल।',
            acNonAcLabel: 'एसी / गैर-एसी:',
            acOption: 'एसी',
            nonAcOption: 'गैर-एसी',
            bookingTypeLabel: 'बुकिंग श्रेणी:',
            municipalType: 'नगरपालिका कर्मचारी',
            municipalityType: 'आम जनता (शहर)',
            panchayatType: 'आम जनता (ग्रामीण)',
            optionalAddonsLabel: 'वैकल्पिक ऐड-ऑन:',
            parkingOption: 'पार्किंग',
            conferenceHallOption: 'सम्मेलन कक्ष',
            foodPrepAreaOption: 'भोजन तैयारी क्षेत्र',
            lawnOption: 'लॉन',
            areaSqftLabel: 'क्षेत्र (वर्ग फुट):',
            areaOptionLabel: 'क्षेत्र विकल्प चुनें:',
            areaOptionFull: 'पूरा क्षेत्र',
            areaOptionHalf: 'आधा क्षेत्र',
            areaOptionPartial: 'आंशिक क्षेत्र (निर्दिष्ट करें)',
            calculatedAmountLabel: 'अनुमानित कुल राशि:',
            closeModalButton: 'मॉडल बंद करें',
            fixedPriceBlocksHeading: 'निश्चित मूल्य सेवाएं (प्रति दिन)',
            eventSpecificPricingHeading: 'इवेंट विशिष्ट शुल्क (प्रति वर्ग फुट प्रति दिन)',
            categoryHeader: 'सेवा',
            municipalHeader: 'कर्मचारी दर',
            municipalityHeader: 'शहर दर',
            panchayatHeader: 'ग्रामीण दर',
            eventType: 'इवेंट प्रकार',
            details: 'विवरण',
            conferenceHallAc: 'सम्मेलन कक्ष (एसी)',
            conferenceHallNonAc: 'सम्मेलन कक्ष (गैर-एसी)',
            foodPrepAreaAc: 'भोजन तैयारी क्षेत्र (एसी)',
            foodPrepAreaNonAc: 'भोजन तैयारी क्षेत्र (गैर-एसी)',
            lawnAc: 'लॉन (एसी)',
            lawnNonAc: 'लॉन (गैर-एसी)',
            perAcRoomLabel: 'एसी कमरा (प्रति कमरा/दिन)',
            perNonAcRoomLabel: 'गैर-एसी कमरा (प्रति कमरा/दिन)',
            parking: 'पार्किंग',
            electricityAc: 'बिजली (एसी)',
            electricityNonAc: 'बिजली (गैर-एसी)',
            cleaning: 'सफाई शुल्क',
            numAcRoomsLabel: 'एसी कमरे आवश्यक:',
            numNonAcRoomsLabel: 'गैर-एसी कमरे आवश्यक:',
            availableRoomsText: (count) => `(अधिकतम: ${count} उपलब्ध)`,
            confirmCancelMessage: 'क्या आप वाकई इस बुकिंग को रद्द करना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।',
            confirmPayMessage: 'क्या आप वाकई इस बुकिंग के लिए भुगतान करना चाहते हैं? यह कार्रवाई आपकी बुकिंग की पुष्टि करेगी।',
            selectFunctionPlaceholder: 'समारोह प्रकार चुनें',
            formValidation: {
                hallRequired: 'कृपया एक हॉल चुनें।',
                dateRequired: 'कृपया बुकिंग तिथि चुनें।',
                functionTypeRequired: 'कृपया एक समारोह प्रकार चुनें।',
                bookingTypeRequired: 'कृपया एक बुकिंग श्रेणी चुनें।',
                areaRequired: 'इस समारोह के लिए क्षेत्र (वर्ग फुट) आवश्यक है और 0 से अधिक होना चाहिए।',
                roomsRequired: 'कमरों की संख्या 0 या एक सकारात्मक पूर्णांक होनी चाहिए।',
            },
            bookingSuccess: 'बुकिंग आवेदन सफलतापूर्वक जमा किया गया! व्यवस्थापक अनुमोदन की प्रतीक्षा है।',
            updateSuccess: 'बुकिंग सफलतापूर्वक अपडेट की गई!',
            cancelSuccess: 'बुकिंग सफलतापूर्वक रद्द की गई!',
            paymentSuccess: 'भुगतान सफल! बुकिंग की पुष्टि हो गई।',
            errorPrefix: 'त्रुटि: ',
            authError: 'प्रमाणीकरण विफल। कृपया पुनः लॉग इन करें।',
            hallNotFound: (id) => `हॉल आईडी ${id} नहीं मिला।`,
            bookingNotFound: 'बुकिंग नहीं मिली।',
            previewModalTitle: 'प्रमाणपत्र पूर्वावलोकन',
            previewModalDownloadButton: 'पीडीएफ डाउनलोड करें',
            previewModalCloseButton: 'बंद करें',
            captchaLabel: 'कैप्चा:',
            captchaPlaceholder: 'कैप्चा दर्ज करें',
            captchaRefreshAlt: 'कैप्चा रीफ़्रेश करें',
            captchaErrorLoad: 'कैप्चा लोड करने में विफल। पुनः प्रयास करें।',
            captchaErrorVerifyGeneral: 'कैप्चा सत्यापन विफल। कृपया पुनः प्रयास करें।',
            captchaErrorInvalid: 'अमान्य कैप्चा। कृपया पुनः प्रयास करें।',
            captchaErrorEmpty: 'कृपया कैप्चा दर्ज करें।',
            confirmCancellationTitle: 'रद्दीकरण की पुष्टि करें',
            confirmPaymentTitle: 'भुगतान की पुष्टि करें',
            confirmActionPrompt: (action) => `कृपया ${action} के लिए कैप्चा पूरा करें।`,
            confirmCancelButtonText: 'रद्दीकरण की पुष्टि करें',
            confirmPayButtonText: 'भुगतान की पुष्टि करें',
            dismissButtonText: 'खारिज करें',
        },
    }), [languageType]);

    const currentContent = content[languageType] || content.en;

     const fetchNewCaptcha = async () => {
        setCaptchaError('');
        setCaptchaInput('');
        setCaptchaSvg('');
        setCaptchaToken('');
        try {
            const response = await fetch(`${API_BASE_URL}/captcha/get-captcha`);
            if (!response.ok) {
                 const errorData = await response.text();
                 console.error("CAPTCHA fetch error data:", errorData);
                 throw new Error(currentContent.captchaErrorLoad);
            }
            const data = await response.json();
            setCaptchaSvg(data.svg);
            setCaptchaToken(data.token);
        } catch (error) {
            console.error("Failed to load CAPTCHA:", error);
            const errorMessage = error.message || currentContent.captchaErrorLoad;
            setCaptchaError(errorMessage);
        }
    };

    const verifyCaptchaAndProceed = async (actualActionCallback) => {
        if (!captchaInput.trim() || !captchaToken) {
            setCaptchaError(currentContent.captchaErrorEmpty);
            if (!captchaToken) fetchNewCaptcha();
            return false;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/captcha/verify-captcha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captchaInput, captchaToken }),
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(currentContent.captchaErrorInvalid);
            }
            setCaptchaError(''); 
            if (actualActionCallback) await actualActionCallback();
            return true;
        } catch (error) {
            console.error("CAPTCHA verification error:", error);
            const errorMessage = error.message || currentContent.captchaErrorVerifyGeneral;
            setCaptchaError(errorMessage);
            showToast(errorMessage, 'error');
            fetchNewCaptcha(); 
            return false;
        }
    };


    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchBookings();
            fetchAllHalls();
        }
    }, [user, navigate]);

    useEffect(() => {
        if (bookingFormData.hall_id_string) {
            if (!isViewOnly) { // Only fetch if not in view only, or if details are needed for viewing
                fetchHallFullDetails(bookingFormData.hall_id_string);
            } else if (!selectedHallFullDetails) { // If view only and details aren't there, fetch them
                 fetchHallFullDetails(bookingFormData.hall_id_string);
            }
        } else {
            setSelectedHallFullDetails(null);
            setHallDetailsError(null);
             if(!isEditing || !isViewOnly) { // Avoid resetting form data if just viewing and hall id changes due to some other logic
                setBookingFormData(prevData => ({
                    ...prevData,
                    function_type: '', area_sqft: '', booking_type: '',
                    is_parking: false, is_conference_hall: false, is_food_prep_area: false, is_lawn: false,
                    num_ac_rooms_booked: 0, num_non_ac_rooms_booked: 0,
                }));
                setSelectedAreaOption('none');
            }
        }
    }, [bookingFormData.hall_id_string, isViewOnly, isEditing]);

    useEffect(() => {
        // Fetch CAPTCHA for the main booking/editing form
        if (showModal && modalStep === 2 && !isViewOnly) {
            fetchNewCaptcha();
        }
        // Fetch CAPTCHA for cancel confirmation modal
        if (showCancelConfirmModal) {
            fetchNewCaptcha();
        }
        // Fetch CAPTCHA for pay now confirmation modal
        if (showPayNowConfirmModal) {
            fetchNewCaptcha();
        }
        // DO NOT fetch CAPTCHA for certificate preview modal anymore
    }, [showModal, modalStep, isViewOnly, showCancelConfirmModal, showPayNowConfirmModal]);


    const getTieredPrice = (priceObject, bookingType) => {
        if (!priceObject || !bookingType) return 0;
        return priceObject[bookingType] || 0;
    };

    const calculateBookingAmount = useMemo(() => () => {
        let totalAmount = 0;
        if (!selectedHallFullDetails || !bookingFormData.booking_type) return 0;

        const hall = selectedHallFullDetails;
        const bookingType = bookingFormData.booking_type;

        if (bookingFormData.is_parking && hall.parking) totalAmount += getTieredPrice(hall.parking, bookingType);
        if (bookingFormData.is_conference_hall && (isAcSelected ? hall.conference_hall_ac : hall.conference_hall_nonac)) totalAmount += getTieredPrice(isAcSelected ? hall.conference_hall_ac : hall.conference_hall_nonac, bookingType);
        if (bookingFormData.is_food_prep_area && (isAcSelected ? hall.food_prep_area_ac : hall.food_prep_area_nonac)) totalAmount += getTieredPrice(isAcSelected ? hall.food_prep_area_ac : hall.food_prep_area_nonac, bookingType);
        if (bookingFormData.is_lawn && (isAcSelected ? hall.lawn_ac : hall.lawn_nonac)) totalAmount += getTieredPrice(isAcSelected ? hall.lawn_ac : hall.lawn_nonac, bookingType);
        
        if (bookingFormData.num_ac_rooms_booked > 0 && hall.room_rent_ac) {
            totalAmount += Number(bookingFormData.num_ac_rooms_booked) * getTieredPrice(hall.room_rent_ac, bookingType);
        }
        if (bookingFormData.num_non_ac_rooms_booked > 0 && hall.room_rent_nonac) {
            totalAmount += Number(bookingFormData.num_non_ac_rooms_booked) * getTieredPrice(hall.room_rent_nonac, bookingType);
        }

        if (isAcSelected ? hall.electricity_ac : hall.electricity_nonac) totalAmount += getTieredPrice(isAcSelected ? hall.electricity_ac : hall.electricity_nonac, bookingType);
        if (hall.cleaning) totalAmount += getTieredPrice(hall.cleaning, bookingType);

        if (bookingFormData.function_type && Number(bookingFormData.area_sqft) > 0) {
            const eventPrice = hall.event_pricing?.find(event =>
                event.event_type.toLowerCase() === bookingFormData.function_type.toLowerCase()
            );
            if (eventPrice) {
                const perSqftPrices = isAcSelected ? eventPrice.prices_per_sqft_ac : eventPrice.prices_per_sqft_nonac;
                if (perSqftPrices) {
                    const perSqftRate = getTieredPrice(perSqftPrices, bookingType);
                    totalAmount += (Number(bookingFormData.area_sqft) * perSqftRate);
                }
            }
        }
        return parseFloat(totalAmount.toFixed(2));
    }, [
        selectedHallFullDetails, 
        isAcSelected, 
        bookingFormData.booking_type, 
        bookingFormData.function_type, 
        bookingFormData.area_sqft, 
        bookingFormData.is_parking, 
        bookingFormData.is_conference_hall, 
        bookingFormData.is_food_prep_area, 
        bookingFormData.is_lawn,
        bookingFormData.num_ac_rooms_booked,
        bookingFormData.num_non_ac_rooms_booked,
    ]);
    
    useEffect(() => {
        if (!isViewOnly) { // Only calculate and update if not in view-only mode
            const calculatedAmount = calculateBookingAmount();
            setBookingFormData(prevData => ({
                ...prevData,
                booking_amount: calculatedAmount,
                is_ac: isAcSelected,
            }));
        }
    }, [
        isAcSelected,
        calculateBookingAmount,
        isViewOnly // Add isViewOnly to dependency array
    ]);


    const fetchBookings = async () => {
        setLoadingBookings(true);
        setBookingError(null);
        const token = getAuthToken();
        if (!token) {
            setBookingError(currentContent.authError);
            setLoadingBookings(false);
            navigate('/login');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    throw new Error(currentContent.authError);
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            let populatedAvailableHalls = availableHalls;
            if (availableHalls.length === 0) {
                populatedAvailableHalls = await fetchAllHalls(true); // Make sure fetchAllHalls can return data
            }

            const bookingsWithHallNames = data.map((booking) => {
                let hallName = 'N/A';
                if (booking.hall_id && typeof booking.hall_id === 'object' && booking.hall_id.hall_name) {
                    hallName = booking.hall_id.hall_name;
                } else if (booking.hall_id_string) {
                    // Use `populatedAvailableHalls` which should be up-to-date
                    const hallDetails = populatedAvailableHalls.find(hall => hall.hall_id === booking.hall_id_string);
                    if (hallDetails) {
                        hallName = hallDetails.hall_name;
                    }
                }
                return { ...booking, hall_display_name: hallName };
            });
            setBookings(bookingsWithHallNames);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookingError(`${currentContent.errorPrefix}${error.message}`);
        } finally {
            setLoadingBookings(false);
        }
    };

    const fetchAllHalls = async (returnData = false) => {
        setLoadingHalls(true);
        setHallsError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/halls`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setAvailableHalls(data);
            if (returnData) return data;
        } catch (error) {
            console.error('Error fetching halls:', error);
            setHallsError(currentContent.hallsErrorMessage);
            if (returnData) return [];
        } finally {
            setLoadingHalls(false);
        }
    };


    const fetchHallFullDetails = async (hallIdString) => {
        setLoadingHallDetails(true);
        setHallDetailsError(null);
        // setSelectedHallFullDetails(null); // Don't nullify if we might be viewing
        try {
            const response = await fetch(`${API_BASE_URL}/halls/${hallIdString}`);
            if (!response.ok) {
                if (response.status === 404) throw new Error(currentContent.hallNotFound(hallIdString));
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSelectedHallFullDetails(data);
            if (!isEditing && !isViewOnly) { // Reset parts of form only if creating a new booking and hall changes
                 setBookingFormData(prev => ({
                    ...prev, function_type: '', area_sqft: '',
                    is_parking: false, is_conference_hall: false, is_food_prep_area: false, is_lawn: false,
                    num_ac_rooms_booked: 0, num_non_ac_rooms_booked: 0,
                }));
                setSelectedAreaOption('none');
            }
            return data;
        } catch (error) {
            console.error('Error fetching hall details:', error);
            setHallDetailsError(currentContent.detailsErrorMessage);
            setSelectedHallFullDetails(null);
            return null;
        } finally {
            setLoadingHallDetails(false);
        }
    };

    const handleDisclaimerAgreedInModal = () => {
        setModalStep(2);
    }

    const resetFormData = () => {
        setBookingFormData({
            booking_id: '', hall_id_string: '', booking_date: '', floor: 1, function_type: '',
            area_sqft: '', booking_amount: 0, booking_type: '', is_parking: false,
            is_conference_hall: false, is_food_prep_area: false, is_lawn: false, is_ac: false,
            num_ac_rooms_booked: 0, num_non_ac_rooms_booked: 0,
        });
        setSelectedHallFullDetails(null);
        setHallDetailsError(null);
        setIsAcSelected(false);
        setSelectedAreaOption('none');
        setCaptchaInput('');
        setCaptchaError('');
        setIsViewOnly(false); // Reset view-only mode
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setIsEditing(false);
        setEditingBookingId(null);
        resetFormData(); // This will now also reset isViewOnly
    };

    const handleNewBookingClick = () => {
        setIsEditing(false); 
        setIsViewOnly(false); 
        setEditingBookingId(null);
        resetFormData();
        setModalStep(1); 
        setShowModal(true);
    };

    const handleBookingFormChange = (e) => {
        if (isViewOnly) return; // Prevent changes if in view-only mode

        const { name, value, type, checked } = e.target;

        if (name === 'hall_id_string') {
            setBookingFormData(prevData => ({
                ...prevData, [name]: value, function_type: '', area_sqft: '',
                is_parking: false, is_conference_hall: false, is_food_prep_area: false, is_lawn: false,
                num_ac_rooms_booked: 0, num_non_ac_rooms_booked: 0, booking_amount: 0,
            }));
            setIsAcSelected(false); 
            setSelectedAreaOption('none');
        } else if (name === 'is_ac_radio') {
            const newAcSelected = value === 'true';
            setIsAcSelected(newAcSelected);
            setBookingFormData(prevData => ({ ...prevData, is_ac: newAcSelected }));
        } else if (name === 'booking_type_radio') {
            setBookingFormData(prevData => ({ ...prevData, booking_type: value }));
        } else if (name === 'selected_area_option') {
            setSelectedAreaOption(value);
            let calculatedArea = '';
            const totalArea = selectedHallFullDetails?.total_area_sqft || 0;
            if (value === 'full' && totalArea > 0) calculatedArea = totalArea.toString();
            else if (value === 'half' && totalArea > 0) calculatedArea = (totalArea / 2).toString();
            else if (value === 'partial') calculatedArea = bookingFormData.area_sqft;
            else calculatedArea = '';
            setBookingFormData(prevData => ({ ...prevData, area_sqft: calculatedArea }));
        } else if (name === 'area_sqft') {
            setBookingFormData(prevData => ({ ...prevData, [name]: value }));
        } else if (name === 'num_ac_rooms_booked' || name === 'num_non_ac_rooms_booked') {
            let numValue = value === '' ? 0 : parseInt(value, 10);
            if (isNaN(numValue) || numValue < 0) numValue = 0;
            setBookingFormData(prevData => ({ ...prevData, [name]: numValue }));
        } else if (type === 'checkbox') {
            setBookingFormData(prevData => ({ ...prevData, [name]: checked }));
        } else {
            setBookingFormData(prevData => ({ ...prevData, [name]: value }));
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (isViewOnly) return; // Should not be callable if view only due to button state

        const token = getAuthToken();
        if (!token) {
            showToast(currentContent.authError, 'error');
            navigate('/login');
            return;
        }

        if (!bookingFormData.hall_id_string) { showToast(currentContent.formValidation.hallRequired, 'error'); return; }
        if (!bookingFormData.booking_date) { showToast(currentContent.formValidation.dateRequired, 'error'); return; }
        if (!bookingFormData.function_type) { showToast(currentContent.formValidation.functionTypeRequired, 'error'); return; }
        if (!bookingFormData.booking_type) { showToast(currentContent.formValidation.bookingTypeRequired, 'error'); return; }
        
        const isEventFunction = selectedHallFullDetails?.event_pricing?.some(event =>
            event.event_type.toLowerCase() === bookingFormData.function_type.toLowerCase()
        );
        if (isEventFunction && (bookingFormData.area_sqft === '' || Number(bookingFormData.area_sqft) <= 0)) {
            showToast(currentContent.formValidation.areaRequired, 'error'); return;
        }
        if (Number(bookingFormData.num_ac_rooms_booked) < 0 || Number(bookingFormData.num_non_ac_rooms_booked) < 0) {
            showToast(currentContent.formValidation.roomsRequired, 'error'); return;
        }

        const actualSubmitLogic = async () => {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `${API_BASE_URL}/bookings/${editingBookingId}` : `${API_BASE_URL}/bookings`;
            
            const requestBody = { 
                ...bookingFormData, 
                area_sqft: isEventFunction ? Number(bookingFormData.area_sqft) : undefined,
                num_ac_rooms_booked: Number(bookingFormData.num_ac_rooms_booked),
                num_non_ac_rooms_booked: Number(bookingFormData.num_non_ac_rooms_booked),
            };

            try {
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(requestBody),
                });
                if (!response.ok) {
                    if (response.status === 401) { navigate('/login'); throw new Error(currentContent.authError); }
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                await fetchBookings();
                handleCloseModal(); 
                showToast(isEditing ? currentContent.updateSuccess : currentContent.bookingSuccess, 'success');
            } catch (error) {
                console.error('Error saving booking:', error);
                showToast(`${currentContent.errorPrefix}${error.message}`, 'error');
            }
        };
        await verifyCaptchaAndProceed(actualSubmitLogic);
    };
    
    const handleOpenBookingModal = async (booking) => {
        const viewMode = booking.booking_status !== 'Pending';
        setIsEditing(true); 
        setIsViewOnly(viewMode); 
        setEditingBookingId(booking._id);
        
        const hallIdForModal = booking.hall_id_string || (booking.hall_id ? booking.hall_id.hall_id : null);
        let hallDetails = null;
        if (hallIdForModal) {
            hallDetails = await fetchHallFullDetails(hallIdForModal); 
        }
    
        setBookingFormData({
            booking_id: booking.booking_id,
            hall_id_string: hallIdForModal || '',
            booking_date: booking.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : '',
            floor: booking.floor || 1,
            function_type: booking.function_type || '',
            area_sqft: booking.area_sqft?.toString() || '',
            booking_amount: booking.booking_amount || 0, // Will be recalculated if editable, otherwise just for display
            booking_type: booking.booking_type || '',
            is_parking: booking.is_parking || false,
            is_conference_hall: booking.is_conference_hall || false,
            is_food_prep_area: booking.is_food_prep_area || false,
            is_lawn: booking.is_lawn || false,
            is_ac: booking.is_ac || false,
            num_ac_rooms_booked: booking.num_ac_rooms_booked || 0,
            num_non_ac_rooms_booked: booking.num_non_ac_rooms_booked || 0,
        });
        setIsAcSelected(booking.is_ac || false); // Set AC selection based on existing booking
    
        if (hallDetails && booking.area_sqft) {
            const totalArea = hallDetails.total_area_sqft || 0;
            if (totalArea > 0) {
                if (Number(booking.area_sqft) === totalArea) setSelectedAreaOption('full');
                else if (Number(booking.area_sqft) === totalArea / 2) setSelectedAreaOption('half');
                else setSelectedAreaOption('partial');
            } else {
                 setSelectedAreaOption(booking.area_sqft ? 'partial' : 'none');
            }
        } else {
            setSelectedAreaOption(booking.area_sqft ? 'partial' : 'none');
        }
    
        setModalStep(2); 
        setShowModal(true);
    };

    const initiateCancelBooking = (bookingId) => {
        setBookingIdToCancelState(bookingId);
        // fetchNewCaptcha(); // CAPTCHA fetched by useEffect for this modal
        setShowCancelConfirmModal(true);
    };

    const confirmAndExecuteCancelBooking = async () => {
        if (!bookingIdToCancelState) return;
        const token = getAuthToken();
        if (!token) { 
            showToast(currentContent.authError, 'error'); 
            navigate('/login'); 
            setShowCancelConfirmModal(false);
            return; 
        }

        const actualCancelLogic = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingIdToCancelState}/cancel`, {
                    method: 'PUT', headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    if (response.status === 401) { navigate('/login'); throw new Error(currentContent.authError); }
                    if (response.status === 404) throw new Error(currentContent.bookingNotFound);
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                await fetchBookings(); 
                showToast(currentContent.cancelSuccess, 'success');
                setShowCancelConfirmModal(false);
                setBookingIdToCancelState(null);
                setCaptchaInput(''); 
            } catch (error) {
                console.error('Error cancelling booking:', error);
                showToast(`${currentContent.errorPrefix}${error.message}`, 'error');
            }
        };

        await verifyCaptchaAndProceed(actualCancelLogic);
    };

    const initiatePayNow = (bookingId) => {
        setBookingIdToPayState(bookingId);
        // fetchNewCaptcha(); // CAPTCHA fetched by useEffect for this modal
        setShowPayNowConfirmModal(true);
    };

    const confirmAndExecutePayNow = async () => {
        if (!bookingIdToPayState) return;
        const token = getAuthToken();
        if (!token) {
            showToast(currentContent.authError, 'error');
            navigate('/login');
            setShowPayNowConfirmModal(false);
            return;
        }

         const actualPayLogic = async () => {
            try {
                const response = await fetch(`${API_BASE_URL2}generate-eazypay-url?bid=${encodeURIComponent(bookingIdToPayState)}`, {
                    method: 'GET', headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('EazyPay URL:', data.url);
                     const  eazypayUrl  =data.url;
      if (eazypayUrl) {
        window.open(eazypayUrl, '_blank'); 
        
                showToast(currentContent.paymentSuccess, 'success');
                setShowPayNowConfirmModal(false);
                setBookingIdToPayState(null);
                setCaptchaInput(''); 
                setTimeout(async() => {
                       await fetchBookings(); 
                }, 60000); // Refresh bookings after 2 seconds
             
      } else {
        throw new Error("Failed to get payment URL from server.");
      }
                }
        //      
            } catch (error) {
                console.error('Error processing payment:', error);
                showToast(`${currentContent.errorPrefix}${error.message}`, 'error');
            }
        };

       await verifyCaptchaAndProceed(actualPayLogic);
    };


    const openCertificatePreview = (booking) => {
        setCurrentBookingForCertificate(booking);
        setShowCertificatePreviewModal(true);
        // CAPTCHA is removed for certificate download
    };

    const downloadCertificateFromPreview = async () => {
        // CAPTCHA verification is removed from here
        if (certificatePreviewRef.current && currentBookingForCertificate) {
            const elementToCapture = certificatePreviewRef.current.querySelector('.user-dl-pdf-layout');
            if (elementToCapture) {
                html2pdf().from(elementToCapture).set({
                    margin: 0, 
                    filename: `Certificate_Booking_${currentBookingForCertificate.booking_id}.pdf`,
                    html2canvas: { scale: 2, logging: true, dpi: 192, letterRendering: true, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                }).save().then(() => {
                    showToast('Certificate download started!', 'success');
                     setShowCertificatePreviewModal(false); 
                     setCurrentBookingForCertificate(null);
                }).catch(err => {
                    console.error("PDF generation failed:", err);
                    showToast('Certificate download failed.', 'error');
                });
            } else {
                showToast('Error preparing certificate for download.', 'error');
            }
        } else {
            showToast('Error: Cannot download certificate.', 'error');
        }
    };


    const renderPriceTable = (title, data, acStatus, isEventTable = false) => {
        // ... (price table rendering logic - no changes needed for view-only as it's display)
        if (!selectedHallFullDetails || (isEventTable && (!data || data.length === 0))) return null;
    
        const getRowData = (itemKey, item) => {
            let label = '';
            let prices = null;

            if (isEventTable) {
                label = item.event_type;
                prices = acStatus ? item.prices_per_sqft_ac : item.prices_per_sqft_nonac;
            } else {
                const blockLabels = {
                    conferenceHall: currentContent.conferenceHallOption,
                    foodPrepArea: currentContent.foodPrepAreaOption,
                    lawn: currentContent.lawnOption,
                    roomRentAc: currentContent.perAcRoomLabel,
                    roomRentNonAc: currentContent.perNonAcRoomLabel,
                    parking: currentContent.parking,
                    electricity: currentContent.electricityAc.replace(' (AC)', '').replace(' (गैर-एसी)', ''),
                    cleaning: currentContent.cleaning,
                };
                label = blockLabels[itemKey];
                prices = item; 
            }
            
            if (!prices || !label) return null;

            return (
                <Fragment>
                    <td>{label} {itemKey === 'electricity' || itemKey === 'conferenceHall' || itemKey === 'foodPrepArea' || itemKey === 'lawn' ? `(${acStatus ? currentContent.acOption : currentContent.nonAcOption})` : ''}</td>
                    <td>Rs. {getTieredPrice(prices, 'municipal')}</td>
                    <td>Rs. {getTieredPrice(prices, 'municipality')}</td>
                    <td>Rs. {getTieredPrice(prices, 'panchayat')}</td>
                </Fragment>
            );
        };
    
        const fixedBlocksDataEntries = () => {
            const blocks = {};
            if (selectedHallFullDetails.conference_hall_ac && selectedHallFullDetails.conference_hall_nonac) {
                blocks.conferenceHall = acStatus ? selectedHallFullDetails.conference_hall_ac : selectedHallFullDetails.conference_hall_nonac;
            }
            if (selectedHallFullDetails.food_prep_area_ac && selectedHallFullDetails.food_prep_area_nonac) {
                blocks.foodPrepArea = acStatus ? selectedHallFullDetails.food_prep_area_ac : selectedHallFullDetails.food_prep_area_nonac;
            }
            if (selectedHallFullDetails.lawn_ac && selectedHallFullDetails.lawn_nonac) {
                blocks.lawn = acStatus ? selectedHallFullDetails.lawn_ac : selectedHallFullDetails.lawn_nonac;
            }
            if (acStatus && selectedHallFullDetails.room_rent_ac) {
                blocks.roomRentAc = selectedHallFullDetails.room_rent_ac;
            }
            if (!acStatus && selectedHallFullDetails.room_rent_nonac) {
                blocks.roomRentNonAc = selectedHallFullDetails.room_rent_nonac;
            }
            if (selectedHallFullDetails.parking) blocks.parking = selectedHallFullDetails.parking;
            if (selectedHallFullDetails.electricity_ac && selectedHallFullDetails.electricity_nonac) {
                 blocks.electricity = acStatus ? selectedHallFullDetails.electricity_ac : selectedHallFullDetails.electricity_nonac;
            }
            if (selectedHallFullDetails.cleaning) blocks.cleaning = selectedHallFullDetails.cleaning;
            return Object.entries(blocks);
        }

        const itemsToRender = isEventTable ? data : fixedBlocksDataEntries();
    
        return (
            <div className="bn-price-table-container">
                <h5>{title}</h5>
                <table className="bn-price-table">
                    <thead>
                        <tr>
                            <th>{isEventTable ? currentContent.eventType : currentContent.categoryHeader}</th>
                            <th>{currentContent.municipalHeader}</th>
                            <th>{currentContent.municipalityHeader}</th>
                            <th>{currentContent.panchayatHeader}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsToRender.map(itemOrEntry => {
                            const key = isEventTable ? itemOrEntry.event_type : itemOrEntry[0];
                            const itemData = isEventTable ? itemOrEntry : itemOrEntry[1];
                            const itemKeyForGetData = isEventTable ? null : itemOrEntry[0];
                            const rowContent = getRowData(itemKeyForGetData, itemData);
                            return rowContent ? <tr key={key}>{rowContent}</tr> : null;
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderCaptchaSection = (actionContext = "") => (
        <div className="bn-form-group bn-captcha-section bn-form-group-full">
            <label htmlFor="captcha_input" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                {currentContent.captchaLabel}
            </label>
            {actionContext && <p style={{fontSize: '0.9em', color: 'var(--bn-text-secondary)', marginBottom: '10px'}}>{actionContext}</p>}
            {captchaSvg ? (
                <div className="captcha-image-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                    <button 
                        type="button" 
                        onClick={fetchNewCaptcha} 
                        className="bn-button bn-button-icon bn-refresh-captcha-button" 
                        aria-label={currentContent.captchaRefreshAlt}
                        title={currentContent.captchaRefreshAlt}
                        style={{ padding: '8px', lineHeight: '1' }}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            ) : (
                 <p className="bn-message bn-loading-message" style={{fontSize: '0.9em'}}>{currentContent.loadingMessage}</p>
            )}
            <input
                type="text"
                id="captcha_input"
                placeholder={currentContent.captchaPlaceholder}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                className="bn-input"
            />
            {captchaError && <p className="bn-error-text" style={{color: 'var(--bn-color-error)', fontSize: '0.9em', marginTop: '5px'}}>{captchaError}</p>}
        </div>
    );
    
    const isHallSelected = !!bookingFormData.hall_id_string;
    const isFunctionTypeSelected = !!bookingFormData.function_type;
    const isBookingTypeSelected = !!bookingFormData.booking_type;
    const isFunctionTypeEvent = selectedHallFullDetails?.event_pricing?.some(event =>
        event.event_type.toLowerCase() === bookingFormData.function_type?.toLowerCase()
    );

    return (
        <section className="bn-section">
            {toast.show && (
                <div className={`bn-toast-wrapper ${toast.type} ${toast.show ? 'show' : ''}`}>
                    <div className="bn-toast-content">
                        {toast.type === 'success' && <CircleCheck size={20} />}
                        {toast.type === 'error' && <CircleX size={20} />}
                        {toast.type === 'info' && <InfoIcon size={20} />}
                        <span>{toast.message}</span>
                    </div>
                    <button onClick={closeToast} className="bn-toast-close-button">
                        <CloseIcon size={18} />
                    </button>
                </div>
            )}

            <h1 className='main-heading'>{currentContent.sectionHeading}</h1>

            <div className="bn-main-content-block">
                <div className="bn-main-header">
                    <h2>{currentContent.previousBookingsHeading}</h2>
                    <button className="bn-button bn-new-booking-button" onClick={handleNewBookingClick}>
                        <PlusCircle size={18} /> {currentContent.newBookingButton}
                    </button>
                </div>

                <div className="bn-bookings-list-area">
                    {loadingBookings ? (
                        <p className="bn-message bn-loading-message"><InfoIcon size={18} /> {currentContent.loadingMessage}</p>
                    ) : bookingError ? (
                        <p className="bn-message bn-error-message"><AlertTriangle size={18} /> {bookingError}</p>
                    ) : bookings.length === 0 ? (
                        <p className="bn-message bn-no-bookings-message">{currentContent.noBookingsMessage}</p>
                    ) : (
                        <div className="bn-table-container">
                            <table className="bn-bookings-table">
                                <thead>
                                    <tr>
                                        {currentContent.tableHeaders.map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, index) => (
                                        <tr key={booking._id || booking.booking_id}>
                                            <td data-label={currentContent.tableHeaders[0]}>{index + 1}</td>
                                            <td data-label={currentContent.tableHeaders[1]}>{booking.booking_id}</td>
                                            <td data-label={currentContent.tableHeaders[2]}>{booking.hall_display_name || 'N/A'}</td>
                                            <td data-label={currentContent.tableHeaders[3]}>{booking.floor || 'N/A'}</td>
                                            <td data-label={currentContent.tableHeaders[4]}>{booking.function_type}</td>
                                            <td data-label={currentContent.tableHeaders[5]}>Rs. {booking.booking_amount?.toFixed(2)}</td>
                                            <td data-label={currentContent.tableHeaders[6]} className="bn-table-status-cell">
                                                {booking.booking_status === 'Confirmed' && <span className="bn-status-indicator bn-status-confirmed"><CircleCheck size={16} />{booking.booking_status}</span>}
                                                {booking.booking_status === 'Cancelled' && <span className="bn-status-indicator bn-status-rejected"><CircleX size={16} />{booking.booking_status}</span>}
                                                {booking.booking_status === 'Pending' && <span className="bn-status-indicator bn-status-pending"><CircleDot size={16} />{booking.booking_status}</span>}
                                                {booking.booking_status === 'AwaitingPayment' && <span className="bn-status-indicator bn-status-awaiting-payment"><Clock size={16} />{booking.booking_status}</span>}
                                                {!['Confirmed', 'Cancelled', 'Pending', 'AwaitingPayment'].includes(booking.booking_status) && <span>{booking.booking_status}</span>}
                                            </td>
                                            <td data-label={currentContent.tableHeaders[7]}>{booking.transaction_id || 'N/A'}</td>
                                            <td data-label={currentContent.tableHeaders[8]}>{booking.isPaid ? 'Yes' : 'No'}</td>
                                            <td data-label={currentContent.tableHeaders[9]}>{booking.is_ac ? currentContent.acOption : currentContent.nonAcOption}</td>
                                            <td data-label={currentContent.tableHeaders[10]}>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}</td>
                                            <td data-label={currentContent.tableHeaders[11]} >
                                                <div className="bn-table-actions">
                                                    <button 
                                                        className="bn-button bn-view-edit-button" // Class for View/Edit button
                                                        onClick={() => handleOpenBookingModal(booking)} 
                                                        aria-label={`${currentContent.viewEditButton} for booking ${booking.booking_id}`}
                                                    >
                                                        {currentContent.viewEditButton}
                                                    </button>
                                                    {/* Pay Now button: If status is AwaitingPayment and isAllowed is true */}
                                                    {booking.booking_status === 'AwaitingPayment' && booking.isAllowed && (
                                                        <button 
                                                            className="bn-button bn-pay-button" 
                                                            onClick={() => initiatePayNow(booking.booking_id)} 
                                                            aria-label={`${currentContent.payNowButton} for booking ${booking.booking_id}`}
                                                        >
                                                            {currentContent.payNowButton}
                                                        </button>
                                                    )}
                                                    {/* Cancel button: If status is not Cancelled (and not Confirmed - adjust as per business rule) */}
                                                    {booking.booking_status !== 'Cancelled' && booking.booking_status !== 'Confirmed' && (
                                                        <button 
                                                            className="bn-button bn-cancel-button" 
                                                            onClick={() => initiateCancelBooking(booking.booking_id)}
                                                            aria-label={`${currentContent.cancelButton} booking ${booking.booking_id}`}
                                                        >
                                                            {currentContent.cancelButton}
                                                        </button>
                                                    )}
                                                    {/* Download Certificate button: Only if status is Confirmed */}
                                                    {booking.booking_status === 'Confirmed' && (
                                                        <button
                                                            className="bn-button bn-download-button"
                                                            onClick={() => openCertificatePreview(booking)}
                                                            aria-label={`${currentContent.downloadButton} for booking ${booking.booking_id}`}
                                                        >
                                                            <DownloadIcon size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <Fragment>
                    <div className="bn-modal-overlay" onClick={handleCloseModal}>
                        <div className="bn-modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="bn-modal-header">
                                <h3>
                                    {modalStep === 1 ? currentContent.disclaimerHeading :
                                     isEditing ? (isViewOnly ? currentContent.viewBookingTitle : currentContent.editButton) :
                                     currentContent.newBookingButton}
                                </h3>
                                <button className="bn-modal-close-button" onClick={handleCloseModal} aria-label={currentContent.closeModalButton}>&times;</button>
                            </div>

                            <div className="bn-modal-body">
                                {modalStep === 1 && (
                                    <div className="bn-disclaimer-content">
                                        {currentContent.disclaimerPoints.map((point, index) => (
                                            <p key={index}><InfoIcon size={16} className="bn-disclaimer-icon" /> {point}</p>
                                        ))}
                                    </div>
                                )}
                                {modalStep === 2 && (
                                    <form id="booking-form-id" onSubmit={handleBookingSubmit} className="bn-booking-form">
                                        {isEditing && (
                                            <div className="bn-form-group bn-form-group-full">
                                                <label htmlFor="booking_id_display">Booking ID:</label>
                                                <input type="text" id="booking_id_display" name="booking_id_display" value={bookingFormData.booking_id} disabled className="bn-input" />
                                            </div>
                                        )}

                                        <div className="bn-form-group">
                                            <label htmlFor="hall_id_string"><BuildingIcon size={16} /> {currentContent.tableHeaders[2]}:</label>
                                            {loadingHalls ? <p>{currentContent.loadingHallsMessage}</p> : hallsError ? <p className="bn-error-text">{hallsError}</p> : (
                                                <select id="hall_id_string" name="hall_id_string" value={bookingFormData.hall_id_string} onChange={handleBookingFormChange} required 
                                                        disabled={isViewOnly || loadingHalls} className="bn-select">
                                                    <option value="">{currentContent.selectHallPlaceholder}</option>
                                                    {availableHalls.map((hall) => (<option key={hall.hall_id} value={hall.hall_id}>{hall.hall_name}</option>))}
                                                </select>
                                            )}
                                        </div>

                                        <div className="bn-form-group">
                                            <label htmlFor="booking_date"><CalendarDays size={16} /> {currentContent.tableHeaders[10]}:</label>
                                            <input type="date" id="booking_date" name="booking_date" value={bookingFormData.booking_date} onChange={handleBookingFormChange} required 
                                                   disabled={isViewOnly} className="bn-input" min={new Date().toISOString().split("T")[0]} />
                                        </div>

                                        <div className="bn-form-group">
                                            <label htmlFor="floor">{currentContent.tableHeaders[3]}:</label>
                                            <input type="number" id="floor" name="floor" value={bookingFormData.floor} onChange={handleBookingFormChange} className="bn-input" min="1" 
                                                   disabled={isViewOnly || !isHallSelected || !selectedHallFullDetails} max={selectedHallFullDetails?.total_floors} />
                                        </div>
                                        
                                        <div className="bn-form-group">
                                            <label><ZapIcon size={16} /> {currentContent.acNonAcLabel}</label>
                                            <div className="bn-radio-group-container">
                                                <div className="bn-radio-group">
                                                    <input type="radio" id="ac-yes" name="is_ac_radio" value="true" checked={isAcSelected === true} onChange={handleBookingFormChange} 
                                                           disabled={isViewOnly || !isHallSelected} />
                                                    <label htmlFor="ac-yes">{currentContent.acOption}</label>
                                                </div>
                                                <div className="bn-radio-group">
                                                    <input type="radio" id="ac-no" name="is_ac_radio" value="false" checked={isAcSelected === false} onChange={handleBookingFormChange} 
                                                           disabled={isViewOnly || !isHallSelected} />
                                                    <label htmlFor="ac-no">{currentContent.nonAcOption}</label>
                                                </div>
                                            </div>
                                        </div>

                                        {loadingHallDetails && <p className="bn-message bn-loading-message">{currentContent.loadingDetailsMessage}</p>}
                                        {hallDetailsError && <p className="bn-message bn-error-message">{hallDetailsError}</p>}
                                        
                                        {selectedHallFullDetails && (
                                            <div className="bn-pricing-display bn-form-group-full">
                                                <h4>{selectedHallFullDetails.hall_name} - {currentContent.details}</h4>
                                                <div className="bn-hall-info">
                                                    <span><MapPinIcon size={14}/> {selectedHallFullDetails.location}</span>
                                                    <span><UsersIcon size={14}/> Capacity: {selectedHallFullDetails.capacity}</span>
                                                    <span><BuildingIcon size={14}/> Floors: {selectedHallFullDetails.total_floors}</span>
                                                    {selectedHallFullDetails.total_area_sqft && <span><i className="fas fa-ruler-combined" style={{marginRight: '5px'}}></i> Area: {selectedHallFullDetails.total_area_sqft} sq.ft</span>}
                                                    {typeof selectedHallFullDetails.num_ac_rooms === 'number' && <span><HomeIcon size={14}/> AC Rooms: {selectedHallFullDetails.num_ac_rooms}</span>}
                                                    {typeof selectedHallFullDetails.num_non_ac_rooms === 'number' && <span><HomeIcon size={14}/> Non-AC Rooms: {selectedHallFullDetails.num_non_ac_rooms}</span>}
                                                </div>
                                                {selectedHallFullDetails.description && <p className="bn-hall-description">{selectedHallFullDetails.description}</p>}

                                                {renderPriceTable(currentContent.fixedPriceBlocksHeading, selectedHallFullDetails, isAcSelected, false)}
                                                {selectedHallFullDetails.event_pricing && selectedHallFullDetails.event_pricing.length > 0 && renderPriceTable(currentContent.eventSpecificPricingHeading, selectedHallFullDetails.event_pricing, isAcSelected, true)}
                                            </div>
                                        )}

                                        {selectedHallFullDetails && typeof selectedHallFullDetails.num_ac_rooms === 'number' && selectedHallFullDetails.num_ac_rooms > 0 && (
                                            <div className="bn-form-group">
                                                <label htmlFor="num_ac_rooms_booked">
                                                    <HomeIcon size={16} /> {currentContent.numAcRoomsLabel}{' '}
                                                    <span className="bn-form-hint">
                                                        {currentContent.availableRoomsText(selectedHallFullDetails.num_ac_rooms)}
                                                    </span>
                                                </label>
                                                <input
                                                    type="number" id="num_ac_rooms_booked" name="num_ac_rooms_booked"
                                                    value={bookingFormData.num_ac_rooms_booked} onChange={handleBookingFormChange}
                                                    className="bn-input" min="0" max={selectedHallFullDetails.num_ac_rooms}
                                                    disabled={isViewOnly || !isHallSelected}
                                                />
                                            </div>
                                        )}

                                        {selectedHallFullDetails && typeof selectedHallFullDetails.num_non_ac_rooms === 'number' && selectedHallFullDetails.num_non_ac_rooms > 0 && (
                                            <div className="bn-form-group">
                                                <label htmlFor="num_non_ac_rooms_booked">
                                                    <HomeIcon size={16} /> {currentContent.numNonAcRoomsLabel}{' '}
                                                    <span className="bn-form-hint">
                                                        {currentContent.availableRoomsText(selectedHallFullDetails.num_non_ac_rooms)}
                                                    </span>
                                                </label>
                                                <input
                                                    type="number" id="num_non_ac_rooms_booked" name="num_non_ac_rooms_booked"
                                                    value={bookingFormData.num_non_ac_rooms_booked} onChange={handleBookingFormChange}
                                                    className="bn-input" min="0" max={selectedHallFullDetails.num_non_ac_rooms}
                                                    disabled={isViewOnly || !isHallSelected}
                                                />
                                            </div>
                                        )}


                                        <div className="bn-form-group">
                                            <label htmlFor="function_type">{currentContent.tableHeaders[4]}:</label>
                                            <select 
                                                id="function_type" name="function_type" value={bookingFormData.function_type} 
                                                onChange={handleBookingFormChange} required className="bn-select" 
                                                disabled={isViewOnly || !isHallSelected || !selectedHallFullDetails?.event_pricing || selectedHallFullDetails.event_pricing.length === 0}
                                            >
                                                <option value="">{currentContent.selectFunctionPlaceholder}</option>
                                                {selectedHallFullDetails?.event_pricing?.map((event) => (<option key={event.event_type} value={event.event_type}>{event.event_type}</option>))}
                                            </select>
                                        </div>
                                        
                                        {isFunctionTypeEvent && (
                                            <Fragment>
                                                <div className="bn-form-group">
                                                    <label htmlFor="selected_area_option">{currentContent.areaOptionLabel}</label>
                                                    <select
                                                        id="selected_area_option" name="selected_area_option" value={selectedAreaOption}
                                                        onChange={handleBookingFormChange} className="bn-select"
                                                        disabled={isViewOnly || !isHallSelected || !isFunctionTypeSelected}
                                                    >
                                                        <option value="none">Select Option</option>
                                                        {selectedHallFullDetails?.total_area_sqft > 0 && <option value="full">{currentContent.areaOptionFull}</option>}
                                                        {selectedHallFullDetails?.total_area_sqft > 0 && <option value="half">{currentContent.areaOptionHalf}</option>}
                                                        <option value="partial">{currentContent.areaOptionPartial}</option>
                                                    </select>
                                                </div>
                                                <div className="bn-form-group">
                                                    <label htmlFor="area_sqft">{currentContent.areaSqftLabel}</label>
                                                    <input
                                                        type="number" id="area_sqft" name="area_sqft" value={bookingFormData.area_sqft}
                                                        onChange={handleBookingFormChange} min="1" required={selectedAreaOption !== 'none'}
                                                        readOnly={(selectedAreaOption === 'full' || selectedAreaOption === 'half')}
                                                        className="bn-input" placeholder={selectedAreaOption === 'partial' ? 'Enter area in sq.ft.' : ''}
                                                        disabled={isViewOnly || !isHallSelected || !isFunctionTypeSelected || selectedAreaOption === 'none' || (selectedAreaOption !== 'partial')}
                                                    />
                                                </div>
                                            </Fragment>
                                        )}
                                        
                                        <div className="bn-form-group bn-form-group-full">
                                            <label>{currentContent.bookingTypeLabel}</label>
                                            <div className="bn-radio-group-container bn-booking-type-options">
                                                {[
                                                    { value: 'municipal', label: currentContent.municipalType },
                                                    { value: 'municipality', label: currentContent.municipalityType },
                                                    { value: 'panchayat', label: currentContent.panchayatType }
                                                ].map(type => (
                                                    <div className="bn-radio-group" key={type.value}>
                                                        <input type="radio" id={`booking-type-${type.value}`} name="booking_type_radio" value={type.value} checked={bookingFormData.booking_type === type.value} 
                                                               onChange={handleBookingFormChange} required disabled={isViewOnly || !isHallSelected} />
                                                        <label htmlFor={`booking-type-${type.value}`}>{type.label}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div className="bn-form-group bn-form-group-full">
                                            <label>{currentContent.optionalAddonsLabel}</label>
                                            <div className="bn-checkbox-group-container">
                                                {[
                                                    { name: 'is_parking', label: currentContent.parkingOption, available: selectedHallFullDetails?.parking },
                                                    { name: 'is_conference_hall', label: currentContent.conferenceHallOption, available: selectedHallFullDetails?.conference_hall_ac || selectedHallFullDetails?.conference_hall_nonac },
                                                    { name: 'is_food_prep_area', label: currentContent.foodPrepAreaOption, available: selectedHallFullDetails?.food_prep_area_ac || selectedHallFullDetails?.food_prep_area_nonac },
                                                    { name: 'is_lawn', label: currentContent.lawnOption, available: selectedHallFullDetails?.lawn_ac || selectedHallFullDetails?.lawn_nonac }
                                                ].filter(addon => addon.available).map(addon => (
                                                    <div className="bn-checkbox-group" key={addon.name}>
                                                        <input type="checkbox" id={addon.name} name={addon.name} checked={bookingFormData[addon.name]} onChange={handleBookingFormChange} 
                                                               disabled={isViewOnly || !isHallSelected || !isBookingTypeSelected} />
                                                        <label htmlFor={addon.name}>{addon.label}</label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bn-form-group bn-form-group-full bn-calculated-amount-group">
                                            <label><DollarSignIcon size={18} /> {currentContent.calculatedAmountLabel}</label>
                                            <input type="text" value={`Rs. ${bookingFormData.booking_amount.toFixed(2)}`} readOnly className="bn-input bn-calculated-amount" />
                                        </div>

                                        {/* CAPTCHA Section - only if creating new or editing, not for viewOnly */}
                                        {!isViewOnly && renderCaptchaSection()}
                                    </form>
                                )}
                            </div>

                            <div className="bn-modal-footer">
                                {modalStep === 1 && (
                                    <Fragment>
                                        <button className="bn-button bn-modal-action-button bn-modal-cancel-button" onClick={handleCloseModal}>{currentContent.disclaimerCloseButton}</button>
                                        <button className="bn-button bn-modal-action-button bn-proceed-button" onClick={handleDisclaimerAgreedInModal}>{currentContent.disclaimerAgreeButton}</button>
                                    </Fragment>
                                )}
                                {modalStep === 2 && (
                                    <Fragment>
                                        <button className="bn-button bn-modal-action-button bn-modal-cancel-button" onClick={handleCloseModal}>
                                            {isViewOnly ? currentContent.closeButtonText : currentContent.cancelButton}
                                        </button>
                                        {!isViewOnly && ( 
                                            <button type="submit" className="bn-button bn-modal-action-button bn-submit-button" form="booking-form-id" 
                                                    disabled={loadingHallDetails || !selectedHallFullDetails || !captchaToken || hallsError || !!captchaError}>
                                                {isEditing ? currentContent.updateBookingButton : currentContent.createBookingButton}
                                            </button>
                                        )}
                                    </Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                </Fragment>
            )}

            {/* Certificate Preview Modal - CAPTCHA REMOVED */}
            {showCertificatePreviewModal && currentBookingForCertificate && (
                <div 
                    className="bn-modal-overlay" 
                    onClick={() => { setShowCertificatePreviewModal(false); setCurrentBookingForCertificate(null);}}
                >
                    <div 
                        className="bn-modal-content bn-certificate-preview-modal"
                        onClick={(e) => e.stopPropagation()} 
                        style={{maxWidth: '850px', maxHeight: '95vh'}}
                    >
                        <div className="bn-modal-header">
                            <h3>{currentContent.previewModalTitle}</h3>
                            <button 
                                className="bn-modal-close-button" 
                                onClick={() => { setShowCertificatePreviewModal(false); setCurrentBookingForCertificate(null);}} 
                                aria-label={currentContent.previewModalCloseButton}
                            >
                                &times;
                            </button>
                        </div>
                        <div 
                            className="bn-modal-body" 
                            style={{ padding: '20px', overflowY: 'auto' }}
                        >
                             <div 
                                style={{ padding: 0, overflowY: 'auto', backgroundColor: 'var(--user-dl-gray-lightest)' }}
                                ref={certificatePreviewRef}
                            >
                                <BookingCertificate
                                    bookingDetails={{
                                        ...currentBookingForCertificate,
                                        hall_id_string: currentBookingForCertificate.hall_display_name || 'N/A', // Use display name
                                        createdAt: currentBookingForCertificate.createdAt 
                                    }}
                                    userName={user?.name || 'N/A'}
                                />
                            </div>
                             {/* CAPTCHA Section REMOVED from Certificate Download */}
                        </div>
                        <div className="bn-modal-footer">
                            <button 
                                className="bn-button bn-modal-action-button bn-modal-cancel-button" 
                                onClick={() => { setShowCertificatePreviewModal(false); setCurrentBookingForCertificate(null);}}
                            >
                                {currentContent.previewModalCloseButton}
                            </button>
                            <button
                                className="bn-button bn-modal-action-button bn-submit-button"
                                onClick={downloadCertificateFromPreview}
                                // No captchaToken check needed here anymore
                            >
                                <DownloadIcon size={16} /> {currentContent.previewModalDownloadButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirmModal && (
                <div className="bn-modal-overlay" onClick={() => {setShowCancelConfirmModal(false); setBookingIdToCancelState(null); setCaptchaInput(''); setCaptchaError('');}}>
                    <div className="bn-modal-content" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
                        <div className="bn-modal-header">
                            <h3>{currentContent.confirmCancellationTitle}</h3>
                            <button 
                                className="bn-modal-close-button" 
                                onClick={() => {setShowCancelConfirmModal(false); setBookingIdToCancelState(null); setCaptchaInput(''); setCaptchaError('');}}
                                aria-label={currentContent.closeModalButton}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="bn-modal-body">
                            <p style={{marginBottom: '20px'}}>{currentContent.confirmCancelMessage}</p>
                            {renderCaptchaSection(currentContent.confirmActionPrompt(languageType === 'en' ? 'cancel this booking' : 'यह बुकिंग रद्द करें'))}
                        </div>
                        <div className="bn-modal-footer">
                            <button 
                                onClick={() => {setShowCancelConfirmModal(false); setBookingIdToCancelState(null); setCaptchaInput(''); setCaptchaError('');}} 
                                className="bn-button bn-modal-action-button bn-modal-cancel-button"
                            >
                                {currentContent.dismissButtonText}
                            </button>
                            <button 
                                onClick={confirmAndExecuteCancelBooking} 
                                className="bn-button bn-modal-action-button bn-submit-button"
                                disabled={!captchaToken || !!captchaError} 
                            >
                                {currentContent.confirmCancelButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pay Now Confirmation Modal */}
            {showPayNowConfirmModal && (
                <div className="bn-modal-overlay" onClick={() => {setShowPayNowConfirmModal(false); setBookingIdToPayState(null); setCaptchaInput(''); setCaptchaError('');}}>
                    <div className="bn-modal-content" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
                        <div className="bn-modal-header">
                            <h3>{currentContent.confirmPaymentTitle}</h3>
                            <button 
                                className="bn-modal-close-button" 
                                onClick={() => {setShowPayNowConfirmModal(false); setBookingIdToPayState(null); setCaptchaInput(''); setCaptchaError('');}}
                                aria-label={currentContent.closeModalButton}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="bn-modal-body">
                            <p style={{marginBottom: '20px'}}>{currentContent.confirmPayMessage}</p>
                            {renderCaptchaSection(currentContent.confirmActionPrompt(languageType === 'en' ? 'pay for this booking' : 'इस बुकिंग के लिए भुगतान करें'))}
                        </div>
                        <div className="bn-modal-footer">
                            <button 
                                onClick={() => {setShowPayNowConfirmModal(false); setBookingIdToPayState(null); setCaptchaInput(''); setCaptchaError('');}} 
                                className="bn-button bn-modal-action-button bn-modal-cancel-button"
                            >
                                {currentContent.dismissButtonText}
                            </button>
                            <button 
                                onClick={confirmAndExecutePayNow} 
                                className="bn-button bn-modal-action-button bn-submit-button" 
                                disabled={!captchaToken || !!captchaError} 
                            >
                                {currentContent.confirmPayButtonText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default BookNowSection;