// CheckRentSection.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import './styles/CheckRent.css';

const CheckRentSection = ({ languageType = 'en' }) => {
    // State to store the list of available halls fetched from the API
    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);

    // State for the selected hall and its rent data
    const [selectedHallId, setSelectedHallId] = useState('');
    const [rentData, setRentData] = useState(null); // State to display rent data for the selected hall
    const [loadingRent, setLoadingRent] = useState(false);
    const [rentError, setRentError] = useState(null);

    // Base URL for API calls
    const API_BASE_URL = 'http://localhost:5000/api';

    // Content for the section (remains mostly the same)
    const content = {
        en: {
            sectionHeading: 'Check Rent Details',
            dropdownLabel: 'BaratGhar Name',
            selectHallPlaceholder: 'Select BaratGhar', // Added placeholder text
            notesHeading: 'NOTES : Terms & Condition are also apply.',
            note1: '(1). Commercial : 2.5 time multiple Extra charges on baratghar rent applied in Commercial Category.',
            note2: '(2). Social : Normal Charges',
            note3: '(3). Non-Commercial : Get 50% Extra Discount on Commercial baratghar rent charges.',
            rentTableCategoryHeader: 'Category',
            rentTableRentHeader: 'Rent (Per Day)',
            categoryCommercial: 'Commercial',
            categorySocial: 'Social',
            categoryNonCommercial: 'Non-Commercial',
            loadingHallsMessage: 'Loading halls...',
            fetchingRentMessage: 'Fetching rent details...',
            selectHallMessage: 'Please select a BaratGhar to see rent details.', // Message when no hall is selected
            hallNotFound: 'Rent details not found for the selected hall.', // Message if API returns 404 for rent
        },
        hi: {
            sectionHeading: 'किराया विवरण जांचें',
            dropdownLabel: 'बारात घर का नाम',
            selectHallPlaceholder: 'बारात घर चुनें', // Added placeholder text
            notesHeading: 'नोट्स : नियम और शर्तें भी लागू होती हैं।',
            note1: '(१). वाणिज्यिक : वाणिज्यिक श्रेणी में लागू बारात घर किराए पर २.५ गुना अतिरिक्त शुल्क।',
            note2: '(२). सामाजिक : सामान्य शुल्क',
            note3: '(३). गैर-वाणिज्यिक : वाणिज्यिक बारात घर किराए पर ५०% अतिरिक्त छूट प्राप्त करें।',
            rentTableCategoryHeader: 'श्रेणी',
            rentTableRentHeader: 'किराया (प्रति दिन)',
            categoryCommercial: 'वाणिज्यिक',
            categorySocial: 'सामाजिक',
            categoryNonCommercial: 'गैर-वाणिज्यिक',
            loadingHallsMessage: 'बारात घर लोड हो रहे हैं...',
            fetchingRentMessage: 'किराया विवरण प्राप्त हो रहा है...',
            selectHallMessage: 'किराया विवरण देखने के लिए कृपया एक बारात घर चुनें।', // Message when no hall is selected
            hallNotFound: 'चयनित बारात घर के लिए किराया विवरण नहीं मिला।', // Message if API returns 404 for rent
        },
    };

    const currentContent = content[languageType] || content.en;

    // Fetch the list of all halls when the component mounts
    useEffect(() => {
        const fetchAllHalls = async () => {
            setLoadingHalls(true);
            setHallsError(null);
            try {
                // GET /api/halls is a public route based on your hallRoutes.js
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


    // Handle dropdown change and fetch rent data for the selected hall
    const handleDropdownChange = async (event) => {
        const selectedValue = event.target.value;
        setSelectedHallId(selectedValue);
        setRentData(null); // Clear previous rent data
        setRentError(null); // Clear previous error

        if (selectedValue) { // Only fetch if a hall is selected (not the placeholder)
            setLoadingRent(true);
            try {
                // GET /api/halls/:id is a public route based on your hallRoutes.js
                const response = await fetch(`${API_BASE_URL}/halls/${selectedValue}`);
                if (!response.ok) {
                     if (response.status === 404) {
                         throw new Error(currentContent.hallNotFound);
                     }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                // Assuming the fetched hall data contains rent_commercial, rent_social, rent_non_commercial
                setRentData({
                    commercial: data.rent_commercial,
                    social: data.rent_social,
                    nonCommercial: data.rent_non_commercial,
                });
            } catch (error) {
                console.error('Error fetching rent data:', error);
                setRentError(error.message || currentContent.fetchingRentMessage + ' failed.');
            } finally {
                setLoadingRent(false);
            }
        }
    };

    return (
        <section className="check-rent-section">
            <div className="container">
                <h2 className="check-rent-section-heading">{currentContent.sectionHeading}</h2>

                <div className="check-rent-content">
                    <div className="check-rent-form-block"> {/* The white card */}
                        <div className="form-group"> {/* Reuse form-group styling for label+select */}
                            <label htmlFor="baratghar-select">{currentContent.dropdownLabel}</label>
                            {loadingHalls ? (
                                <p>{currentContent.loadingHallsMessage}</p>
                            ) : hallsError ? (
                                <p style={{ color: 'red' }}>{hallsError}</p>
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
                            <p className="info-message">{currentContent.selectHallMessage}</p>
                        )}

                        {loadingRent && (
                            <p>{currentContent.fetchingRentMessage}</p>
                        )}

                        {rentError && (
                            <p style={{ color: 'red' }}>{rentError}</p>
                        )}


                        {/* Rent Details Table (Conditional Rendering) */}
                        {rentData && !loadingRent && !rentError && (
                            <div className="rent-details-chart">
                                <h4>{currentContent.sectionHeading}</h4> {/* Using section heading for table title */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>{currentContent.rentTableCategoryHeader}</th>
                                            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>{currentContent.rentTableRentHeader}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{currentContent.categoryCommercial}</td>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{rentData.commercial}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{currentContent.categorySocial}</td>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{rentData.social}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{currentContent.categoryNonCommercial}</td>
                                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{rentData.nonCommercial}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Notes Section (Inside the card) */}
                        <div className="check-rent-notes-card" style={{ marginTop: '20px' }}>
                            <h3 className="notes-heading">{currentContent.notesHeading}</h3>
                            <ul>
                                <li>{currentContent.note1}</li>
                                <li>{currentContent.note2}</li>
                                <li>{currentContent.note3}</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckRentSection;
