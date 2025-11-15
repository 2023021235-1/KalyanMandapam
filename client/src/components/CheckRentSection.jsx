// CheckRentSection.jsx
import React, { useState, useEffect } from 'react';
import './styles/CheckRent.css';
import { Home, MapPin, BookOpen, Building } from 'lucide-react';
import axios from 'axios';

const CheckRentSection = ({ languageType = 'en' }) => {
    // State to store the list of available halls
    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);

    // State for the selected hall
    const [selectedHallId, setSelectedHallId] = useState('');
    const [selectedHallDetails, setSelectedHallDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [detailsError, setDetailsError] = useState(null);
    const [showDetailsAfterCaptcha, setShowDetailsAfterCaptcha] = useState(false);

    // CAPTCHA States
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");

    // --- CONFIGURATION & CONTENT ---

    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';

    // Content updated for the new simplified pricing model
    const content = {
        en: {
            sectionHeading: 'Check Rent & Details',
            dropdownLabel: 'Community Hall Name',
            selectHallPlaceholder: 'Select a Hall',
            notesHeading: 'Terms & Conditions',
            // Updated notes to be more generic
            note1: 'The rent displayed is a fixed price per booking event.',
            note2: 'All bookings are subject to availability. Please proceed to the booking section to secure your date.',
            note3: 'GST and other applicable taxes may be charged separately.',
            locationLabel: 'Location',
            priceLabel: 'Booking Price',
            loadingHallsMessage: 'Loading halls...',
            fetchingDetailsMessage: 'Fetching details...',
            selectHallMessage: 'Please select a hall to see its price.',
            hallNotFound: 'Details not found for the selected hall.',
            enterCaptcha: 'Please enter the CAPTCHA text.',
            showDetailsButton: 'Show Rent Details',
            invalidCaptcha: 'Invalid CAPTCHA. Please try again.',
            failedToLoadCaptcha: 'Failed to load CAPTCHA. Please refresh.',
        },
        hi: {
            sectionHeading: 'किराया और विवरण जांचें',
            dropdownLabel: 'सामुदायिक भवन का नाम',
            selectHallPlaceholder: 'एक हॉल चुनें',
            notesHeading: 'नियम एवं शर्तें',
            note1: 'प्रदर्शित किराया प्रति बुकिंग कार्यक्रम के लिए एक निश्चित मूल्य है।',
            note2: 'सभी बुकिंग उपलब्धता के अधीन हैं। अपनी तिथि सुरक्षित करने के लिए कृपया बुकिंग अनुभाग पर जाएँ।',
            note3: 'जीएसटी और अन्य लागू कर अलग से लिए जा सकते हैं।',
            locationLabel: 'स्थान',
            priceLabel: 'बुकिंग मूल्य',
            loadingHallsMessage: 'हॉल लोड हो रहे हैं...',
            fetchingDetailsMessage: 'विवरण प्राप्त हो रहा है...',
            selectHallMessage: 'कीमत देखने के लिए कृपया एक हॉल चुनें।',
            hallNotFound: 'चयनित हॉल के लिए विवरण नहीं मिला।',
            enterCaptcha: 'कृपया कैप्चा टेक्स्ट दर्ज करें।',
            showDetailsButton: 'किराया विवरण दिखाएं',
            invalidCaptcha: 'अमान्य कैप्चा। कृपया पुन प्रयास करें।',
            failedToLoadCaptcha: 'कैप्चा लोड करने में विफल। कृपया रीफ़्रेश करें।',
        },
    };

    const currentContent = content[languageType] || content.en;

    // --- API CALLS & EFFECTS ---

    // Fetch the list of all halls on component mount
    useEffect(() => {
        const fetchAllHalls = async () => {
            setLoadingHalls(true);
            setHallsError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/halls`);
                setAvailableHalls(response.data);
            } catch (error) {
                console.error('Error fetching halls:', error);
                setHallsError('Failed to fetch the list of halls.');
            } finally {
                setLoadingHalls(false);
            }
        };
        fetchAllHalls();
    }, [API_BASE_URL]);

    // Fetch a new CAPTCHA when a hall is selected
    useEffect(() => {
        if (selectedHallId) {
            // Reset states for the new selection
            setCaptchaError("");
            setCaptchaInput("");
            setCaptchaSvg("");
            setCaptchaToken("");
            setSelectedHallDetails(null);
            setShowDetailsAfterCaptcha(false);

            axios.get(`${API_BASE_URL}/captcha/get-captcha`)
                .then((res) => {
                    setCaptchaSvg(res.data.svg);
                    setCaptchaToken(res.data.token);
                })
                .catch((err) => {
                    console.error("Failed to load CAPTCHA:", err);
                    setCaptchaError(currentContent.failedToLoadCaptcha);
                });
        }
    }, [selectedHallId, API_BASE_URL, currentContent.failedToLoadCaptcha]);

    // --- EVENT HANDLERS ---

    const handleDropdownChange = (event) => {
        setSelectedHallId(event.target.value);
        setDetailsError(null);
        setCaptchaError("");
    };

    // Verify CAPTCHA and fetch the simplified hall details
    const handleShowDetails = async () => {
        if (!captchaInput) {
            setCaptchaError(currentContent.enterCaptcha);
            return;
        }
        setLoadingDetails(true);
        setDetailsError(null);
        setCaptchaError("");
        setShowDetailsAfterCaptcha(false);

        try {
            // 1. Verify CAPTCHA
            const captchaRes = await axios.post(`${API_BASE_URL}/captcha/verify-captcha`, { captchaInput, captchaToken });
            if (!captchaRes.data?.success) {
                throw new Error(currentContent.invalidCaptcha);
            }

            // 2. If CAPTCHA is valid, fetch hall details
            const response = await axios.get(`${API_BASE_URL}/halls/${selectedHallId}`);
            setSelectedHallDetails(response.data);
            setShowDetailsAfterCaptcha(true);

        } catch (err) {
            const errorMessage = err.message === currentContent.invalidCaptcha 
                ? err.message 
                : err.response?.data?.message || currentContent.hallNotFound;

            if (err.message === currentContent.invalidCaptcha) {
                setCaptchaError(errorMessage);
            } else {
                setDetailsError(errorMessage);
            }
            
            // Refresh CAPTCHA on error
            axios.get(`${API_BASE_URL}/captcha/get-captcha`)
                .then(res => {
                    setCaptchaSvg(res.data.svg);
                    setCaptchaToken(res.data.token);
                    setCaptchaInput("");
                });
        } finally {
            setLoadingDetails(false);
        }
    };

    // --- RENDER ---

    return (
        <section className="rental-section">
            <div className="rental-container">
                <h2 className="rental-section__heading"><Home size={36} className="icon-inline" /> {currentContent.sectionHeading}</h2>
                <div className="rental-section__content">
                    <div className="rental-form-block">
                        <div className="rental-form-group">
                            <label htmlFor="baratghar-select">
                                <Building size={18} className="icon-inline" /> {currentContent.dropdownLabel}
                            </label>
                            {loadingHalls ? <p>{currentContent.loadingHallsMessage}</p> : hallsError ? <p className="rental-info-message rental-message--error">{hallsError}</p> : (
                                <select id="baratghar-select" value={selectedHallId} onChange={handleDropdownChange} required>
                                    <option value="">{currentContent.selectHallPlaceholder}</option>
                                    {/* MODIFIED: Use hall._id for key and value to match MongoDB */}
                                    {availableHalls.map((hall) => (
                                        <option key={hall._id} value={hall._id}>
                                            {hall.hall_name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {!selectedHallId && !loadingHalls && <p className="ca-availability-message">{currentContent.selectHallMessage}</p>}

                        {/* CAPTCHA section appears after selecting a hall */}
                        {selectedHallId && !showDetailsAfterCaptcha && (
                            <div className="captcha-and-details-section">
                                {captchaSvg && (
                                    <div className="captcha-wrapper">
                                        <input type="text" placeholder={currentContent.enterCaptcha} value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required />
                                        <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                                    </div>
                                )}
                                {captchaError && <div className="rental-message rental-message--error">{captchaError}</div>}
                                <button className="show-details-button" onClick={handleShowDetails} disabled={loadingDetails}>
                                    {loadingDetails ? currentContent.fetchingDetailsMessage : currentContent.showDetailsButton}
                                </button>
                            </div>
                        )}

                        {loadingDetails && <p className="ca-availability-message">{currentContent.fetchingDetailsMessage}</p>}
                        {detailsError && <p className="ca-availability-message rental-message--error">{detailsError}</p>}

                      
                        {selectedHallDetails && showDetailsAfterCaptcha && (
                            <div className="rental-hall-details">
                                <h4>{selectedHallDetails.hall_name}</h4>
                                <div className='det'>
                                    {selectedHallDetails.location && (
                                      <p><strong><MapPin size={16} className="icon-inline" /> {currentContent.locationLabel}:</strong> {selectedHallDetails.location}</p>
                                    )}
                                    <p><strong> {currentContent.priceLabel}:</strong> 
                                        <span className="price-highlight">Rs. {selectedHallDetails.pricing.toLocaleString()}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Notes Section */}
                        <div className="rental-notes-card" style={{ marginTop: '20px' }}>
                            <h3 className="rental-notes-card__heading"><BookOpen size={22} className="icon-inline" /> {currentContent.notesHeading}</h3>
                            <ul className="rental-notes-card__list">
                                {currentContent.note1 && <li>1. {currentContent.note1}</li>}
                                {currentContent.note2 && <li>2. {currentContent.note2}</li>}
                                {currentContent.note3 && <li>3. {currentContent.note3}</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckRentSection;