import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/BookNow.css';
import { CircleCheck, CircleX, CircleDot, Home, MapPin, Users, Info, DollarSign, Zap, Droplet, Car, Building, Utensils, TreePine, BedDouble, BookOpen, CalendarDays } from 'lucide-react'; // Import Lucide Icons

const BookNowSection = ({ languageType = 'en', user }) => {
    const navigate = useNavigate();

    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1); // modalStep 1: Disclaimer, modalStep 2: Booking Form
    const [isEditing, setIsEditing] = useState(false);

    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState(null);

    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);

    // State to hold the full details for the selected hall, including all pricing
    const [selectedHallFullDetails, setSelectedHallFullDetails] = useState(null);
    const [loadingHallDetails, setLoadingHallDetails] = useState(false);
    const [hallDetailsError, setHallDetailsError] = useState(null);

    // State for AC/Non-AC selection for the booking
    const [isAcSelected, setIsAcSelected] = useState(false); // true for AC, false for Non-AC

    // State for area selection: 'none', 'full', 'half', 'partial'
    const [selectedAreaOption, setSelectedAreaOption] = useState('none');

    const [bookingFormData, setBookingFormData] = useState({
        booking_id: '',
        hall_id_string: '',
        booking_date: '',
        floor: 1, // Default floor to 1
        function_type: '',
        area_sqft: '', // For per-sqft events, can be auto-calculated or user-input
        booking_amount: 0, // This will be calculated
        booking_type: '', // 'municipal', 'municipality', 'panchayat'
        is_parking: false,
        is_conference_hall: false,
        is_food_prep_area: false,
        is_lawn: false,
        is_ac: false, // This will mirror isAcSelected for submission
        add_parking: false, // Legacy, keep for now if needed by backend
        add_room: false,     // Legacy, keep for now if needed by backend
    });

    const [editingBookingId, setEditingBookingId] = useState(null);

    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';

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
            disclaimerAgreeButton: 'Agree and Proceed',
            disclaimerCloseButton: 'Close',
            newBookingButton: 'New Booking',
            previousBookingsHeading: 'All Bookings',
            tableHeaders: ['S.No.', 'Booking Id', 'BaratGhar Name', 'Floor', 'Function', 'Total Amount', 'Status', 'AC/Non-AC', 'Booking Date', 'Action'],
            cancelButton: 'Cancel',
            noBookingsMessage: 'No bookings found.',
            selectHallPlaceholder: 'Select BaratGhar',
            loadingHallsMessage: 'Loading halls...',
            hallsErrorMessage: 'Failed to load halls.',
            loadingDetailsMessage: 'Fetching hall details...',
            detailsErrorMessage: 'Failed to fetch hall details.',
            acNonAcLabel: 'Select AC/Non-AC:',
            acOption: 'AC',
            nonAcOption: 'Non-AC',
            bookingTypeLabel: 'Select Booking Type:',
            municipalType: 'Municipal',
            municipalityType: 'Municipality',
            panchayatType: 'Panchayat',
            optionalAddonsLabel: 'Optional Add-ons:',
            parkingOption: 'Parking',
            conferenceHallOption: 'Conference Hall',
            foodPrepAreaOption: 'Food Prep Area',
            lawnOption: 'Lawn',
            areaSqftLabel: 'Area (sq. ft.):',
            areaOptionLabel: 'Select Area Option:', // New
            areaOptionFull: 'Full Area', // New
            areaOptionHalf: 'Half Area', // New
            areaOptionPartial: 'Partial Area', // New
            calculatedAmountLabel: 'Calculated Total Amount:',
            closeModalButton: 'Close Modal',
            // Pricing table headers for dynamic display
            fixedPriceBlocksHeading: 'Fixed Price Blocks (Per Day)',
            eventSpecificPricingHeading: 'Event Specific Pricing (Per Sq. Ft. Per Day)',
            categoryHeader: 'Category',
            municipalHeader: 'Municipal',
            municipalityHeader: 'Municipality',
            panchayatHeader: 'Panchayat',
            acPricesHeader: 'AC Prices',
            nonAcPricesHeader: 'Non-AC Prices',
            eventType: 'Event Type',
            // Fixed block names for display
            conferenceHallAc: 'Conference Hall (AC)',
            conferenceHallNonAc: 'Conference Hall (Non-AC)',
            foodPrepAreaAc: 'Food Prep Area (AC)',
            foodPrepAreaNonAc: 'Food Prep Area (Non-AC)',
            lawnAc: 'Lawn (AC)',
            lawnNonAc: 'Lawn (Non-AC)',
            roomRentAc: 'Room Rent (AC)',
            roomRentNonAc: 'Room Rent (Non-AC)',
            parking: 'Parking',
            electricityAc: 'Electricity (AC)',
            electricityNonAc: 'Electricity (Non-AC)',
            cleaning: 'Cleaning',
            confirmCancelMessage: 'Are you sure you want to cancel this booking?',
            selectFunctionPlaceholder: 'Select Function Type', // New
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
            disclaimerAgreeButton: 'सहमत और आगे बढ़ें',
            disclaimerCloseButton: 'बंद करें',
            newBookingButton: 'नई बुकिंग',
            previousBookingsHeading: 'सभी बुकिंग',
            tableHeaders: ['क्र.सं.', 'बुकिंग आईडी', 'बारात घर का नाम', 'मंजिल', 'समारोह', 'कुल राशि', 'स्थिति', 'एसी/गैर-एसी', 'बुकिंग तिथि', 'कार्रवाई'],
            cancelButton: 'रद्द करें',
            noBookingsMessage: 'कोई बुकिंग नहीं मिली।',
            selectHallPlaceholder: 'बारात घर चुनें',
            loadingHallsMessage: 'बारात घर लोड हो रहे हैं...',
            hallsErrorMessage: 'बारात घर लोड करने में विफल।',
            loadingDetailsMessage: 'हॉल विवरण प्राप्त हो रहे हैं...',
            detailsErrorMessage: 'हॉल विवरण प्राप्त करने में विफल।',
            acNonAcLabel: 'एसी/गैर-एसी चुनें:',
            acOption: 'एसी',
            nonAcOption: 'गैर-एसी',
            bookingTypeLabel: 'बुकिंग प्रकार चुनें:',
            municipalType: 'नगरपालिका',
            municipalityType: 'नगर निगम',
            panchayatType: 'पंचायत',
            optionalAddonsLabel: 'वैकल्पिक ऐड-ऑन:',
            parkingOption: 'पार्किंग',
            conferenceHallOption: 'सम्मेलन कक्ष',
            foodPrepAreaOption: 'भोजन तैयारी क्षेत्र',
            lawnOption: 'लॉन',
            areaSqftLabel: 'क्षेत्र (वर्ग फुट):',
            areaOptionLabel: 'क्षेत्र विकल्प चुनें:', // New
            areaOptionFull: 'पूरा क्षेत्र', // New
            areaOptionHalf: 'आधा क्षेत्र', // New
            areaOptionPartial: 'आंशिक क्षेत्र', // New
            calculatedAmountLabel: 'गणना की गई कुल राशि:',
            closeModalButton: 'मॉडल बंद करें',
            // Pricing table headers for dynamic display
            fixedPriceBlocksHeading: 'निश्चित मूल्य ब्लॉक (प्रति दिन)',
            eventSpecificPricingHeading: 'इवेंट विशिष्ट मूल्य निर्धारण (प्रति वर्ग फुट प्रति दिन)',
            categoryHeader: 'श्रेणी',
            municipalHeader: 'नगरपालिका',
            municipalityHeader: 'नगर निगम',
            panchayatHeader: 'पंचायत',
            acPricesHeader: 'एसी मूल्य',
            nonAcPricesHeader: 'गैर-एसी मूल्य',
            eventType: 'इवेंट प्रकार',
            // Fixed block names for display
            conferenceHallAc: 'सम्मेलन कक्ष (एसी)',
            conferenceHallNonAc: 'सम्मेलन कक्ष (गैर-एसी)',
            foodPrepAreaAc: 'भोजन तैयारी क्षेत्र (एसी)',
            foodPrepAreaNonAc: 'भोजन तैयारी क्षेत्र (गैर-एसी)',
            lawnAc: 'लॉन (एसी)',
            lawnNonAc: 'लॉन (गैर-एसी)',
            roomRentAc: 'कमरे का किराया (एसी)',
            roomRentNonAc: 'कमरे का किराया (गैर-एसी)',
            parking: 'पार्किंग',
            electricityAc: 'बिजली (एसी)',
            electricityNonAc: 'बिजली (गैर-एसी)',
            cleaning: 'सफाई',
            confirmCancelMessage: 'क्या आप वाकई इस बुकिंग को रद्द करना चाहते हैं?',
            selectFunctionPlaceholder: 'समारोह प्रकार चुनें', // New
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

    // Fetch full hall details when hall is selected
    useEffect(() => {
        if (bookingFormData.hall_id_string) {
            fetchHallFullDetails(bookingFormData.hall_id_string);
        } else {
            setSelectedHallFullDetails(null);
            setHallDetailsError(null);
            setBookingFormData(prevData => ({
                ...prevData,
                function_type: '', // Clear function type when hall changes
                area_sqft: '', // Clear area when hall changes
            }));
            setSelectedAreaOption('none'); // Reset area option
        }
    }, [bookingFormData.hall_id_string]);


    // Effect to recalculate booking amount whenever relevant dependencies change
    useEffect(() => {
        if (selectedHallFullDetails && bookingFormData.booking_type) {
            const calculatedAmount = calculateBookingAmount();
            setBookingFormData(prevData => ({
                ...prevData,
                booking_amount: calculatedAmount,
            }));
        } else {
            setBookingFormData(prevData => ({
                ...prevData,
                booking_amount: 0,
            }));
        }
    }, [
        selectedHallFullDetails,
        isAcSelected,
        bookingFormData.booking_type,
        bookingFormData.function_type,
        bookingFormData.area_sqft, // Now directly used
        bookingFormData.is_parking,
        bookingFormData.is_conference_hall,
        bookingFormData.is_food_prep_area,
        bookingFormData.is_lawn,
    ]);


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

    // Fetch full details for a specific hall
    const fetchHallFullDetails = async (hallId) => {
        setLoadingHallDetails(true);
        setHallDetailsError(null);
        setSelectedHallFullDetails(null); // Clear previous details
        try {
            const response = await fetch(`${API_BASE_URL}/halls/${hallId}`);
            if (!response.ok) {
                 if (response.status === 404) {
                     throw new Error(`Hall with ID ${hallId} not found.`);
                 }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSelectedHallFullDetails(data);
        } catch (error) {
            console.error('Error fetching hall details:', error);
            setHallDetailsError(currentContent.detailsErrorMessage);
        } finally {
            setLoadingHallDetails(false);
        }
    };

    // Helper to get the correct tiered price based on booking_type and price object
    const getTieredPrice = (priceObject, bookingType) => {
        if (!priceObject || !bookingType) return 0;
        switch (bookingType) {
            case 'municipal': return priceObject.municipal || 0;
            case 'municipality': return priceObject.municipality || 0;
            case 'panchayat': return priceObject.panchayat || 0;
            default: return 0;
        }
    };

    // Function to calculate the total booking amount dynamically
    const calculateBookingAmount = useMemo(() => () => {
        let totalAmount = 0;
        if (!selectedHallFullDetails || !bookingFormData.booking_type) {
            return 0;
        }

        const hall = selectedHallFullDetails;
        const bookingType = bookingFormData.booking_type;

        // Add fixed-price block costs based on selection and AC/Non-AC
        if (bookingFormData.is_parking) {
            totalAmount += getTieredPrice(hall.parking, bookingType);
        }
        if (bookingFormData.is_conference_hall) {
            totalAmount += getTieredPrice(isAcSelected ? hall.conference_hall_ac : hall.conference_hall_nonac, bookingType);
        }
        if (bookingFormData.is_food_prep_area) {
            totalAmount += getTieredPrice(isAcSelected ? hall.food_prep_area_ac : hall.food_prep_area_nonac, bookingType);
        }
        if (bookingFormData.is_lawn) {
            totalAmount += getTieredPrice(isAcSelected ? hall.lawn_ac : hall.lawn_nonac, bookingType);
        }
        // Room rent is generally an add-on, not a checkbox, but included in fixed blocks
        // Assuming room_rent is always added if AC/Non-AC is selected for a booking.
        // If it's optional, you'd need another checkbox for it. For now, it's not tied to a checkbox.
        // totalAmount += getTieredPrice(isAcSelected ? hall.room_rent_ac : hall.room_rent_nonac, bookingType);


        // Add electricity and cleaning charges (Electricity is AC/Non-AC dependent)
        totalAmount += getTieredPrice(isAcSelected ? hall.electricity_ac : hall.electricity_nonac, bookingType);
        totalAmount += getTieredPrice(hall.cleaning, bookingType);


        // Calculate per-sqft event costs if function_type matches an event
        if (bookingFormData.function_type && bookingFormData.area_sqft > 0) {
            const eventPrice = hall.event_pricing.find(event =>
                event.event_type.toLowerCase() === bookingFormData.function_type.toLowerCase()
            );

            if (eventPrice) {
                const perSqftPrice = isAcSelected
                    ? getTieredPrice(eventPrice.prices_per_sqft_ac, bookingType)
                    : getTieredPrice(eventPrice.prices_per_sqft_nonac, bookingType);
                totalAmount += (bookingFormData.area_sqft * perSqftPrice);
            }
        }

        return totalAmount;
    }, [selectedHallFullDetails, isAcSelected, bookingFormData.booking_type,
        bookingFormData.function_type, bookingFormData.area_sqft,
        bookingFormData.is_parking, bookingFormData.is_conference_hall,
        bookingFormData.is_food_prep_area, bookingFormData.is_lawn
    ]);


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
            floor: 1, // Default floor to 1
            function_type: '',
            area_sqft: '',
            booking_amount: 0,
            booking_type: '',
            is_parking: false,
            is_conference_hall: false,
            is_food_prep_area: false,
            is_lawn: false,
            is_ac: false,
            add_parking: false,
            add_room: false,
        });
        setSelectedHallFullDetails(null); // Clear full hall details
        setHallDetailsError(null);
        setIsAcSelected(false); // Reset AC selection
        setSelectedAreaOption('none'); // Reset area option
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
            floor: 1, // Default floor to 1
            function_type: '',
            area_sqft: '',
            booking_amount: 0,
            booking_type: '',
            is_parking: false,
            is_conference_hall: false,
            is_food_prep_area: false,
            is_lawn: false,
            is_ac: false,
            add_parking: false,
            add_room: false,
        });
        setSelectedHallFullDetails(null); // Clear full hall details
        setHallDetailsError(null);
        setIsAcSelected(false); // Reset AC selection
        setSelectedAreaOption('none'); // Reset area option
        setModalStep(1); // Start with the disclaimer step
        setShowModal(true); // Show the modal
    };

    const handleBookingFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'hall_id_string') {
            // When hall changes, reset related pricing states
            setBookingFormData(prevData => ({
                ...prevData,
                [name]: value,
                booking_type: '', // Clear booking type
                function_type: '', // Clear function type
                area_sqft: '', // Clear area
                is_parking: false,
                is_conference_hall: false,
                is_food_prep_area: false,
                is_lawn: false,
                is_ac: false, // Reset AC checkbox
                booking_amount: 0,
            }));
            setIsAcSelected(false); // Reset AC radio button
            setSelectedAreaOption('none'); // Reset area option
        } else if (name === 'is_ac_radio') { // Handling AC/Non-AC radio buttons
            setIsAcSelected(value === 'true');
            setBookingFormData(prevData => ({
                ...prevData,
                is_ac: value === 'true', // Update is_ac flag in form data
            }));
        } else if (name === 'booking_type_radio') { // Handling booking type radio buttons
            setBookingFormData(prevData => ({
                ...prevData,
                booking_type: value,
            }));
        } else if (name === 'selected_area_option') { // New: Handle area option dropdown
            setSelectedAreaOption(value);
            let calculatedArea = '';
            // IMPORTANT: You need to have 'total_area_sqft' in your hallModel and fetched data
            // For demonstration, assuming selectedHallFullDetails.total_area_sqft exists
            const totalArea = selectedHallFullDetails?.total_area_sqft || 0; // Fallback to 0 if not available

            if (value === 'full' && totalArea > 0) {
                calculatedArea = totalArea;
            } else if (value === 'half' && totalArea > 0) {
                calculatedArea = totalArea / 2;
            } else if (value === 'partial') {
                calculatedArea = ''; // Clear for user input
            } else {
                calculatedArea = ''; // Default for 'none' or if totalArea is 0
            }
            setBookingFormData(prevData => ({
                ...prevData,
                area_sqft: calculatedArea,
            }));
        }
        else if (name === 'area_sqft') {
            setBookingFormData(prevData => ({
                ...prevData,
                [name]: value === '' ? '' : Number(value), // Allow empty string, convert to number
            }));
        } else if (type === 'checkbox') {
            setBookingFormData(prevData => ({
                ...prevData,
                [name]: checked,
            }));
        }
        else {
            setBookingFormData(prevData => ({
                ...prevData,
                [name]: value,
            }));
        }
    };


    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found. Cannot save booking.');
            return;
        }

        // Basic validation: Hall, Date, Function Type, and Booking Type are required
        if (!bookingFormData.hall_id_string || bookingFormData.hall_id_string.trim() === '' || !bookingFormData.booking_date || !bookingFormData.function_type || !bookingFormData.booking_type) {
             alert(languageType === 'hi' ? 'कृपया सभी आवश्यक बुकिंग विवरण भरें (बारात घर, तिथि, समारोह प्रकार, बुकिंग प्रकार)।' : 'Please fill in all required booking details (Hall, Date, Function Type, Booking Type).');
             return;
        }

        // Additional validation for area_sqft if function_type is an event
        const isEventFunction = selectedHallFullDetails?.event_pricing?.some(event =>
            event.event_type.toLowerCase() === bookingFormData.function_type.toLowerCase()
        );
        if (isEventFunction && (bookingFormData.area_sqft === '' || bookingFormData.area_sqft <= 0)) {
            alert(languageType === 'hi' ? 'इस समारोह प्रकार के लिए क्षेत्र (वर्ग फुट) आवश्यक है और 0 से अधिक होना चाहिए।' : 'For this function type, Area (sq. ft.) is required and must be greater than 0.');
            return;
        }


        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_BASE_URL}/bookings/${editingBookingId}` : `${API_BASE_URL}/bookings`;

        // Prepare the request body
        const requestBody = {
            hall_id_string: bookingFormData.hall_id_string,
            booking_date: bookingFormData.booking_date,
            floor: bookingFormData.floor || 1, // Default to 1 if not provided
            function_type: bookingFormData.function_type,
            area_sqft: isEventFunction ? bookingFormData.area_sqft : undefined, // Only send if it's an event function
            booking_amount: bookingFormData.booking_amount, // Use the calculated amount
            booking_type: bookingFormData.booking_type,
            is_parking: bookingFormData.is_parking,
            is_conference_hall: bookingFormData.is_conference_hall,
            is_food_prep_area: bookingFormData.is_food_prep_area,
            is_lawn: bookingFormData.is_lawn,
            is_ac: bookingFormData.is_ac, // Send the AC selection
            add_parking: bookingFormData.add_parking, // Legacy
            add_room: bookingFormData.add_room,     // Legacy
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
            hall_id_string: booking.hall_id ? booking.hall_id.hall_id : '',
            booking_date: booking.booking_date ? new Date(booking.booking_date).toISOString().split('T')[0] : '',
            floor: booking.floor || 1, // Default floor to 1
            function_type: booking.function_type || '',
            area_sqft: booking.area_sqft || '',
            booking_amount: booking.booking_amount || 0,
            booking_type: booking.booking_type || '',
            is_parking: booking.is_parking || false,
            is_conference_hall: booking.is_conference_hall || false,
            is_food_prep_area: booking.is_food_prep_area || false,
            is_lawn: booking.is_lawn || false,
            is_ac: booking.is_ac || false,
            add_parking: booking.add_parking || false,
            add_room: booking.add_room || false,
        });
        setIsAcSelected(booking.is_ac || false); // Set AC radio button based on existing booking
        // Determine selectedAreaOption based on existing area_sqft if editing
        // This requires fetching hall details first to get total_area_sqft
        if (booking.hall_id && booking.hall_id.hall_id) {
             fetchHallFullDetails(booking.hall_id.hall_id).then(hallDetails => {
                 if (hallDetails && booking.area_sqft) {
                     const totalArea = hallDetails.total_area_sqft || 0;
                     if (booking.area_sqft === totalArea) {
                         setSelectedAreaOption('full');
                     } else if (booking.area_sqft === totalArea / 2) {
                         setSelectedAreaOption('half');
                     } else {
                         setSelectedAreaOption('partial');
                     }
                 } else {
                     setSelectedAreaOption('none');
                 }
             });
        } else {
            setSelectedAreaOption('none');
        }

        // Fetch full hall details if hall_id_string is available
        if (booking.hall_id && booking.hall_id.hall_id) {
             fetchHallFullDetails(booking.hall_id.hall_id);
        } else {
             setSelectedHallFullDetails(null);
             setHallDetailsError(null);
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
                // Use the specific cancel endpoint
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingIdToCancel}/cancel`, {
                    method: 'PUT', // Assuming PUT endpoint for cancellation
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

    // Helper to render pricing table for fixed blocks
    const renderFixedPriceTable = (hallDetails, acStatus) => {
        if (!hallDetails) return null;

        const fixedBlocks = {
            conferenceHall: acStatus ? hallDetails.conference_hall_ac : hallDetails.conference_hall_nonac,
            foodPrepArea: acStatus ? hallDetails.food_prep_area_ac : hallDetails.food_prep_area_nonac,
            lawn: acStatus ? hallDetails.lawn_ac : hallDetails.lawn_nonac,
            roomRent: acStatus ? hallDetails.room_rent_ac : hallDetails.room_rent_nonac,
            parking: hallDetails.parking, // Parking is not AC/Non-AC specific
            electricity: acStatus ? hallDetails.electricity_ac : hallDetails.electricity_nonac,
            cleaning: hallDetails.cleaning, // Cleaning is not AC/Non-AC specific
        };

        const blockLabels = {
            conferenceHall: currentContent.conferenceHallAc.replace(' (AC)', '').replace(' (गैर-एसी)', ''),
            foodPrepArea: currentContent.foodPrepAreaAc.replace(' (AC)', '').replace(' (गैर-एसी)', ''),
            lawn: currentContent.lawnAc.replace(' (AC)', '').replace(' (गैर-एसी)', ''),
            roomRent: currentContent.roomRentAc.replace(' (AC)', '').replace(' (गैर-एसी)', ''),
            parking: currentContent.parking,
            electricity: currentContent.electricityAc.replace(' (AC)', '').replace(' (गैर-एसी)', ''),
            cleaning: currentContent.cleaning,
        };

        return (
            <div className="bn-price-table-container">
                <h5>{currentContent.fixedPriceBlocksHeading} ({acStatus ? currentContent.acOption : currentContent.nonAcOption})</h5>
                <table className="bn-price-table">
                    <thead>
                        <tr>
                            <th>{currentContent.categoryHeader}</th>
                            <th>{currentContent.municipalHeader}</th>
                            <th>{currentContent.municipalityHeader}</th>
                            <th>{currentContent.panchayatHeader}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(fixedBlocks).map(key => {
                            const prices = fixedBlocks[key];
                            if (!prices) return null; // Skip if pricing data is missing

                            return (
                                <tr key={key}>
                                    <td>{blockLabels[key]}</td>
                                    <td>Rs. {prices.municipal}</td>
                                    <td>Rs. {prices.municipality}</td>
                                    <td>Rs. {prices.panchayat}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    // Helper to render pricing table for event specific blocks
    const renderEventPriceTable = (eventPricing, acStatus) => {
        if (!eventPricing || eventPricing.length === 0) return null;

        return (
            <div className="bn-price-table-container">
                <h5>{currentContent.eventSpecificPricingHeading} ({acStatus ? currentContent.acOption : currentContent.nonAcOption})</h5>
                <table className="bn-price-table">
                    <thead>
                        <tr>
                            <th>{currentContent.eventType}</th>
                            <th>{currentContent.municipalHeader}</th>
                            <th>{currentContent.municipalityHeader}</th>
                            <th>{currentContent.panchayatHeader}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventPricing.map((event, index) => {
                            const prices = acStatus ? event.prices_per_sqft_ac : event.prices_per_sqft_nonac;
                            if (!prices) return null; // Skip if pricing data is missing

                            return (
                                <tr key={index}>
                                    <td>{event.event_type}</td>
                                    <td>Rs. {prices.municipal}</td>
                                    <td>Rs. {prices.municipality}</td>
                                    <td>Rs. {prices.panchayat}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
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
                                            <td>Rs. {booking.booking_amount}</td>
                                            {/* Updated Status Cell with Icons and Colors */}
                                            <td className="bn-table-status-cell">
                                                {booking.booking_status === 'Confirmed' && (
                                                    <span className="bn-status-indicator bn-status-confirmed">
                                                        <CircleCheck size={16} />
                                                        {booking.booking_status}
                                                    </span>
                                                )}
                                                {booking.booking_status === 'Cancelled' && (
                                                    <span className="bn-status-indicator bn-status-rejected">
                                                        <CircleX size={16} />
                                                       {booking.booking_status}
                                                    </span>
                                                )}
                                                {booking.booking_status === 'Pending' && (
                                                    <span className="bn-status-indicator bn-status-pending">
                                                        <CircleDot size={16} />
                                                        {booking.booking_status}
                                                    </span>
                                                )}
                                                {!['Confirmed', 'Cancelled', 'Pending'].includes(booking.booking_status) && (
                                                    <span>{booking.booking_status}</span>
                                                )}
                                            </td>
                                            <td>{booking.is_ac ? (languageType === 'hi' ? 'हाँ' : 'Yes') : (languageType === 'hi' ? 'नहीं' : 'No')}</td>
                                            <td>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="bn-table-actions">
                                                 {booking.booking_status !== 'Cancelled' && (
                                                     <button
                                                         className="bn-button bn-edit-button"
                                                         onClick={() => startEditBooking(booking)}
                                                         aria-label={`Edit booking ${booking.booking_id}`}
                                                     >
                                                         {languageType === 'hi' ? 'संपादित करें' : 'Edit'}
                                                     </button>
                                                 )}
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
                                    <form id="booking-form-id" onSubmit={handleBookingSubmit} className="bn-booking-form">
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
                                                type="number"
                                                id="floor"
                                                name="floor"
                                                value={bookingFormData.floor}
                                                onChange={handleBookingFormChange}
                                                className="bn-input"
                                                min="1"
                                            />
                                        </div>

                                        {/* AC/Non-AC Selection */}
                                        <div className="bn-form-group">
                                            <label>{currentContent.acNonAcLabel}</label>
                                            <div className="bn-radio-group">
                                                <input
                                                    type="radio"
                                                    id="ac-yes"
                                                    name="is_ac_radio"
                                                    value="true"
                                                    checked={isAcSelected === true}
                                                    onChange={handleBookingFormChange}
                                                />
                                                <label htmlFor="ac-yes">{currentContent.acOption}</label>
                                            </div>
                                            <div className="bn-radio-group">
                                                <input
                                                    type="radio"
                                                    id="ac-no"
                                                    name="is_ac_radio"
                                                    value="false"
                                                    checked={isAcSelected === false}
                                                    onChange={handleBookingFormChange}
                                                />
                                                <label htmlFor="ac-no">{currentContent.nonAcOption}</label>
                                            </div>
                                        </div>

                                        {/* Display Prices based on selected hall, date, and AC/Non-AC */}
                                        {selectedHallFullDetails && (
                                            <div className="bn-pricing-display">
                                                <h4>Hall Details: {selectedHallFullDetails.hall_name}</h4>
                                                <p>Location: {selectedHallFullDetails.location}</p>
                                                <p>Capacity: {selectedHallFullDetails.capacity}</p>
                                                <p>Total Floors: {selectedHallFullDetails.total_floors}</p>
                                                <p>Total Area: {selectedHallFullDetails.total_area_sqft || 'N/A'} sq. ft.</p>
                                                {selectedHallFullDetails.description && <p>Description: {selectedHallFullDetails.description}</p>}

                                                {renderFixedPriceTable(selectedHallFullDetails, isAcSelected)}
                                                {renderEventPriceTable(selectedHallFullDetails.event_pricing, isAcSelected)}
                                            </div>
                                        )}


                                        <div className="bn-form-group">
                                            <label htmlFor="function_type">{currentContent.tableHeaders[4]}:</label>
                                            <select
                                                id="function_type"
                                                name="function_type"
                                                value={bookingFormData.function_type}
                                                onChange={handleBookingFormChange}
                                                required
                                                className="bn-select"
                                            >
                                                <option value="">{currentContent.selectFunctionPlaceholder}</option>
                                                {selectedHallFullDetails?.event_pricing?.map((event) => (
                                                    <option key={event.event_type} value={event.event_type}>
                                                        {event.event_type}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Area Selection (Full, Half, Partial) */}
                                        {selectedHallFullDetails && selectedHallFullDetails.event_pricing.some(event =>
                                            event.event_type.toLowerCase() === bookingFormData.function_type.toLowerCase()
                                        ) && (
                                            <div className="bn-form-group">
                                                <label htmlFor="selected_area_option">{currentContent.areaOptionLabel}</label>
                                                <select
                                                    id="selected_area_option"
                                                    name="selected_area_option"
                                                    value={selectedAreaOption}
                                                    onChange={handleBookingFormChange}
                                                    required
                                                    className="bn-select"
                                                >
                                                    <option value="none">Select Area Option</option>
                                                    <option value="full">{currentContent.areaOptionFull}</option>
                                                    <option value="half">{currentContent.areaOptionHalf}</option>
                                                    <option value="partial">{currentContent.areaOptionPartial}</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Area (sq. ft.) input, only if function_type is an event and area option is selected */}
                                        {selectedHallFullDetails && selectedHallFullDetails.event_pricing.some(event =>
                                            event.event_type.toLowerCase() === bookingFormData.function_type.toLowerCase()
                                        ) && selectedAreaOption !== 'none' && (
                                            <div className="bn-form-group">
                                                <label htmlFor="area_sqft">{currentContent.areaSqftLabel}</label>
                                                <input
                                                    type="number"
                                                    id="area_sqft"
                                                    name="area_sqft"
                                                    value={bookingFormData.area_sqft}
                                                    onChange={handleBookingFormChange}
                                                    min="1"
                                                    required={selectedAreaOption !== 'none'} // Make required if an option is chosen
                                                    readOnly={selectedAreaOption === 'full' || selectedAreaOption === 'half'}
                                                    className="bn-input"
                                                />
                                            </div>
                                        )}


                                        {/* Booking Type Selection (Radio Buttons) */}
                                        <div className="bn-form-group">
                                            <label>{currentContent.bookingTypeLabel}</label>
                                            <div className="bn-radio-group bn-booking-type-options">
                                                <input
                                                    type="radio"
                                                    id="booking-type-municipal"
                                                    name="booking_type_radio"
                                                    value="municipal"
                                                    checked={bookingFormData.booking_type === 'municipal'}
                                                    onChange={handleBookingFormChange}
                                                    required
                                                />
                                                <label htmlFor="booking-type-municipal">{currentContent.municipalType}</label>

                                                <input
                                                    type="radio"
                                                    id="booking-type-municipality"
                                                    name="booking_type_radio"
                                                    value="municipality"
                                                    checked={bookingFormData.booking_type === 'municipality'}
                                                    onChange={handleBookingFormChange}
                                                    required
                                                />
                                                <label htmlFor="booking-type-municipality">{currentContent.municipalityType}</label>

                                                <input
                                                    type="radio"
                                                    id="booking-type-panchayat"
                                                    name="booking_type_radio"
                                                    value="panchayat"
                                                    checked={bookingFormData.booking_type === 'panchayat'}
                                                    onChange={handleBookingFormChange}
                                                    required
                                                />
                                                <label htmlFor="booking-type-panchayat">{currentContent.panchayatType}</label>
                                            </div>
                                        </div>

                                        {/* Optional Add-ons Checkboxes */}
                                        <div className="bn-form-group">
                                            <label>{currentContent.optionalAddonsLabel}</label>
                                            <div className="bn-checkbox-group-container">
                                                <div className="bn-checkbox-group">
                                                    <input
                                                        type="checkbox"
                                                        id="is_parking"
                                                        name="is_parking"
                                                        checked={bookingFormData.is_parking}
                                                        onChange={handleBookingFormChange}
                                                    />
                                                    <label htmlFor="is_parking">{currentContent.parkingOption}</label>
                                                </div>
                                                <div className="bn-checkbox-group">
                                                    <input
                                                        type="checkbox"
                                                        id="is_conference_hall"
                                                        name="is_conference_hall"
                                                        checked={bookingFormData.is_conference_hall}
                                                        onChange={handleBookingFormChange}
                                                    />
                                                    <label htmlFor="is_conference_hall">{currentContent.conferenceHallOption}</label>
                                                </div>
                                                <div className="bn-checkbox-group">
                                                    <input
                                                        type="checkbox"
                                                        id="is_food_prep_area"
                                                        name="is_food_prep_area"
                                                        checked={bookingFormData.is_food_prep_area}
                                                        onChange={handleBookingFormChange}
                                                    />
                                                    <label htmlFor="is_food_prep_area">{currentContent.foodPrepAreaOption}</label>
                                                </div>
                                                <div className="bn-checkbox-group">
                                                    <input
                                                        type="checkbox"
                                                        id="is_lawn"
                                                        name="is_lawn"
                                                        checked={bookingFormData.is_lawn}
                                                        onChange={handleBookingFormChange}
                                                    />
                                                    <label htmlFor="is_lawn">{currentContent.lawnOption}</label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Calculated Total Amount Display */}
                                        <div className="bn-form-group">
                                            <label>{currentContent.calculatedAmountLabel}</label>
                                            <input
                                                type="text"
                                                value={`Rs. ${bookingFormData.booking_amount}`}
                                                readOnly
                                                className="bn-input bn-calculated-amount"
                                            />
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
                                          <button type="submit" className="bn-button bn-submit-button" form="booking-form-id">
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
