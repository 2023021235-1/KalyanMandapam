import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/BookNow.css';
import { CircleCheck, CircleX, CircleDot } from 'lucide-react'; // Import Lucide Icons

const BookNowSection = ({ languageType = 'en', user }) => {
    const navigate = useNavigate();

    // Renamed state for clarity - controls if the main modal is open
    const [showModal, setShowModal] = useState(false);
    // modalStep 1: Disclaimer, modalStep 2: Booking Form
    const [modalStep, setModalStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState(null);

    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);

    // State to hold the rent options for the selected hall
    const [selectedHallRentOptions, setSelectedHallRentOptions] = useState(null);
    const [loadingHallRent, setLoadingHallRent] = useState(false);
    const [hallRentError, setHallRentError] = useState(null);

    const [bookingFormData, setBookingFormData] = useState({
        booking_id: '', // Keep in state for editing
        hall_id_string: '',
        booking_date: '',
        floor: '',
        function_type: '',
        booking_amount: '', // This will hold the selected or custom amount
        booking_type: '', // This will hold the selected type if a rent option is chosen
        addon_ac_heating: false,
    });

    const [editingBookingId, setEditingBookingId] = useState(null);

    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api'; // Corrected API Base URL

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const content = {
        en: {
            sectionHeading: 'Book Baratghar',
            disclaimerHeading: 'Disclaimer',
            disclaimerPoints: [
                'Before going to book the Barat Ghar please read all the terms & Conditions carefully.',
                'Beneficiary users/citizens are requested to provide the correct information at the time of booking of Barat Ghar, if found any wrong credential or data, booking has been cancelled and penalties will be imposed on immediate as per clause mentioned in the terms & Conditions.',
                'For any technical assistance or any other assistance, please mail us on it@ndmc.gov.in / director.welfare@ndmc.gov.in or contact to Helpdesk of Welfare Department at Ground Floor, New Delhi Municipal Council, Palika Kendra, New Delhi- 110001.',
                'Under Swachh Bharat Mission, the single use of plastic are being ban. To strictly adhere the guidelines of the Swachh Bharat Mission.',
                'The party make own arrangement for valet parking during their function/program, failing which they will be liable amount of Rs. 5000/- to be recovered from the security deposit, as penalty for violation of the said condition.',
                'Further the concern Deputy Manager (CS) of Barat Ghar have been directed to ensure valet parking at the time of handing over the Barat Ghar to the party and in case the arrangement is not made by the Parking Management System Department for providing the valet parking.',
                'Booking is neither transferable nor changeable.',
            ],
            disclaimerAgreeButton: 'Agree and Proceed', // Changed button text
            disclaimerCloseButton: 'Close',
            newBookingButton: 'New Booking',
            previousBookingsHeading: 'All Bookings',
            tableHeaders: ['S.No.', 'Booking Id', 'BaratGhar Name', 'Floor Name', 'Function', 'Total Amount', 'Status', 'Add-On AC/Heating', 'Booking Date', 'Action'],
            cancelButton: 'Cancel',
            noBookingsMessage: 'No bookings found.',
            selectHallPlaceholder: 'Select BaratGhar',
            loadingHallsMessage: 'Loading halls...',
            hallsErrorMessage: 'Failed to load halls.',
            loadingRentMessage: 'Fetching rent options...',
            rentErrorMessage: 'Failed to fetch rent details.',
            rentOptionsLabel: 'Select Rent Type or Enter Amount:',
            commercialRentLabel: 'Commercial Rent:',
            socialRentLabel: 'Social Rent:',
            nonCommercialRentLabel: 'Non-Commercial Rent:',
            enterCustomAmountPlaceholder: 'Enter custom amount',
            confirmCancelMessage: 'Are you sure you want to cancel this booking?',
            bookingTypeLabel: 'Booking Type (Optional):',
            bookingTypeOptions: [
                 { value: 'employee', label: 'Employee of NDMC' },
                 { value: 'ex-employee', label: 'Ex-Employee of NDMC' },
                 { value: 'ndmc-resident', label: 'NDMC Area Resident' },
                 { value: 'non-ndmc-resident', label: 'Non NDMC Area Resident' },
                 { value: 'commercial', label: 'Commercial' },
                 { value: 'social', label: 'Social' },
                 { value: 'non-commercial', label: 'Non-Commercial' },
            ],
             closeModalButton: 'Close Modal' // Added for aria-label
        },
        hi: {
            sectionHeading: 'बारात घर बुक करें',
            disclaimerHeading: 'अस्वीकरण',
            disclaimerPoints: [
                'बारात घर बुक करने से पहले कृपया सभी नियम और शर्तें ध्यान से पढ़ लें।',
                'लाभार्थी उपयोगकर्ताओं/नागरिकों से अनुरोध है कि वे बारात घर की बुकिंग के समय सही जानकारी प्रदान करें, यदि कोई गलत क्रेडेंशियल या डेटा पाया जाता है, तो बुकिंग रद्द कर दी जाएगी और नियम और शर्तों में उल्लिखित खंड के अनुसार तत्काल जुर्माना लगाया जाएगा।',
                'किसी भी तकनीकी सहायता या किसी अन्य सहायता के लिए, कृपया हमें it@ndmc.gov.in / director.welfare@ndmc.gov.in पर मेल करें या भूतल, नई दिल्ली नगरपालिका परिषद, पालिका केंद्र, नई दिल्ली- 110001 पर कल्याण विभाग के हेल्पडेस्क से संपर्क करें।',
                'स्वच्छ भारत मिशन के तहत सिंगल यूज प्लास्टिक पर प्रतिबंध लगाया जा रहा है। स्वच्छ भारत मिशन के दिशानिर्देशों का सख्ती से पालन करें।',
                'पार्टी अपने कार्यक्रम के दौरान वैले पार्किंग की व्यवस्था स्वयं करेगी, ऐसा न करने पर सुरक्षा जमा राशि से 5000/- रुपये की राशि वसूल की जाएगी, जो उक्त शर्त के उल्लंघन के लिए जुर्माना होगा।',
                'आगे संबंधित उपायुक्त (सीएस) बारात घर को बारात घर पार्टी को सौंपते समय वैले पार्किंग सुनिश्चित करने का निर्देश दिया गया है और यदि पार्किंग प्रबंधन प्रणाली विभाग द्वारा वैले पार्किंग की व्यवस्था नहीं की जाती है।',
                'बुकिंग न तो हस्तांतरणीय है और न ही परिवर्तन योग्य है।',
            ],
            disclaimerAgreeButton: 'सहमत और आगे बढ़ें', // Changed button text
            disclaimerCloseButton: 'बंद करें',
            newBookingButton: 'नई बुकिंग',
            previousBookingsHeading: 'सभी बुकिंग',
            tableHeaders: ['क्र.सं.', 'बुकिंग आईडी', 'बारात घर का नाम', 'मंजिल का नाम', 'समारोह', 'कुल राशि', 'स्थिति', 'ऐड-ऑन एसी/हीटिंग', 'बुकिंग तिथि', 'कार्रवाई'],
            cancelButton: 'रद्द करें',
            noBookingsMessage: 'कोई बुकिंग नहीं मिली।',
            selectHallPlaceholder: 'बारात घर चुनें',
            loadingHallsMessage: 'बारात घर लोड हो रहे हैं...',
            hallsErrorMessage: 'बारात घर लोड करने में विफल।',
            loadingRentMessage: 'किराया विकल्प प्राप्त हो रहे हैं...',
            rentErrorMessage: 'किराया विवरण प्राप्त करने में विफल।',
            rentOptionsLabel: 'किराया प्रकार चुनें या राशि दर्ज करें:',
            commercialRentLabel: 'वाणिज्यिक किराया:',
            socialRentLabel: 'सामाजिक किराया:',
            nonCommercialRentLabel: 'गैर-वाणिज्यिक किराया:',
            enterCustomAmountPlaceholder: 'कस्टम राशि दर्ज करें',
            confirmCancelMessage: 'क्या आप वाकई इस बुकिंग को रद्द करना चाहते हैं?',
            bookingTypeLabel: 'बुकिंग प्रकार (वैकल्पिक):',
            bookingTypeOptions: [
                { value: 'employee', label: 'एनडीएमसी का कर्मचारी' },
                { value: 'ex-employee', label: 'एनडीएमसी का पूर्व कर्मचारी' },
                { value: 'ndmc-resident', label: 'एनडीएमसी क्षेत्र निवासी' },
                { value: 'non-ndmc-resident', label: 'गैर एनडीएमसी क्षेत्र निवासी' },
                { value: 'commercial', label: 'वाणिज्यिक' },
                { value: 'social', label: 'सामाजिक' },
                { value: 'non-commercial', label: 'गैर-वाणिज्यिक' },
            ],
             closeModalButton: 'मॉडल बंद करें' // Added for aria-label
        },
    };

    const currentContent = content[languageType] || content.en;

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchBookings();
            fetchAllHalls();
        }
    }, [user, navigate]);

    // Fetch hall rent options when hall is selected
    useEffect(() => {
        if (bookingFormData.hall_id_string) {
            fetchHallRentOptions(bookingFormData.hall_id_string);
        } else {
            setSelectedHallRentOptions(null);
            setHallRentError(null);
        }
    }, [bookingFormData.hall_id_string]);

    const fetchBookings = async () => {
        setLoadingBookings(true);
        setBookingError(null);
        const token = getAuthToken();
        if (!token) {
            setBookingError('Authentication token not found. Cannot fetch bookings.');
            setLoadingBookings(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    console.error('Authentication failed or token expired. Redirecting to login.');
                    navigate('/login');
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookingError(`Failed to fetch bookings: ${error.message}`);
        } finally {
            setLoadingBookings(false);
        }
    };

    // Fetch all halls to populate the dropdown
    const fetchAllHalls = async () => {
        setLoadingHalls(true);
        setHallsError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/halls`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setAvailableHalls(data);
        } catch (error) {
            console.error('Error fetching halls:', error);
            setHallsError(currentContent.hallsErrorMessage);
        } finally {
            setLoadingHalls(false);
        }
    };

    // Fetch rent options for a specific hall
    const fetchHallRentOptions = async (hallId) => {
        setLoadingHallRent(true);
        setHallRentError(null);
        setSelectedHallRentOptions(null); // Clear previous rent options
        try {
            const response = await fetch(`${API_BASE_URL}/halls/${hallId}`);
            if (!response.ok) {
                 if (response.status === 404) {
                     throw new Error(`Hall with ID ${hallId} not found.`);
                 }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Assuming the hall data includes rent_commercial, rent_social, rent_non_commercial
            setSelectedHallRentOptions({
                commercial: data.rent_commercial,
                social: data.rent_social,
                nonCommercial: data.rent_non_commercial,
            });
        } catch (error) {
            console.error('Error fetching hall rent:', error);
            setHallRentError(currentContent.rentErrorMessage);
        } finally {
            setLoadingHallRent(false);
        }
    };

    // Function called when "Agree and Proceed" is clicked in the disclaimer modal
    const handleDisclaimerAgreedInModal = () => {
        setModalStep(2); // Move to the booking form step
    };

    // Function to close the entire modal
    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1); // Reset to disclaimer step for next time
        setIsEditing(false);
        setEditingBookingId(null);
        // Reset form data
        setBookingFormData({
            booking_id: '',
            hall_id_string: '',
            booking_date: '',
            floor: '',
            function_type: '',
            booking_amount: '',
            booking_type: '',
            addon_ac_heating: false,
        });
        setSelectedHallRentOptions(null); // Clear rent options
        setHallRentError(null);
    };

    // When "New Booking" is clicked from the main page
    const handleNewBookingClick = () => {
        setIsEditing(false);
        setEditingBookingId(null);
        // Reset form data for a new booking
        setBookingFormData({
            booking_id: '',
            hall_id_string: '',
            booking_date: '',
            floor: '',
            function_type: '',
            booking_amount: '',
            booking_type: '',
            addon_ac_heating: false,
        });
        setSelectedHallRentOptions(null); // Clear rent options
        setHallRentError(null);
        setModalStep(1); // Start with the disclaimer step
        setShowModal(true); // Show the modal
    };

    const handleBookingFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'hall_id_string') {
             // When hall changes, clear booking_amount and booking_type
             setBookingFormData({
                 ...bookingFormData,
                 [name]: value,
                 booking_amount: '',
                 booking_type: '',
             });
        } else if (name === 'booking_amount_radio') {
             // Handle selection of predefined rent amount
             const [rentType, amount] = value.split('|'); // Assuming value is 'commercial|Rs. 10000'
             setBookingFormData({
                 ...bookingFormData,
                 booking_amount: amount,
                 booking_type: rentType, // Set booking_type based on selected rent type
             });
        }
        // REMOVE OR COMMENT OUT THIS ELSE IF BLOCK:
        // else if (name === 'booking_amount') {
        //     // Handle manual input in the amount field
        //      setBookingFormData({
        //         ...bookingFormData,
        //         booking_amount: value,
        //          // Clear booking_type when manually entering an amount, unless it was already custom
        //         booking_type: (bookingFormData.booking_type === '' || bookingFormData.booking_type === undefined) ? '' : bookingFormData.booking_type,
        //      });
        // }
        else {
             setBookingFormData({
                 ...bookingFormData,
                 [name]: type === 'checkbox' ? checked : value,
             });
        }
    };


    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found. Cannot save booking.');
            return;
        }

        // Basic validation: Hall, Date, Function Type, and Amount are required
        // Note: The user reaches this step AFTER agreeing to the disclaimer in step 1 (for new bookings)
        if (!bookingFormData.hall_id_string || !bookingFormData.booking_date || !bookingFormData.function_type || !bookingFormData.booking_amount) {
             alert(languageType === 'hi' ? 'कृपया सभी आवश्यक बुकिंग विवरण भरें (बारात घर, तिथि, समारोह प्रकार, राशि)।' : 'Please fill in all required booking details (Hall, Date, Function Type, Amount).');
             return;
        }

        const method = isEditing ? 'PUT' : 'POST';
        // For cancelling, we'll use a specific cancel endpoint, not the generic PUT
        const url = isEditing ? `${API_BASE_URL}/bookings/${editingBookingId}` : `${API_BASE_URL}/bookings`;

        // Prepare the request body
        const requestBody = {
            hall_id_string: bookingFormData.hall_id_string,
            booking_date: bookingFormData.booking_date,
            floor: bookingFormData.floor,
            function_type: bookingFormData.function_type,
            booking_amount: bookingFormData.booking_amount,
            booking_type: bookingFormData.booking_type || undefined, // Send booking_type if selected, otherwise undefined
            addon_ac_heating: bookingFormData.addon_ac_heating,
            // For editing, you might include booking_status if the user can change it
            // booking_status: bookingFormData.booking_status,
        };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                 if (response.status === 401) {
                     console.error('Authentication failed or token expired. Redirecting to login.');
                     navigate('/login');
                     return;
                 }
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            fetchBookings(); // Refresh the booking list
            handleCloseModal(); // Close the modal

            alert(isEditing ? (languageType === 'hi' ? 'बुकिंग सफलतापूर्वक अपडेट की गई!' : 'Booking updated successfully!') : (languageType === 'hi' ? 'बुकिंग सफलतापूर्वक बनाई गई!' : 'Booking created successfully!'));

        } catch (error) {
            console.error('Error saving booking:', error);
            alert(`Failed to save booking: ${error.message}`);
        }
    };

    // Function to start editing a booking (skips disclaimer step)
    const startEditBooking = (booking) => {
        setIsEditing(true);
        setEditingBookingId(booking.booking_id);
        // Populate form data from the booking object
        setBookingFormData({
            booking_id: booking.booking_id,
            hall_id_string: booking.hall_id ? booking.hall_id.hall_id : '', // Use hall_id_string from populated hall
            booking_date: booking.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : '',
            floor: booking.floor || '',
            function_type: booking.function_type || '',
            booking_amount: booking.booking_amount || '',
            booking_type: booking.booking_type || '', // Populate existing booking type
            addon_ac_heating: booking.addon_ac_heating || false,
        });
        // Fetch rent options for the hall if hall_id_string is available
        if (booking.hall_id && booking.hall_id.hall_id) {
             fetchHallRentOptions(booking.hall_id.hall_id);
        } else {
             setSelectedHallRentOptions(null);
             setHallRentError(null);
        }
        setModalStep(2); // Go directly to the form for editing
        setShowModal(true); // Show the modal
    };

    // Function to handle cancelling a booking
    const handleCancelBooking = async (bookingIdToCancel) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found. Cannot cancel booking.');
            return;
        }

        if (window.confirm(currentContent.confirmCancelMessage)) {
            try {
                // Use the new cancel endpoint (assuming DELETE is the correct method for cancel)
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingIdToCancel}`, {
                    method: 'DELETE', // Assuming DELETE endpoint for cancellation
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.error('Authentication failed or token expired. Redirecting to login.');
                        navigate('/login');
                        return;
                    }
                     if (response.status === 404) {
                         throw new Error('Booking not found.');
                     }
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                fetchBookings(); // Refresh the booking list

                alert(languageType === 'hi' ? 'बुकिंग सफलतापूर्वक रद्द की गई!' : 'Booking cancelled successfully!');

            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert(`Failed to cancel booking: ${error.message}`);
            }
        }
    };

    return (
        <section className="bn-section">
             <h2 className='main-heading'>{currentContent.sectionHeading}</h2>
         
            <div className="bn-main-content-block">
                <div className="bn-main-header">
                    <h2 ></h2>
                    <button className="bn-button bn-new-booking-button" onClick={handleNewBookingClick}>
                        {currentContent.newBookingButton}
                    </button>
                </div>

                <div className="bn-bookings-list-area">
                    <h4>{currentContent.previousBookingsHeading}</h4>
                    {loadingBookings ? (
                         <p>Loading bookings...</p>
                    ) : bookingError ? (
                         <p style={{ color: 'red' }}>{bookingError}</p>
                    ) : bookings.length === 0 ? (
                        <p className="bn-message">{currentContent.noBookingsMessage}</p>
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
                                        <tr key={booking.booking_id}>
                                            <td>{index + 1}</td>
                                            <td>{booking.booking_id}</td>
                                            <td>{booking.hall_id ? booking.hall_id.hall_name : 'N/A'}</td>
                                            <td>{booking.floor || 'N/A'}</td>
                                            <td>{booking.function_type}</td>
                                            <td>{booking.booking_amount}</td>
                                            {/* Updated Status Cell with Icons and Colors */}
                                            <td className="bn-table-status-cell">
                                                {booking.booking_status === 'Confirmed' && (
                                                    <span className="bn-status-indicator bn-status-confirmed">
                                                        <CircleCheck size={16} /> {/* Adjust size as needed */}
                                                        {booking.booking_status}
                                                    </span>
                                                )}
                                                {booking.booking_status === 'Cancelled' && (
                                                    <span className="bn-status-indicator bn-status-rejected">
                                                        <CircleX size={16} /> {/* Adjust size as needed */}
                                                       {booking.booking_status}
                                                    </span>
                                                )}
                                                {booking.booking_status === 'Pending' && (
                                                    <span className="bn-status-indicator bn-status-pending">
                                                        <CircleDot size={16} /> {/* Adjust size as needed */}
                                                        {booking.booking_status}
                                                    </span>
                                                )}
                                                {/* Add more conditions for other statuses if necessary */}
                                                {!['Confirmed', 'Cancelled', 'Pending'].includes(booking.booking_status) && (
                                                    <span>{booking.booking_status}</span>
                                                )}
                                            </td>
                                            {/* End of Updated Status Cell */}
                                            <td>{booking.addon_ac_heating ? (languageType === 'hi' ? 'हाँ' : 'Yes') : (languageType === 'hi' ? 'नहीं' : 'No')}</td>
                                            <td>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="bn-table-actions"> {/* Added a class for action cell */}
                                                 {/* Edit button */}
                                                 {booking.booking_status !== 'Cancelled' && ( // Only show edit if not cancelled
                                                     <button
                                                         className="bn-button bn-edit-button"
                                                         onClick={() => startEditBooking(booking)}
                                                         aria-label={`Edit booking ${booking.booking_id}`}
                                                     >
                                                         {languageType === 'hi' ? 'संपादित करें' : 'Edit'}
                                                     </button>
                                                 )}
                                                 {/* Cancel button - only show if not already cancelled */}
                                                 {booking.booking_status !== 'Cancelled' && (
                                                     <button
                                                         className="bn-button bn-cancel-button"
                                                         onClick={() => handleCancelBooking(booking.booking_id)}
                                                         aria-label={`Cancel booking ${booking.booking_id}`}
                                                     >
                                                         {currentContent.cancelButton}
                                                     </button>
                                                 )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>


            {/* Booking Modal */}
            {showModal && (
                <Fragment>
                    <div className="bn-modal-overlay">
                        <div className="bn-modal-content">
                            <div className="bn-modal-header">
                                {/* Header changes based on modal step */}
                                <h3>
                                    {modalStep === 1
                                        ? currentContent.disclaimerHeading
                                        : isEditing
                                            ? (languageType === 'hi' ? 'बुकिंग संपादित करें' : 'Edit Booking')
                                            : (languageType === 'hi' ? 'नई बुकिंग' : 'New Booking')
                                    }
                                </h3>
                                <button className="bn-modal-close-button" onClick={handleCloseModal} aria-label={currentContent.closeModalButton}>
                                    &times;
                                </button>
                            </div>

                            <div className="bn-modal-body">
                                {/* Modal Step 1: Disclaimer */}
                                {modalStep === 1 && (
                                    <div className="bn-disclaimer-content">
                                        {currentContent.disclaimerPoints.map((point, index) => (
                                            <p key={index}>{`(${index + 1}). ${point}`}</p>
                                        ))}
                                    </div>
                                )}

                                {/* Modal Step 2: Booking Form */}
                                {modalStep === 2 && (
                                    <form id="booking-form-id" onSubmit={handleBookingSubmit} className="bn-booking-form"> {/* Added id to the form */}
                                        {isEditing && (
                                            <div className="bn-form-group">
                                                <label htmlFor="booking_id">Booking ID:</label>
                                                <input
                                                    type="text"
                                                    id="booking_id"
                                                    name="booking_id"
                                                    value={bookingFormData.booking_id}
                                                    disabled
                                                    className="bn-input"
                                                />
                                            </div>
                                        )}

                                        <div className="bn-form-group">
                                            <label htmlFor="hall_id_string">{currentContent.tableHeaders[2]}:</label>
                                            {loadingHalls ? (
                                                 <p>Loading halls...</p>
                                            ) : hallsError ? (
                                                 <p style={{ color: 'red' }}>{hallsError}</p>
                                            ) : (
                                                 <select
                                                     id="hall_id_string"
                                                     name="hall_id_string"
                                                     value={bookingFormData.hall_id_string}
                                                     onChange={handleBookingFormChange}
                                                     required
                                                     className="bn-select"
                                                 >
                                                     <option value="">{currentContent.selectHallPlaceholder}</option>
                                                     {availableHalls.map((hall) => (
                                                         <option key={hall.hall_id} value={hall.hall_id}>
                                                             {hall.hall_name}
                                                         </option>
                                                     ))}
                                                 </select>
                                            )}
                                        </div>

                                        <div className="bn-form-group">
                                            <label htmlFor="booking_date">{currentContent.tableHeaders[8]}:</label>
                                            <input
                                                type="date"
                                                id="booking_date"
                                                name="booking_date"
                                                value={bookingFormData.booking_date}
                                                onChange={handleBookingFormChange}
                                                required
                                                className="bn-input"
                                            />
                                        </div>

                                         <div className="bn-form-group">
                                            <label htmlFor="floor">{currentContent.tableHeaders[3]}:</label>
                                            <input
                                                type="text"
                                                id="floor"
                                                name="floor"
                                                value={bookingFormData.floor}
                                                onChange={handleBookingFormChange}
                                                className="bn-input"
                                            />
                                        </div>

                                        <div className="bn-form-group">
                                            <label htmlFor="function_type">{currentContent.tableHeaders[4]}:</label>
                                            <input
                                                type="text"
                                                id="function_type"
                                                name="function_type"
                                                value={bookingFormData.function_type}
                                                onChange={handleBookingFormChange}
                                                required
                                                className="bn-input"
                                            />
                                        </div>

                                         {/* Rent Options and Amount Input */}
                                         <div className="bn-form-group">
                                            <label>{currentContent.rentOptionsLabel}</label>
                                             {loadingHallRent ? (
                                                 <p>{currentContent.loadingRentMessage}</p>
                                             ) : hallRentError ? (
                                                 <p style={{color: 'red'}}>{hallRentError}</p>
                                             ) : selectedHallRentOptions ? (
                                                 <div className="bn-rent-options">
                                                     {/* Radio buttons for predefined rent types */}
                                                     {selectedHallRentOptions.commercial && (
                                                         <div className="bn-radio-group">
                                                             <input
                                                                 type="radio"
                                                                 id="rent-commercial"
                                                                 name="booking_amount_radio"
                                                                 value={`commercial|${selectedHallRentOptions.commercial}`}
                                                                 checked={bookingFormData.booking_amount === selectedHallRentOptions.commercial && bookingFormData.booking_type === 'commercial'}
                                                                 onChange={handleBookingFormChange}
                                                             />
                                                             <label htmlFor="rent-commercial">{currentContent.commercialRentLabel} {selectedHallRentOptions.commercial}</label>
                                                         </div>
                                                     )}
                                                     {selectedHallRentOptions.social && (
                                                         <div className="bn-radio-group">
                                                             <input
                                                                 type="radio"
                                                                 id="rent-social"
                                                                 name="booking_amount_radio"
                                                                 value={`social|${selectedHallRentOptions.social}`}
                                                                 checked={bookingFormData.booking_amount === selectedHallRentOptions.social && bookingFormData.booking_type === 'social'}
                                                                 onChange={handleBookingFormChange}
                                                             />
                                                             <label htmlFor="rent-social">{currentContent.socialRentLabel} {selectedHallRentOptions.social}</label>
                                                         </div>
                                                     )}
                                                     {selectedHallRentOptions.nonCommercial && (
                                                         <div className="bn-radio-group">
                                                             <input
                                                                 type="radio"
                                                                 id="rent-non-commercial"
                                                                 name="booking_amount_radio"
                                                                 value={`non-commercial|${selectedHallRentOptions.nonCommercial}`}
                                                                 checked={bookingFormData.booking_amount === selectedHallRentOptions.nonCommercial && bookingFormData.booking_type === 'non-commercial'}
                                                                 onChange={handleBookingFormChange}
                                                             />
                                                             <label htmlFor="rent-non-commercial">{currentContent.nonCommercialRentLabel} {selectedHallRentOptions.nonCommercial}</label>
                                                         </div>
                                                     )}
                                                    
                                                 </div>
                                             ) : (
                                                 
                                                 <p>No rent options available for the selected hall.</p> // Add a message when no options are available
                                             )}
                                        </div>

                                        {/* Optional Booking Type Selection */}
                                         <div className="bn-form-group">
                                             <label htmlFor="booking_type">{currentContent.bookingTypeLabel}</label>
                                             <select
                                                 id="booking_type"
                                                 name="booking_type"
                                                 value={bookingFormData.booking_type}
                                                 onChange={handleBookingFormChange}
                                                 className="bn-select"
                                             >
                                                 <option value="">{languageType === 'hi' ? 'चुनें (वैकल्पिक)' : 'Select (Optional)'}</option>
                                                 {currentContent.bookingTypeOptions.map((option) => (
                                                     <option key={option.value} value={option.value}>
                                                         {option.label}
                                                     </option>
                                                 ))}
                                             </select>
                                         </div>


                                        <div className="bn-form-group bn-checkbox-group">
                                            <input
                                                type="checkbox"
                                                id="addon_ac_heating"
                                                name="addon_ac_heating"
                                                checked={bookingFormData.addon_ac_heating}
                                                onChange={handleBookingFormChange}
                                            />
                                            <label htmlFor="addon_ac_heating">{currentContent.tableHeaders[7]}</label>
                                        </div>

                                        {/* Submit button is now in the footer */}
                                    </form>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="bn-modal-footer">
                                {/* Buttons change based on modal step */}
                                {modalStep === 1 && (
                                     <Fragment>
                                          <button className="bn-button bn-modal-cancel-button" onClick={handleCloseModal}>
                                               {languageType === 'hi' ? 'रद्द करें' : 'Cancel'}
                                          </button>
                                          <button
                                               className="bn-button bn-proceed-button"
                                               onClick={handleDisclaimerAgreedInModal}
                                          >
                                              {currentContent.disclaimerAgreeButton}
                                          </button>
                                     </Fragment>
                                )}
                                {modalStep === 2 && (
                                    <Fragment>
                                          <button className="bn-button bn-modal-cancel-button" onClick={handleCloseModal}>
                                               {languageType === 'hi' ? 'रद्द करें' : 'Cancel'}
                                          </button>
                                          {/* The submit button is type="submit" and is inside the form */}
                                          <button type="submit" className="bn-button bn-submit-button" form="booking-form-id"> {/* Link button to form by id */}
                                             {isEditing ? (languageType === 'hi' ? 'बुकिंग अपडेट करें' : 'Update Booking') : (languageType === 'hi' ? 'बुकिंग बनाएँ' : 'Create Booking')}
                                          </button>
                                    </Fragment>
                                )}
                            </div>
                        </div>
                    </div>
                </Fragment>
            )}

        </section>
    );
};

export default BookNowSection;