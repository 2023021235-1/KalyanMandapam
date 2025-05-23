// CheckRentSection.jsx
import React, { useState, useEffect } from 'react';
import './styles/CheckRent.css';
import { Home, MapPin, Users, Info, DollarSign, Zap, Droplet, Car, Building, Utensils, TreePine, BedDouble, BookOpen, CalendarDays } from 'lucide-react';


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

    // Base URL for API calls
    const API_BASE_URL = 'http://localhost:5000/api';

    // Content for the section (updated to include new pricing labels)
    const content = {
        en: {
            sectionHeading: 'Check Rent & Details',
            dropdownLabel: 'BaratGhar Name',
            selectHallPlaceholder: 'Select BaratGhar',
            notesHeading: 'NOTES : Terms & Condition are also apply.',
            note1: '(1). Commercial : 2.5 time multiple Extra charges on baratghar rent applied in Commercial Category.',
            note2: '(2). Social : Normal Charges',
            note3: '(3). Non-Commercial : Get 50% Extra Discount on Commercial baratghar rent charges.',
            locationLabel: 'Location',
            capacityLabel: 'Capacity',
            totalFloorsLabel: 'Total Floors', // New label
            descriptionLabel: 'Description', // New label
            loadingHallsMessage: 'Loading halls...',
            fetchingDetailsMessage: 'Fetching details...',
            selectHallMessage: 'Please select a BaratGhar to see details.',
            hallNotFound: 'Details not found for the selected hall.',

            // New pricing labels
            fixedPriceBlocksHeading: 'Fixed Price Blocks (Per Day)',
            eventSpecificPricingHeading: 'Event Specific Pricing (Per Sq. Ft. Per Day)',
            categoryHeader: 'Category',
            municipalHeader: 'Municipal',
            municipalityHeader: 'Municipality',
            panchayatHeader: 'Panchayat',
            acPricesHeader: 'AC Prices', // New
            nonAcPricesHeader: 'Non-AC Prices', // New

            // Fixed block names
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
            eventType: 'Event Type',
        },
        hi: {
            sectionHeading: 'किराया और विवरण जांचें',
            dropdownLabel: 'बारात घर का नाम',
            selectHallPlaceholder: 'बारात घर चुनें',
            notesHeading: 'नोट्स : नियम और शर्तें भी लागू होती हैं।',
            note1: '(१). वाणिज्यिक : वाणिज्यिक श्रेणी में लागू बारात घर किराए पर २.५ गुना अतिरिक्त शुल्क।',
            note2: '(२). सामाजिक : सामान्य शुल्क',
            note3: '(३). गैर-वाणिज्यिक : वाणिज्यिक बारात घर किराए पर ५०% अतिरिक्त छूट प्राप्त करें।',
            locationLabel: 'स्थान',
            capacityLabel: 'क्षमता',
            totalFloorsLabel: 'कुल मंजिलें', // New label
            descriptionLabel: 'विवरण', // New label
            loadingHallsMessage: 'बारात घर लोड हो रहे हैं...',
            fetchingDetailsMessage: 'विवरण प्राप्त हो रहा है...',
            selectHallMessage: 'विवरण देखने के लिए कृपया एक बारात घर चुनें।',
            hallNotFound: 'चयनित बारात घर के लिए विवरण नहीं मिला।',

            // New pricing labels
            fixedPriceBlocksHeading: 'निश्चित मूल्य ब्लॉक (प्रति दिन)',
            eventSpecificPricingHeading: 'इवेंट विशिष्ट मूल्य निर्धारण (प्रति वर्ग फुट प्रति दिन)',
            categoryHeader: 'श्रेणी',
            municipalHeader: 'नगरपालिका',
            municipalityHeader: 'नगर निगम',
            panchayatHeader: 'पंचायत',
            acPricesHeader: 'एसी मूल्य', // New
            nonAcPricesHeader: 'गैर-एसी मूल्य', // New

            // Fixed block names
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
            eventType: 'इवेंट प्रकार',
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


    // Handle dropdown change and fetch details for the selected hall
    const handleDropdownChange = async (event) => {
        const selectedValue = event.target.value;
        setSelectedHallId(selectedValue);
        setSelectedHallDetails(null); // Clear previous details
        setDetailsError(null); // Clear previous error

        if (selectedValue) { // Only fetch if a hall is selected (not the placeholder)
            setLoadingDetails(true);
            try {
                const response = await fetch(`${API_BASE_URL}/halls/${selectedValue}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(currentContent.hallNotFound);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Assuming the fetched hall data contains all necessary fields
                setSelectedHallDetails(data);
            } catch (error) {
                console.error('Error fetching hall details:', error);
                setDetailsError(error.message || currentContent.fetchingDetailsMessage + ' failed.');
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    const renderPricingTable = (data, title) => {
        if (!data || Object.keys(data).length === 0) {
            return null; // Don't render if no data
        }
        return (
            <div className="rental-details-chart" style={{ marginTop: '20px' }}>
                <h4>{title}</h4>
                <table className="rental-details-chart__table">
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>{currentContent.categoryHeader}</th>
                            <th>{currentContent.municipalHeader}</th>
                            <th>{currentContent.municipalityHeader}</th>
                            <th>{currentContent.panchayatHeader}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(data).map(([key, prices]) => (
                            <tr key={key}>
                                <td>
                                    {/* Dynamically get label based on key */}
                                    {currentContent[key] || key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                </td>
                                <td>Rs. {prices.municipal}</td>
                                <td>Rs. {prices.municipality}</td>
                                <td>Rs. {prices.panchayat}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderEventPricingTable = (eventPricing) => {
        if (!eventPricing || eventPricing.length === 0) {
            return null;
        }
        return (
            <div className="rental-details-chart" style={{ marginTop: '20px' }}>
                <h4>{currentContent.eventSpecificPricingHeading}</h4>
                <table className="rental-details-chart__table">
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>{currentContent.eventType}</th>
                            <th>{currentContent.acPricesHeader}</th>
                            <th>{currentContent.nonAcPricesHeader}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventPricing.map((event, index) => (
                            <tr key={index}>
                                <td>{event.event_type}</td>
                                <td>
                                    Municipal: Rs. {event.prices_per_sqft_ac.municipal}<br />
                                    Municipality: Rs. {event.prices_per_sqft_ac.municipality}<br />
                                    Panchayat: Rs. {event.prices_per_sqft_ac.panchayat}
                                </td>
                                <td>
                                    Municipal: Rs. {event.prices_per_sqft_nonac.municipal}<br />
                                    Municipality: Rs. {event.prices_per_sqft_nonac.municipality}<br />
                                    Panchayat: Rs. {event.prices_per_sqft_nonac.panchayat}
                                </td>
                            </tr>
                        ))}
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
                                <p className="rental-info-message">
                                    {currentContent.loadingHallsMessage}
                                </p>
                            ) : hallsError ? (
                                <p className="rental-info-message" style={{ color: 'red' }}>{hallsError}</p>
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
                            <p className="rental-info-message">{currentContent.selectHallMessage}</p>
                        )}

                        {loadingDetails && (
                            <p className="rental-info-message">
                                {currentContent.fetchingDetailsMessage}
                            </p>
                        )}

                        {detailsError && (
                            <p className="rental-info-message" style={{ color: 'red' }}>{detailsError}</p>
                        )}

                        {/* Hall Details (Location, Capacity, Total Floors, Description) and Pricing Tables */}
                        {selectedHallDetails && !loadingDetails && !detailsError && (
                            <div className="rental-hall-details">
                                <h4><Info size={20} className="icon-inline" /> {selectedHallDetails.hall_name} Details</h4>
                                <p><strong><MapPin size={16} className="icon-inline" /> {currentContent.locationLabel}:</strong> {selectedHallDetails.location}</p>
                                <p><strong><Users size={16} className="icon-inline" /> {currentContent.capacityLabel}:</strong> {selectedHallDetails.capacity}</p>
                                <p><strong><Building size={16} className="icon-inline" /> {currentContent.totalFloorsLabel}:</strong> {selectedHallDetails.total_floors}</p>
                                {selectedHallDetails.description && (
                                    <p><strong><BookOpen size={16} className="icon-inline" /> {currentContent.descriptionLabel}:</strong> {selectedHallDetails.description}</p>
                                )}

                                {/* Fixed Price Blocks Table */}
                                {renderPricingTable({
                                    conferenceHallAc: selectedHallDetails.conference_hall_ac,
                                    conferenceHallNonAc: selectedHallDetails.conference_hall_nonac,
                                    foodPrepAreaAc: selectedHallDetails.food_prep_area_ac,
                                    foodPrepAreaNonAc: selectedHallDetails.food_prep_area_nonac,
                                    lawnAc: selectedHallDetails.lawn_ac,
                                    lawnNonAc: selectedHallDetails.lawn_nonac,
                                    roomRentAc: selectedHallDetails.room_rent_ac,
                                    roomRentNonAc: selectedHallDetails.room_rent_nonac,
                                    parking: selectedHallDetails.parking,
                                    electricityAc: selectedHallDetails.electricity_ac,
                                    electricityNonAc: selectedHallDetails.electricity_nonac,
                                    cleaning: selectedHallDetails.cleaning,
                                }, currentContent.fixedPriceBlocksHeading)}

                                {/* Event Specific Pricing Table */}
                                {renderEventPricingTable(selectedHallDetails.event_pricing)}

                            </div>
                        )}

                        {/* Notes Section (Inside the card) */}
                        <div className="rental-notes-card" style={{ marginTop: '20px' }}>
                            <h3 className="rental-notes-card__heading"><BookOpen size={22} className="icon-inline" /> {currentContent.notesHeading}</h3>
                            <ul className="rental-notes-card__list">
                                <li className="rental-notes-card__list-item">{currentContent.note1}</li>
                                <li className="rental-notes-card__list-item">{currentContent.note2}</li>
                                <li className="rental-notes-card__list-item">{currentContent.note3}</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckRentSection;
