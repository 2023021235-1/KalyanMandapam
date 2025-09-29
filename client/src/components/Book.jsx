import React, { useState, useEffect, Fragment, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/BookNow.css';
import { RefreshCcw,CircleCheck,Clock, CircleX, CircleDot, CalendarDays, Edit3, XSquare, PlusCircle, AlertTriangle, Info as InfoIcon, Building as BuildingIcon, DollarSign as DollarSignIcon, Zap as ZapIcon, Users as UsersIcon, MapPin as MapPinIcon, X as CloseIcon, Download as DownloadIcon, Home as HomeIcon, RefreshCw } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import BookingCertificate from './BookingCertificate'; // Import the new certificate component

const BookNowSection = ({ languageType = 'en', user }) => {
    const navigate = useNavigate();

    // --- State Management ---
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
    
    // --- Simplified Form Data State ---
    const [bookingFormData, setBookingFormData] = useState({
        hall_id_string: '',
        booking_date: '',
    });

    const [editingBookingId, setEditingBookingId] = useState(null);
    const [isViewOnly, setIsViewOnly] = useState(false);

    // Certificate, Toast, CAPTCHA, and Confirmation Modals State
    const [showCertificatePreviewModal, setShowCertificatePreviewModal] = useState(false);
    const [currentBookingForCertificate, setCurrentBookingForCertificate] = useState(null);
    const certificatePreviewRef = useRef();
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");
    const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
    const [bookingIdToCancelState, setBookingIdToCancelState] = useState(null);
    const [showPayNowConfirmModal, setShowPayNowConfirmModal] = useState(false);
    const [bookingIdToPayState, setBookingIdToPayState] = useState(null);

    // --- API and Auth ---
    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';
    const API_BASE_URL2 = 'https://kalyanmandapam.onrender.com/';
    const getAuthToken = () => localStorage.getItem('token');

    // --- Toast Notifications ---
    const showToast = (message, type = 'info', duration = 4000) => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), duration);
    };
    const closeToast = () => setToast(prev => ({ ...prev, show: false }));

    // --- Content (i18n) ---
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
            tableHeaders: ['S.No.', 'Booking ID', 'Hall Name', 'Amount', 'Status', 'Transaction ID', 'Paid', 'Date', 'Actions'],
            editButton: 'Edit Booking',
            viewEditButton: 'View/Edit',
            viewBookingTitle: 'View Booking Details',
            updateBookingButton: 'Update Booking',
            createBookingButton: 'Submit Application',
            closeButtonText: 'Close',
            cancelButton: 'Cancel',
            payNowButton: 'Pay Now',
            downloadButton: 'Download Certificate',
            noBookingsMessage: 'No bookings found. Click "New Booking" to get started!',
            loadingMessage: 'Loading...',
            errorMessage: 'An error occurred.',
            selectHallPlaceholder: 'Select a Hall...',
            loadingHallsMessage: 'Loading available halls...',
            hallsErrorMessage: 'Failed to load halls.',
            loadingDetailsMessage: 'Fetching hall details...',
            detailsErrorMessage: 'Could not fetch hall details.',
            formValidation: {
                hallRequired: 'Please select a hall.',
                dateRequired: 'Please select a booking date.',
            },
            bookingSuccess: 'Booking application submitted successfully! Awaiting admin approval.',
            updateSuccess: 'Booking updated successfully!',
            cancelSuccess: 'Booking cancelled successfully!',
            paymentSuccess: 'Payment successful! Booking confirmed.',
            errorPrefix: 'Error: ',
            authError: 'Authentication failed. Please log in again.',
            bookingNotFound: 'Booking not found.',
            // ... other content entries
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
            verifyPaymentButton: 'Verify' ,
        },
        // Hindi translations would go here
    }), [languageType]);
    const currentContent = content[languageType] || content.en;

    // --- CAPTCHA Logic ---
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
    // --- Data Fetching Hooks ---
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
            fetchHallFullDetails(bookingFormData.hall_id_string);
        } else {
            setSelectedHallFullDetails(null);
        }
    }, [bookingFormData.hall_id_string]);
    
    useEffect(() => {
        // Fetch CAPTCHA for modals
        if ((showModal && modalStep === 2 && !isViewOnly) || showCancelConfirmModal || showPayNowConfirmModal) {
            fetchNewCaptcha();
        }
    }, [showModal, modalStep, isViewOnly, showCancelConfirmModal, showPayNowConfirmModal]);

    // --- Core Data Fetching Functions ---
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
             const bookingsWithHallNames = data.map(booking => ({
                ...booking,
                hall_display_name: booking.hall_id ? booking.hall_id.hall_name : 'N/A',
            }));
            setBookings(bookingsWithHallNames);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookingError(`${currentContent.errorPrefix}${error.message}`);
        } finally {
            setLoadingBookings(false);
        }
    };
    const fetchAllHalls = async () => {
        setLoadingHalls(true);
        setHallsError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/halls`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setAvailableHalls(data);
        } catch (error) {
            console.error('Error fetching halls:', error);
            setHallsError(currentContent.hallsErrorMessage);
        } finally {
            setLoadingHalls(false);
        }
    };
    const fetchHallFullDetails = async (hallId) => {
        setLoadingHallDetails(true);
        setHallDetailsError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/halls/${hallId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setSelectedHallFullDetails(data);
        } catch (error) {
            setHallDetailsError(currentContent.detailsErrorMessage);
            setSelectedHallFullDetails(null);
        } finally {
            setLoadingHallDetails(false);
        }
    };

    // --- Modal and Form Handling ---
    const resetFormData = () => {
        setBookingFormData({
            hall_id_string: '',
            booking_date: '',
        });
        setSelectedHallFullDetails(null);
        setHallDetailsError(null);
        setCaptchaInput('');
        setCaptchaError('');
        setIsViewOnly(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setIsEditing(false);
        setEditingBookingId(null);
        resetFormData();
    };

    const handleNewBookingClick = () => {
        setIsEditing(false);
        setIsViewOnly(false);
        resetFormData();
        setModalStep(1);
        setShowModal(true);
    };

    const handleBookingFormChange = (e) => {
        if (isViewOnly) return;
        const { name, value } = e.target;
        setBookingFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (isViewOnly) return;

        const token = getAuthToken();
        if (!token) {
            showToast(currentContent.authError, 'error');
            return navigate('/login');
        }

        // Simplified validation
        if (!bookingFormData.hall_id_string) {
            showToast(currentContent.formValidation.hallRequired, 'error');
            return;
        }
        if (!bookingFormData.booking_date) {
            showToast(currentContent.formValidation.dateRequired, 'error');
            return;
        }

        const actualSubmitLogic = async () => {
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `${API_BASE_URL}/bookings/${editingBookingId}` : `${API_BASE_URL}/bookings`;
            
            // Simplified request body
            const requestBody = {
                hall_id: bookingFormData.hall_id_string,
                booking_date: bookingFormData.booking_date,
            };

            try {
                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(requestBody),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || `HTTP error! status: ${response.status}`);
                }
                await fetchBookings();
                handleCloseModal();
                showToast(isEditing ? currentContent.updateSuccess : currentContent.bookingSuccess, 'success');
            } catch (error) {
                console.error('Error saving booking:', error);
                showToast(`${currentContent.errorPrefix}${error.message}`, 'error');
                fetchNewCaptcha(); // Refresh CAPTCHA on error
            }
        };
        await verifyCaptchaAndProceed(actualSubmitLogic);
    };

    const handleOpenBookingModal = async (booking) => {
        const viewMode = booking.booking_status !== 'Pending-Approval';
        setIsEditing(true);
        setIsViewOnly(viewMode);
        setEditingBookingId(booking.booking_id); // Use booking_id for API calls

        // The hall_id is now a direct reference
        const hallIdForModal = booking.hall_id?._id || null;
        
        if (hallIdForModal) {
            await fetchHallFullDetails(hallIdForModal);
        }

        // Set simplified form data
        setBookingFormData({
            hall_id_string: hallIdForModal || '',
            booking_date: booking.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : '',
        });

        setModalStep(2);
        setShowModal(true);
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
//     // --- Action Handlers (Cancel, Pay, Certificate) ---
//    const calculateBookingAmount = useMemo(() => () => {
//         let totalAmount = 0;
//         if (!selectedHallFullDetails || !bookingFormData.booking_type) return 0;

//         const hall = selectedHallFullDetails;
//         const bookingType = bookingFormData.booking_type;

//         if (bookingFormData.is_parking && hall.parking) totalAmount += getTieredPrice(hall.parking, bookingType);
//         if (bookingFormData.is_conference_hall && (isAcSelected ? hall.conference_hall_ac : hall.conference_hall_nonac)) totalAmount += getTieredPrice(isAcSelected ? hall.conference_hall_ac : hall.conference_hall_nonac, bookingType);
//         if (bookingFormData.is_food_prep_area && (isAcSelected ? hall.food_prep_area_ac : hall.food_prep_area_nonac)) totalAmount += getTieredPrice(isAcSelected ? hall.food_prep_area_ac : hall.food_prep_area_nonac, bookingType);
//         if (bookingFormData.is_lawn && (isAcSelected ? hall.lawn_ac : hall.lawn_nonac)) totalAmount += getTieredPrice(isAcSelected ? hall.lawn_ac : hall.lawn_nonac, bookingType);
        
//         if (bookingFormData.num_ac_rooms_booked > 0 && hall.room_rent_ac) {
//             totalAmount += Number(bookingFormData.num_ac_rooms_booked) * getTieredPrice(hall.room_rent_ac, bookingType);
//         }
//         if (bookingFormData.num_non_ac_rooms_booked > 0 && hall.room_rent_nonac) {
//             totalAmount += Number(bookingFormData.num_non_ac_rooms_booked) * getTieredPrice(hall.room_rent_nonac, bookingType);
//         }

//         if (isAcSelected ? hall.electricity_ac : hall.electricity_nonac) totalAmount += getTieredPrice(isAcSelected ? hall.electricity_ac : hall.electricity_nonac, bookingType);
//         if (hall.cleaning) totalAmount += getTieredPrice(hall.cleaning, bookingType);

//         if (bookingFormData.function_type && Number(bookingFormData.area_sqft) > 0) {
//             const eventPrice = hall.event_pricing?.find(event =>
//                 event.event_type.toLowerCase() === bookingFormData.function_type.toLowerCase()
//             );
//             if (eventPrice) {
//                 const perSqftPrices = isAcSelected ? eventPrice.prices_per_sqft_ac : eventPrice.prices_per_sqft_nonac;
//                 if (perSqftPrices) {
//                     const perSqftRate = getTieredPrice(perSqftPrices, bookingType);
//                     totalAmount += (Number(bookingFormData.area_sqft) * perSqftRate);
//                 }
//             }
//         }
//         return parseFloat(totalAmount.toFixed(2));
//     }, [
//         selectedHallFullDetails, 
//         isAcSelected, 
//         bookingFormData.booking_type, 
//         bookingFormData.function_type, 
//         bookingFormData.area_sqft, 
//         bookingFormData.is_parking, 
//         bookingFormData.is_conference_hall, 
//         bookingFormData.is_food_prep_area, 
//         bookingFormData.is_lawn,
//         bookingFormData.num_ac_rooms_booked,
//         bookingFormData.num_non_ac_rooms_booked,
//     ]);

    const handleVerifyPayment = async (licenseId, paymentReferenceNo) => {
const token = getAuthToken();
    if (!token) {   
        alert(languageType === 'en' ? 'Authentication failed. Please log in again.' : 'प्रमाणीकरण विफल। कृपया पुनः लॉग इन करें।');
        navigate('/login');
        return;
    }

    if (!paymentReferenceNo) {
      alert(languageType === 'en' ? 'Payment reference number is not available.' : 'भुगतान संदर्भ संख्या उपलब्ध नहीं है।');
      return;
    }

    try {
  
      // Construct the URL with pgreferenceno as a query parameter
      const verificationUrl = `${API_BASE_URL2}verify-eazypay-payment?pgreferenceno=${paymentReferenceNo}`;

      const response = await fetch(verificationUrl, {
        method: 'GET', // Changed to GET
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        // Removed body as it's a GET request
      });

      const data = await response.json();

      if (response.ok) {
        alert(languageType === 'en' ? data.message || 'Payment verification successful!' : data.message || 'भुगतान सत्यापन सफल रहा!');
       // console.log("Payment verification successful:", data);
        fetchBookings();// Refresh the list to show updated status
      } else {
        alert(languageType === 'en' ? data.message || 'Payment verification failed.' : data.message || 'भुगतान सत्यापन विफल रहा।');
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert(languageType === 'en' ? 'An error occurred during payment verification.' : 'भुगतान सत्यापन के दौरान एक त्रुटि हुई।');
    }
  };
    // useEffect(() => {
    //     if (!isViewOnly) { // Only calculate and update if not in view-only mode
    //         const calculatedAmount = calculateBookingAmount();
    //         setBookingFormData(prevData => ({
    //             ...prevData,
    //             booking_amount: calculatedAmount,
    //             is_ac: isAcSelected,
    //         }));
    //     }
    // }, [
    //     isAcSelected,
    //     calculateBookingAmount,
    //     isViewOnly // Add isViewOnly to dependency array
    // ]);






   

    const handleDisclaimerAgreedInModal = () => {
        setModalStep(2);
    }


 

    
  

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
                  //  console.log('EazyPay DATA:', data);
                    if(data.success === false) {
                        showToast(data.message,'error');
          return

                    }
                     const  eazypayUrl  =data.url;
                     if (eazypayUrl) {
                     window.open(eazypayUrl, '_blank'); 
        
                showToast(currentContent.paymentSuccess, 'success');
                setShowPayNowConfirmModal(false);
                setBookingIdToPayState(null);
                setCaptchaInput(''); 
                setTimeout(async() => {
                       await fetchBookings(); 
                }, 60000); 
             
      } else {
        console.error("Payment URL is empty or undefined.");
        showToast('Failed to get payment URL from server.', 'error');

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
                                        <tr key={booking._id}>
                                            <td data-label={currentContent.tableHeaders[0]}>{index + 1}</td>
                                            <td data-label={currentContent.tableHeaders[1]}>{booking.booking_id}</td>
                                            <td data-label={currentContent.tableHeaders[2]}>{booking.hall_display_name}</td>
                                            <td data-label={currentContent.tableHeaders[3]}>Rs. {booking.booking_amount?.toFixed(2)}</td>
                                                <td data-label={currentContent.tableHeaders[6]} className="bn-table-status-cell">
    {booking.booking_status === 'Confirmed' && <span className="bn-status-indicator bn-status-confirmed"><CircleCheck size={16} />{booking.booking_status}</span>}
    {booking.booking_status === 'Cancelled' && <span className="bn-status-indicator bn-status-rejected"><CircleX size={16} />{booking.booking_status}</span>}
    {booking.booking_status === 'Pending-Approval' && <span className="bn-status-indicator bn-status-pending"><CircleDot size={16} />{booking.booking_status}</span>}
    
    {/* AwaitingPayment status without the nested button */}
    {booking.booking_status === 'AwaitingPayment' && <span className="bn-status-indicator bn-status-awaiting-payment"><Clock size={16} />{booking.booking_status}</span>}
    
    {/* New separate condition for Payment-Processing */}
    {booking.booking_status === 'Payment-Processing' && (
        <span className="bn-status-indicator bn-status-awaiting-payment"> {/* Re-using a suitable style */}
            <Clock size={16} />
            {booking.booking_status}
            {booking.transaction_id && (
                <button
                  className="user-dl-verify-payment-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerifyPayment(booking._id, booking.transaction_id);
                  }}
                  title={currentContent.verifyPaymentButton}
                >
                  <RefreshCcw size={14} />
                 
                </button>
            )}
        </span>
    )}

    {/* The fallback list of statuses is updated */}
    {!['Pending-Approval', 'AwaitingPayment', 'Confirmed', 'Cancelled','Payment-Processing','Payment-Failed','Refunded', 'Refund-Pending'].includes(booking.booking_status) && <span>{booking.booking_status}</span>}
</td>
                                            <td data-label={currentContent.tableHeaders[5]}>{booking.transaction_id || 'N/A'}</td>
                                            <td data-label={currentContent.tableHeaders[6]}>{booking.isPaid ? 'Yes' : 'No'}</td>
                                            <td data-label={currentContent.tableHeaders[7]}>{new Date(booking.booking_date).toLocaleDateString()}</td>
                                            <td data-label={currentContent.tableHeaders[8]}>
                                                  <div className="bn-table-actions">
                                                    <button 
                                                        className="bn-button bn-view-edit-button" // Class for View/Edit button
                                                        onClick={() => handleOpenBookingModal(booking)} 
                                                        aria-label={`${currentContent.viewEditButton} for booking ${booking.booking_id}`}
                                                    >
                                                        {currentContent.viewEditButton}
                                                    </button>
                                                    {/* Pay Now button: If status is AwaitingPayment and isAllowed is true */}
                                                    {(booking.booking_status === 'AwaitingPayment' || booking.booking_status === 'Payment-Failed' ) && booking.isAllowed && (
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

            {/* --- Modals --- */}
            {showModal && (
                <div className="bn-modal-overlay" onClick={handleCloseModal}>
                    <div className="bn-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="bn-modal-header">
                            <h3>
                                {modalStep === 1 ? currentContent.disclaimerHeading :
                                 isEditing ? (isViewOnly ? currentContent.viewBookingTitle : currentContent.editButton) :
                                 currentContent.newBookingButton}
                            </h3>
                            <button className="bn-modal-close-button" onClick={handleCloseModal}>&times;</button>
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
                                            <label>Booking ID:</label>
                                            <input type="text" value={isEditing ? bookingFormData.booking_id || editingBookingId : ''} disabled className="bn-input" />
                                        </div>
                                    )}

                                    {/* --- SIMPLIFIED FORM FIELDS --- */}
                                    <div className="bn-form-group">
                                        <label htmlFor="hall_id_string"><BuildingIcon size={16} /> Hall:</label>
                                        <select 
                                            id="hall_id_string" name="hall_id_string" 
                                            value={bookingFormData.hall_id_string} 
                                            onChange={handleBookingFormChange} required
                                            disabled={isViewOnly || loadingHalls} className="bn-select">
                                            <option value="">{currentContent.selectHallPlaceholder}</option>
                                            {availableHalls.map((hall) => (<option key={hall._id} value={hall._id}>{hall.hall_name}</option>))}
                                        </select>
                                        {hallsError && <p className="bn-error-message">{hallsError}</p>}
                                    </div>

                                    <div className="bn-form-group">
                                        <label htmlFor="booking_date"><CalendarDays size={16} /> Booking Date:</label>
                                        <input 
                                            type="date" id="booking_date" name="booking_date" 
                                            value={bookingFormData.booking_date} 
                                            onChange={handleBookingFormChange} required
                                            disabled={isViewOnly} className="bn-input" 
                                            min={new Date().toISOString().split("T")[0]} />
                                    </div>
                                    
                                    {/* --- Display Hall Details & Fixed Price --- */}
                                    {loadingHallDetails && <p className="bn-message bn-loading-message">{currentContent.loadingDetailsMessage}</p>}
                                    {hallDetailsError && <p className="bn-message bn-error-message">{hallDetailsError}</p>}
                                    
                                    {selectedHallFullDetails && (
                                        <div className="bn-pricing-display bn-form-group-full">
                                            <h4>{selectedHallFullDetails.hall_name}</h4>
                                            <div className="bn-hall-info">
                                                <span><MapPinIcon size={14}/> {selectedHallFullDetails.location}</span>
                                            </div>
                                            <div className="bn-form-group bn-calculated-amount-group" style={{marginTop: '1rem'}}>
                                                <label><DollarSignIcon size={18} /> Booking Price:</label>
                                                <input type="text" value={`Rs. ${selectedHallFullDetails.pricing.toFixed(2)}`} readOnly className="bn-input bn-calculated-amount" />
                                            </div>
                                        </div>
                                    )}

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
                                                disabled={loadingHallDetails || !selectedHallFullDetails || !captchaToken}>
                                            {isEditing ? currentContent.updateBookingButton : currentContent.createBookingButton}
                                        </button>
                                    )}
                                </Fragment>
                           )}
                        </div>
                    </div>
                </div>
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