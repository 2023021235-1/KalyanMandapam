// CheckRentSection.jsx
import React, { useState, useEffect } from 'react';
import './styles/CheckRent.css';
// Import necessary icons from 'lucide-react'
// Example imports:
// import { Home, MapPin, Users, Info } from 'lucide-react';


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
    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';

    // Content for the section (remains mostly the same)
    const content = {
        en: {
            sectionHeading: 'Check Rent & Details', // Updated heading
            dropdownLabel: 'BaratGhar Name',
            selectHallPlaceholder: 'Select BaratGhar',
            notesHeading: 'NOTES : Terms & Condition are also apply.',
            note1: '(1). Commercial : 2.5 time multiple Extra charges on baratghar rent applied in Commercial Category.',
            note2: '(2). Social : Normal Charges',
            note3: '(3). Non-Commercial : Get 50% Extra Discount on Commercial baratghar rent charges.',
            rentTableCategoryHeader: 'Category',
            rentTableRentHeader: 'Rent (Per Day)',
            categoryCommercial: 'Commercial',
            categorySocial: 'Social',
            categoryNonCommercial: 'Non-Commercial',
            locationLabel: 'Location', // Added location label
            capacityLabel: 'Capacity', // Added capacity label
            loadingHallsMessage: 'Loading halls...',
            fetchingDetailsMessage: 'Fetching details...', // Updated message
            selectHallMessage: 'Please select a BaratGhar to see details.', // Updated message
            hallNotFound: 'Details not found for the selected hall.', // Updated message
        },
        hi: {
            sectionHeading: 'किराया और विवरण जांचें', // Updated heading
            dropdownLabel: 'बारात घर का नाम',
            selectHallPlaceholder: 'बारात घर चुनें',
            notesHeading: 'नोट्स : नियम और शर्तें भी लागू होती हैं।',
            note1: '(१). वाणिज्यिक : वाणिज्यिक श्रेणी में लागू बारात घर किराए पर २.५ गुना अतिरिक्त शुल्क।',
            note2: '(२). सामाजिक : सामान्य शुल्क',
            note3: '(३). गैर-वाणिज्यिक : वाणिज्यिक बारात घर किराए पर ५०% अतिरिक्त छूट प्राप्त करें।',
            rentTableCategoryHeader: 'श्रेणी',
            rentTableRentHeader: 'किराया (प्रति दिन)',
            categoryCommercial: 'वाणिज्यिक',
            categorySocial: 'सामाजिक',
            categoryNonCommercial: 'गैर-वाणिज्यिक',
            locationLabel: 'स्थान', // Added location label
            capacityLabel: 'क्षमता', // Added capacity label
            loadingHallsMessage: 'बारात घर लोड हो रहे हैं...',
            fetchingDetailsMessage: 'विवरण प्राप्त हो रहा है...', // Updated message
            selectHallMessage: 'विवरण देखने के लिए कृपया एक बारात घर चुनें।', // Updated message
            hallNotFound: 'चयनित बारात घर के लिए विवरण नहीं मिला।', // Updated message
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

    return (
        <section className="rental-section">
            <div className="rental-container">
                {/* Example of adding an icon next to the heading */}
                {/* <h2 className="rental-section__heading"><Home size={36} className="icon-inline" /> {currentContent.sectionHeading}</h2> */}
                <h2 className="rental-section__heading">{currentContent.sectionHeading}</h2>

                <div className="rental-section__content">
                    <div className="rental-form-block"> {/* The white card */}
                        <div className="rental-form-group"> {/* Reuse form-group styling for label+select */}
                            <label htmlFor="baratghar-select">
                                {/* Example of adding an icon next to the label */}
                                {/* <MapPin size={18} className="icon-inline" /> {currentContent.dropdownLabel} */}
                                {currentContent.dropdownLabel}
                                </label>
                            {loadingHalls ? (
                                <p className="rental-info-message">
                                    {/* Example of adding a loading icon */}
                                    {/* <Loader size={18} className="icon-spin" /> {currentContent.loadingHallsMessage} */}
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
                                {/* Example of adding a loading icon */}
                                {/* <Loader size={18} className="icon-spin" /> {currentContent.fetchingDetailsMessage} */}
                                {currentContent.fetchingDetailsMessage}
                                </p>
                        )}

                        {detailsError && (
                            <p className="rental-info-message" style={{ color: 'red' }}>{detailsError}</p>
                        )}

                        {/* Hall Details (Location and Capacity) and Rent Details Table (Conditional Rendering) */}
                        {selectedHallDetails && !loadingDetails && !detailsError && (
                            <div className="rental-hall-details">
                                {/* Example of adding an icon next to the hall details heading */}
                                {/* <h4><Info size={20} className="icon-inline" /> {selectedHallDetails.hall_name} Details</h4> */}
                                <h4>{selectedHallDetails.hall_name} Details</h4> {/* Display hall name as title */}
                                <p><strong>{currentContent.locationLabel}:</strong> {selectedHallDetails.location}</p>
                                <p><strong>{currentContent.capacityLabel}:</strong> {selectedHallDetails.capacity}</p>

                                <div className="rental-details-chart" style={{ marginTop: '20px' }}>
                                    {/* Example of adding an icon next to the rent table heading */}
                                    {/* <h4><DollarSign size={20} className="icon-inline" /> {currentContent.rentTableRentHeader}</h4> */}
                                    <h4>{currentContent.rentTableRentHeader}</h4> {/* Rent details table title */}
                                    <table className="rental-details-chart__table">
                                        <thead>
                                            <tr style={{ backgroundColor: '#f2f2f2' }}>
                                                <th>{currentContent.rentTableCategoryHeader}</th>
                                                <th>{currentContent.rentTableRentHeader}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{currentContent.categoryCommercial}</td>
                                                <td>{selectedHallDetails.rent_commercial}</td>
                                            </tr>
                                            <tr>
                                                <td>{currentContent.categorySocial}</td>
                                                <td>{selectedHallDetails.rent_social}</td>
                                            </tr>
                                            <tr>
                                                <td>{currentContent.categoryNonCommercial}</td>
                                                <td>{selectedHallDetails.rent_non_commercial}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Notes Section (Inside the card) */}
                        <div className="rental-notes-card" style={{ marginTop: '20px' }}>
                            {/* Example of adding an icon next to the notes heading */}
                            {/* <h3 className="rental-notes-card__heading"><BookOpen size={22} className="icon-inline" /> {currentContent.notesHeading}</h3> */}
                            <h3 className="rental-notes-card__heading">{currentContent.notesHeading}</h3>
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