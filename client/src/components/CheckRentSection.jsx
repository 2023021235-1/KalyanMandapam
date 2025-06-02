// CheckRentSection.jsx
import React, { useState, useEffect } from 'react';
import './styles/CheckRent.css';
import { Home, MapPin, Users, Info, DollarSign, Zap, Droplet, Car, Building, Utensils, TreePine, BedDouble, BookOpen, CalendarDays } from 'lucide-react';
import axios from 'axios'; // Import axios

const CheckRentSection = ({ languageType = 'en' }) => {
    // State to store the list of available halls fetched from the API
    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);

    // State for the selected hall details (including rent, location, capacity)
    const [selectedHallId, setSelectedHallId] = useState('');
    const [selectedHallDetails, setSelectedHallDetails] = useState(null); // State to display details for the selected hall
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState(null);
    const [showDetailsAfterCaptcha, setShowDetailsAfterCaptcha] = useState(false);

    // CAPTCHA STATES
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");   // JWT from server
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");


    // Base URL for API calls
    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';

    // Content for the section (updated to include new pricing labels)
    const content = {
        en: {
            sectionHeading: 'Check Rent & Details',
            dropdownLabel: 'BaratGhar Name',
            selectHallPlaceholder: 'Select BaratGhar',
            notesHeading: 'Terms & Conditions', // Updated heading
            note1: 'The rates given above are different for AC booking and Non-AC booking and will be applicable as per the above list.', // Updated note
            note2: 'The charges for AC hall will be as per the above table and the rate will be applicable for booking the entire hall. Partial booking of the hall will not be applicable.', // Updated note
            note3: '', // Removed or left empty if only two notes
            locationLabel: 'Location',
            capacityLabel: 'Capacity',
            totalFloorsLabel: 'Total Floors', // New label
            descriptionLabel: 'Description', // New label
            loadingHallsMessage: 'Loading halls...',
            fetchingDetailsMessage: 'Fetching details...',
            selectHallMessage: 'Please select a BaratGhar to see details.',
            hallNotFound: 'Details not found for the selected hall.',
            enterCaptcha: 'Enter CAPTCHA',
            showDetailsButton: 'Show Rent Details',
            invalidCaptcha: 'Invalid CAPTCHA',
            failedToLoadCaptcha: 'Failed to load CAPTCHA',

            // New pricing labels
            acPricesHeading: 'AC Prices', // Heading for AC table
            nonAcPricesHeading: 'Non-AC Prices', // Heading for Non-AC table
            categoryHeader: 'Category',
            municipalHeader: 'Municipal',
            municipalityHeader: 'Municipality',
            panchayatHeader: 'Panchayat',

            // Fixed block names
            conferenceHallAc: 'Conference Hall',
            conferenceHallNonAc: 'Conference Hall',
            foodPrepAreaAc: 'Food Prep Area',
            foodPrepAreaNonAc: 'Food Prep Area',
            lawnAc: 'Lawn',
            lawnNonAc: 'Lawn',
            roomRentAc: 'Room Rent',
            roomRentNonAc: 'Room Rent',
            parking: 'Parking',
            electricityAc: 'Electricity',
            electricityNonAc: 'Electricity',
            cleaning: 'Cleaning',
        },
        hi: {
            sectionHeading: 'किराया और विवरण जांचें',
            dropdownLabel: 'बारात घर का नाम',
            selectHallPlaceholder: 'बारात घर चुनें',
            notesHeading: 'नियम एवं शर्तें', // Updated heading
            note1: 'ऊपर दी गई दरें ए०सी० बुकिंग के साथ - साथ नॉन ए०सी० बुकिंग के लिए अलग-अलग हैं एवं उपरोक्त सूची के अनुसार लागू होगी ।', // Updated note
            note2: 'ए०सी० हॉल के लिए शुल्क उपरोक्त तालिका के अनुसार होगा और दर पूरे हॉल की बुकिंग पर लागू होगी । हॉल की आशिक बुकिंग लागू नहीं होगी ।', // Updated note
            note3: '', // Removed or left empty if only two notes
            locationLabel: 'स्थान',
            capacityLabel: 'क्षमता',
            totalFloorsLabel: 'कुल मंजिलें', // New label
            descriptionLabel: 'विवरण', // New label
            loadingHallsMessage: 'बारात घर लोड हो रहे हैं...',
            fetchingDetailsMessage: 'विवरण प्राप्त हो रहा है...',
            selectHallMessage: 'विवरण देखने के लिए कृपया एक बारात घर चुनें।',
            hallNotFound: 'चयनित बारात घर के लिए विवरण नहीं मिला।',
            enterCaptcha: 'कैप्चा दर्ज करें',
            showDetailsButton: 'किराया विवरण दिखाएं',
            invalidCaptcha: 'अमान्य कैप्चा',
            failedToLoadCaptcha: 'कैप्चा लोड करने में विफल',

            // New pricing labels
            acPricesHeading: 'एसी मूल्य', // Heading for AC table
            nonAcPricesHeading: 'गैर-एसी मूल्य', // Heading for Non-AC table
            categoryHeader: 'श्रेणी',
            municipalHeader: 'नगरपालिका',
            municipalityHeader: 'नगर निगम',
            panchayatHeader: 'पंचायत',

            // Fixed block names
            conferenceHallAc: 'सम्मेलन कक्ष',
            conferenceHallNonAc: 'सम्मेलन कक्ष',
            foodPrepAreaAc: 'भोजन तैयारी क्षेत्र',
            foodPrepAreaNonAc: 'भोजन तैयारी क्षेत्र',
            lawnAc: 'लॉन',
            lawnNonAc: 'लॉन',
            roomRentAc: 'कमरे का किराया',
            roomRentNonAc: 'कमरे का किराया',
            parking: 'पार्किंग',
            electricityAc: 'बिजली',
            electricityNonAc: 'बिजली',
            cleaning: 'सफाई',
        },
    };

    const currentContent = content[languageType] || content.en;

    // Fetch the list of all halls when the component mounts
    useEffect(() => {
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
                setHallsError(currentContent.loadingHallsMessage + ' failed.');
            } finally {
                setLoadingHalls(false);
            }
        };

        fetchAllHalls();
    }, [API_BASE_URL, currentContent.loadingHallsMessage]); // Dependencies: API_BASE_URL and content for error message

    // Fetch a new CAPTCHA when a hall is selected or component mounts
    useEffect(() => {
        if (selectedHallId) {
            setCaptchaError("");
            setCaptchaInput(""); // Clear input when new captcha is loaded
            setCaptchaSvg("");
            setCaptchaToken("");
            setSelectedHallDetails(null); // Clear previous details when a new hall is selected
            setShowDetailsAfterCaptcha(false); // Reset display flag

            axios
                .get(`${API_BASE_URL}/captcha/get-captcha`)
                .then((res) => {
                    setCaptchaSvg(res.data.svg);
                    setCaptchaToken(res.data.token);
                })
                .catch((err) => {
                    console.error("Failed to load CAPTCHA:", err);
                    setCaptchaError(currentContent.failedToLoadCaptcha);
                });
        }
    }, [selectedHallId, languageType, API_BASE_URL, currentContent.failedToLoadCaptcha]);


    // Handle dropdown change - only sets the selected hall ID, doesn't fetch details yet
    const handleDropdownChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedHallId(selectedValue);
        setDetailsError(null); // Clear previous errors
        setCaptchaError("");
    };

    // Handle "Show Rent Details" button click
    const handleShowDetails = async () => {
        setLoadingDetails(true);
        setDetailsError(null);
        setCaptchaError("");
        setShowDetailsAfterCaptcha(false); // Hide details until re-verified

        if (!captchaInput) {
            setCaptchaError(currentContent.enterCaptcha);
            setLoadingDetails(false);
            return;
        }

        try {
            // 1. Verify CAPTCHA first
            const captchaRes = await axios.post(`${API_BASE_URL}/captcha/verify-captcha`, {
                captchaInput,
                captchaToken,
            });

            if (!captchaRes.data?.success) {
                throw new Error(currentContent.invalidCaptcha);
            }

            // If CAPTCHA is successful, proceed with fetching hall details
            const response = await axios.get(`${API_BASE_URL}/halls/${selectedHallId}`);
            if (!response.data) {
                throw new Error(currentContent.hallNotFound);
            }
            setSelectedHallDetails(response.data);
            setShowDetailsAfterCaptcha(true); // Display details after successful CAPTCHA and fetch

        } catch (err) {
            console.error("Details fetch/CAPTCHA error:", err.response || err.message);
            let errorMessage = err.message || currentContent.fetchingDetailsMessage + ' failed.';

            if (err.message === currentContent.invalidCaptcha) {
                setCaptchaError(errorMessage); // Specific error for CAPTCHA
            } else if (err.response?.data?.message) {
                setDetailsError(err.response.data.message);
            } else {
                setDetailsError(errorMessage);
            }

            // Always try to refresh CAPTCHA on any error
            try {
                const r2 = await axios.get(`${API_BASE_URL}/captcha/get-captcha`);
                setCaptchaSvg(r2.data.svg);
                setCaptchaToken(r2.data.token);
                setCaptchaInput(""); // Clear input on refresh
            } catch (e2) {
                console.error("Failed to reload CAPTCHA after error:", e2);
                setCaptchaError(currentContent.failedToLoadCaptcha);
            }
        } finally {
            setLoadingDetails(false);
        }
    };


    // Helper function to render fixed price tables for AC or Non-AC, now including event pricing
    const renderFixedPriceTable = (data, title, type, eventPricing) => {
        let combinedData = [];

        // Add event pricing first
        if (eventPricing && eventPricing.length > 0) {
            eventPricing.forEach(event => {
                let prices;
                if (type === 'AC') {
                    prices = event.prices_per_sqft_ac;
                } else if (type === 'Non-AC') {
                    prices = event.prices_per_sqft_nonac;
                }
                if (prices) {
                    // Store a flag to indicate it's an event for styling
                    combinedData.push([event.event_type, prices, true]);
                }
            });
        }

        // Add fixed price items
        Object.entries(data).forEach(([key, prices]) => {
            // Only add items relevant to the current table type (AC or Non-AC)
            // and ensure common items like parking/cleaning are added only once
            const isAcItem = key.endsWith('Ac');
            const isNonAcItem = key.endsWith('NonAc');
            const isCommonItem = ['parking', 'cleaning'].includes(key);

            if (
                (type === 'AC' && (isAcItem || isCommonItem || key === 'electricityAc')) ||
                (type === 'Non-AC' && (isNonAcItem || isCommonItem || key === 'electricityNonAc'))
            ) {
                // Ensure unique entry for common items like parking/cleaning
                if (!combinedData.some(item => item[0] === key)) {
                    combinedData.push([key, prices, false]); // false indicates it's not an event
                }
            }
        });

        if (combinedData.length === 0) {
            return null; // Don't render table if no items after filtering
        }

        return (
            <div className="rental-details-chart">
                <h4><DollarSign size={20} className="icon-inline" /> {title}</h4>
                <table className="rental-details-chart__table">
                    <thead>
                        <tr>
                            <th>{currentContent.categoryHeader}</th>
                            <th>{currentContent.municipalHeader}</th>
                            <th>{currentContent.municipalityHeader}</th>
                            <th>{currentContent.panchayatHeader}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {combinedData.map(([key, prices, isEvent], index) => {
                            let displayKey = currentContent[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
                            // Remove "(AC)" or "(Non-AC)" if present
                            displayKey = displayKey.replace(/\s*\(AC\)\s*$/, '').replace(/\s*\(Non-AC\)\s*$/, '');

                            return (
                                <tr key={index}>
                                    <td>
                                        {isEvent ? <strong>{displayKey}</strong> : displayKey}
                                    </td>
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
        <section className="rental-section">
            <div className="rental-container">
                <h2 className="rental-section__heading"><Home size={36} className="icon-inline" /> {currentContent.sectionHeading}</h2>

                <div className="rental-section__content">
                    <div className="rental-form-block"> {/* The white card */}
                        <div className="rental-form-group"> {/* Reuse form-group styling for label+select */}
                            <label htmlFor="baratghar-select">
                                <MapPin size={18} className="icon-inline" /> {currentContent.dropdownLabel}
                            </label>
                            {loadingHalls ? (
                                <p className="ca-availability-message">
                                    {currentContent.loadingHallsMessage}
                                </p>
                            ) : hallsError ? (
                                <p className="rental-info-message rental-message--error"> {hallsError}</p>
                            ) : (
                                <select
                                    id="baratghar-select"
                                    value={selectedHallId}
                                    onChange={handleDropdownChange}
                                    required
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

                        {/* Display messages based on state */}
                        {!selectedHallId && !loadingHalls && !hallsError && (
                            <p className="ca-availability-message"> {currentContent.selectHallMessage}</p>
                        )}

                        {selectedHallId && !loadingHalls && !hallsError && !showDetailsAfterCaptcha && (
                            <div className="captcha-and-details-section">
                                {/* CAPTCHA IMAGE & INPUT */}
                                {captchaSvg && (
                                    <div className="captcha-wrapper">
                                        <input
                                            type="text"
                                            placeholder={currentContent.enterCaptcha}
                                            value={captchaInput}
                                            onChange={(e) => setCaptchaInput(e.target.value)}
                                            required
                                        />
                                        <div
                                            dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                            style={{ marginBottom: "0.5rem" }}
                                        />
                                    </div>
                                )}

                                {/* Error/Success Messages for CAPTCHA */}
                                {captchaError && <div className="rental-message rental-message--error">{captchaError}</div>}


                                <button
                                    className="show-details-button"
                                    onClick={handleShowDetails}
                                    disabled={!selectedHallId || loadingDetails}
                                >
                                    {loadingDetails ? currentContent.fetchingDetailsMessage : currentContent.showDetailsButton}
                                </button>
                            </div>
                        )}


                        {loadingDetails && !selectedHallDetails && (
                            <p className="ca-availability-message"> {currentContent.fetchingDetailsMessage}</p>
                        )}

                        {detailsError && (
                            <p className="ca-availability-message rental-message--error"> {detailsError}</p>
                        )}

                        {/* Hall Details (Location, Capacity, Total Floors, Description) and Pricing Tables */}
                        {selectedHallDetails && !loadingDetails && !detailsError && showDetailsAfterCaptcha && (
                            <div className="rental-hall-details">
                                <h4> {selectedHallDetails.hall_name} Details</h4>
                               <div className='det'>
                                <p><strong><MapPin size={16} className="icon-inline" /> {currentContent.locationLabel}:</strong> {selectedHallDetails.location}</p>
                                <p><strong><Users size={16} className="icon-inline" /> {currentContent.capacityLabel}:</strong> {selectedHallDetails.capacity}</p>
                                <p><strong><Building size={16} className="icon-inline" /> {currentContent.totalFloorsLabel}:</strong> {selectedHallDetails.total_floors}</p>
                                </div>
                                {selectedHallDetails.description && (
                                    <p><strong><BookOpen size={16} className="icon-inline" /> {currentContent.descriptionLabel}:</strong> {selectedHallDetails.description}</p>
                                )}

                                <div className="rental-pricing-tables-wrapper">
                                    {/* AC Fixed Price Blocks Table */}
                                    {renderFixedPriceTable({
                                        conferenceHallAc: selectedHallDetails.conference_hall_ac,
                                        foodPrepAreaAc: selectedHallDetails.food_prep_area_ac,
                                        lawnAc: selectedHallDetails.lawn_ac,
                                        roomRentAc: selectedHallDetails.room_rent_ac,
                                        parking: selectedHallDetails.parking, // Common item
                                        electricityAc: selectedHallDetails.electricity_ac,
                                        cleaning: selectedHallDetails.cleaning, // Common item
                                    }, currentContent.acPricesHeading, 'AC', selectedHallDetails.event_pricing)}

                                    {/* Non-AC Fixed Price Blocks Table */}
                                    {renderFixedPriceTable({
                                        conferenceHallNonAc: selectedHallDetails.conference_hall_nonac,
                                        foodPrepAreaNonAc: selectedHallDetails.food_prep_area_nonac,
                                        lawnNonAc: selectedHallDetails.lawn_nonac,
                                        roomRentNonAc: selectedHallDetails.room_rent_nonac,
                                        parking: selectedHallDetails.parking, // Common item
                                        electricityNonAc: selectedHallDetails.electricity_nonac,
                                        cleaning: selectedHallDetails.cleaning, // Common item
                                    }, currentContent.nonAcPricesHeading, 'Non-AC', selectedHallDetails.event_pricing)}
                                </div>
                            </div>
                        )}

                        {/* Notes Section (Inside the card) */}
                        <div className="rental-notes-card" style={{ marginTop: '20px' }}>
                            <h3 className="rental-notes-card__heading"><BookOpen size={22} className="icon-inline" /> {currentContent.notesHeading}</h3>
                            <ul className="rental-notes-card__list">
                                {/* Only render if note is not empty */}
                                {currentContent.note1 && <li className="rental-notes-card__list-item">1. {currentContent.note1}</li>}
                                {currentContent.note2 && <li className="rental-notes-card__list-item">2. {currentContent.note2}</li>}
                                {currentContent.note3 && <li className="rental-notes-card__list-item">3. {currentContent.note3}</li>}
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckRentSection;