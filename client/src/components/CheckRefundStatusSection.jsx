import React, { useState, useEffect, useCallback,useMemo } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import './styles/CheckRefundStatus.css';
import { RefreshCw } from 'lucide-react'; // Import the refresh icon

const CheckRefundStatusSection = ({ languageType = 'en', user }) => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [refundResult, setRefundResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // CAPTCHA State
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");


    // Base URL for API calls
    const API_BASE_URL = 'http://localhost:5000/api';

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const content = useMemo(() => ({ // Wrapped content in useMemo
        en: {
            sectionHeading: 'Check Refund Status',
            bookingIdLabel: 'Enter Booking ID',
            checkStatusButton: 'Check Status',
            placeholder: 'e.g., BOOK12345',
            statusLabel: 'Status:',
            amountLabel: 'Refund Amount:',
            dateLabel: 'Processed Date:',
            notFoundMessage: 'No refund status found for this Booking ID.',
            enterIdMessage: 'Please enter a Booking ID to check the refund status.',
            statusProcessed: 'Processed',
            statusPending: 'Pending',
            statusRejected: 'Rejected',
            statusNA: 'N/A',
            loadingMessage: 'Checking status...',
            fetchErrorMessage: 'Failed to fetch refund status.',
            // CAPTCHA Strings
            captchaLabel: 'CAPTCHA:',
            captchaPlaceholder: 'Enter CAPTCHA',
            captchaRefreshAlt: 'Refresh CAPTCHA',
            captchaErrorLoad: 'Failed to load CAPTCHA. Try again.',
            captchaErrorVerifyGeneral: 'CAPTCHA verification failed. Please try again.',
            captchaErrorInvalid: 'Invalid CAPTCHA. Please try again.',
            captchaErrorEmpty: 'Please enter the CAPTCHA.',
            confirmActionPromptCaptcha: 'Please complete the CAPTCHA to check status.',
            loadingCaptchaMessage: 'Loading CAPTCHA...',
        },
        hi: {
            sectionHeading: 'रिफंड स्थिति जांचें',
            bookingIdLabel: 'बुकिंग आईडी दर्ज करें',
            checkStatusButton: 'स्थिति जांचें',
            placeholder: 'जैसे, BOOK12345',
            statusLabel: 'स्थिति:',
            amountLabel: 'रिफंड राशि:',
            dateLabel: 'प्रक्रिया तिथि:',
            notFoundMessage: 'इस बुकिंग आईडी के लिए कोई रिफंड स्थिति नहीं मिली।',
            enterIdMessage: 'रिफंड स्थिति जांचने के लिए कृपया बुकिंग आईडी दर्ज करें।',
            statusProcessed: 'प्रक्रियाधीन',
            statusPending: 'लंबित',
            statusRejected: 'अस्वीकृत',
            statusNA: 'लागू नहीं',
            loadingMessage: 'स्थिति जांच हो रही है...',
            fetchErrorMessage: 'रिफंड स्थिति प्राप्त करने में विफल।',
            // CAPTCHA Strings
            captchaLabel: 'कैप्चा:',
            captchaPlaceholder: 'कैप्चा दर्ज करें',
            captchaRefreshAlt: 'कैप्चा रीफ़्रेश करें',
            captchaErrorLoad: 'कैप्चा लोड करने में विफल। पुनः प्रयास करें।',
            captchaErrorVerifyGeneral: 'कैप्चा सत्यापन विफल। कृपया पुनः प्रयास करें।',
            captchaErrorInvalid: 'अमान्य कैप्चा। कृपया पुनः प्रयास करें।',
            captchaErrorEmpty: 'कृपया कैप्चा दर्ज करें।',
            confirmActionPromptCaptcha: 'स्थिति जांचने के लिए कृपया कैप्चा पूरा करें।',
            loadingCaptchaMessage: 'कैप्चा लोड हो रहा है...',
        },
    }), [languageType]); // Added languageType as dependency

    const currentContent = content[languageType] || content.en;

    const fetchNewCaptcha = useCallback(async () => { // Wrapped in useCallback
        setCaptchaError('');
        setCaptchaInput('');
        setCaptchaSvg('');
        setCaptchaToken('');
        try {
            const response = await fetch(`${API_BASE_URL}/captcha/get-captcha`);
            if (!response.ok) throw new Error(currentContent.captchaErrorLoad);
            const data = await response.json();
            setCaptchaSvg(data.svg);
            setCaptchaToken(data.token);
        } catch (error) {
            console.error("Failed to load CAPTCHA:", error);
            setCaptchaError(error.message || currentContent.captchaErrorLoad);
        }
    }, [currentContent.captchaErrorLoad]);


    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            fetchNewCaptcha(); // Fetch CAPTCHA when component loads and user is authenticated
        }
    }, [user, navigate, fetchNewCaptcha]);


    const verifyCaptchaAndProceed = async (actualActionCallback) => {
        if (!captchaInput.trim() || !captchaToken) {
            setCaptchaError(currentContent.captchaErrorEmpty);
            if (!captchaToken) fetchNewCaptcha(); // Attempt to load if token is missing
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
            setCaptchaError(''); // Clear error on success
            if (actualActionCallback) await actualActionCallback();
            return true;
        } catch (error) {
            console.error("CAPTCHA verification error:", error);
            setCaptchaError(error.message || currentContent.captchaErrorVerifyGeneral);
            fetchNewCaptcha(); // Refresh CAPTCHA on failure
            return false;
        }
    };


    if (!user) {
        return null;
    }

    const handleInputChange = (event) => {
        setBookingId(event.target.value);
        setRefundResult(null);
        setError(null);
        setCaptchaError(''); // Clear CAPTCHA error on input change
    };

    const handleCheckStatus = async () => {
        if (!bookingId.trim()) {
            alert(currentContent.enterIdMessage);
            setRefundResult(null);
            setError(null); // Clear general error
            setCaptchaError(''); // Also clear captcha error as the main issue is booking ID
            return;
        }

        const actualFetchRefundStatus = async () => {
            setLoading(true);
            setError(null);
            setRefundResult(null);

            const token = getAuthToken();
            if (!token) {
                setError('Authentication token not found. Cannot check refund status.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingId.trim()}/refund-status`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 404) {
                    setRefundResult(undefined); 
                } else if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                } else {
                    const data = await response.json();
                    setRefundResult({
                        status: data.refund_status,
                        amount: data.refund_amount,
                        date: data.refund_processed_date ? new Date(data.refund_processed_date).toLocaleDateString() : currentContent.statusNA,
                    });
                }
                setCaptchaInput(''); // Clear captcha input after successful action
                // fetchNewCaptcha(); // Optionally fetch a new captcha immediately
            } catch (error) {
                console.error('Error fetching refund status:', error);
                setError(error.message || currentContent.fetchErrorMessage);
                setRefundResult(null);
            } finally {
                setLoading(false);
            }
        };
        await verifyCaptchaAndProceed(actualFetchRefundStatus);
    };

    const getLocalizedStatus = (status) => {
        switch (status) {
            case 'Processed': return currentContent.statusProcessed;
            case 'Pending': return currentContent.statusPending;
            case 'Rejected': return currentContent.statusRejected;
            default: return status || currentContent.statusNA;
        }
    };

    const renderCaptchaSection = () => (
        <div className="crs-form-group crs-captcha-section">
            <label htmlFor="crs-captcha-input" style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                {currentContent.captchaLabel}
            </label>
            {captchaSvg ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div className="crs-captcha-svg-container" dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                    <button
                        type="button"
                        onClick={fetchNewCaptcha}
                        className="crs-refresh-captcha-btn"
                        title={currentContent.captchaRefreshAlt}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            ) : (
                 <p className="crs-message">{currentContent.loadingCaptchaMessage}</p>
            )}
            <input
                type="text"
                id="crs-captcha-input"
                className="crs-input"
                placeholder={currentContent.captchaPlaceholder}
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                disabled={loading || !captchaToken}
            />
            {captchaError && <p className="crs-message crs-error-message" style={{color: 'red', fontSize: '0.9em', marginTop: '5px', textAlign: 'left'}}>{captchaError}</p>}
        </div>
    );

    return (
        <section className="crs-section">
            <div className="crs-container">
                <h2 className="crs-section-heading">{currentContent.sectionHeading}</h2>
                <div className="crs-main-content-block">
                    <div className="crs-form-controls">
                        <div className="crs-form-group">
                            <label htmlFor="crs-booking-id">{currentContent.bookingIdLabel}</label>
                            <input
                                type="text"
                                id="crs-booking-id"
                                value={bookingId}
                                onChange={handleInputChange}
                                placeholder={currentContent.placeholder}
                                className="crs-input"
                                disabled={loading}
                            />
                        </div>

                        {/* CAPTCHA Section Rendered Here */}
                        {renderCaptchaSection()}

                        <button
                            className="crs-check-button"
                            onClick={handleCheckStatus}
                            disabled={loading || !bookingId.trim() || !captchaToken} // Disable if no bookingId or no captchaToken
                        >
                            {loading && !captchaError ? currentContent.loadingMessage : currentContent.checkStatusButton}
                        </button>
                    </div>

                    <div className="crs-results-area">
                        {!bookingId.trim() && !loading && !error && refundResult === null && !captchaError && ( // Show only if booking ID is empty and no other states active
                             <p className="crs-message">{currentContent.enterIdMessage}</p>
                        )}

                        {loading && !captchaError && ( // Show loading only if not a captcha error state
                            <p className="crs-message">{currentContent.loadingMessage}</p>
                        )}

                        {error && ( // General error from API
                            <p className="crs-message crs-error-message" style={{ color: 'red' }}>{error}</p>
                        )}
                        
                        {/* Display refundResult if it's undefined (not found) and no general error or CAPTCHA error */}
                        {!loading && !error && refundResult === undefined && !captchaError && (
                            <p className="crs-message crs-not-found-message">{currentContent.notFoundMessage}</p>
                        )}

                        {/* Display refundResult if it has data and no general error or CAPTCHA error */}
                        {!loading && !error && refundResult && refundResult !== undefined && !captchaError && (
                            <div className="crs-status-details">
                                <p><strong>{currentContent.statusLabel}</strong> {getLocalizedStatus(refundResult.status)}</p>
                                <p><strong>{currentContent.amountLabel}</strong> {typeof refundResult.amount === 'number' ? `₹${refundResult.amount.toFixed(2)}` : refundResult.amount}</p>
                                {refundResult.status === 'Processed' && refundResult.date !== currentContent.statusNA && (
                                    <p><strong>{currentContent.dateLabel}</strong> {refundResult.date}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CheckRefundStatusSection;