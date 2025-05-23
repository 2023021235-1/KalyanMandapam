import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/CheckRefundStatus.css';

const CheckRefundStatusSection = ({ languageType = 'en', user }) => {
    const navigate = useNavigate();
    const [bookingId, setBookingId] = useState('');
    const [refundResult, setRefundResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Base URL for API calls
    const API_BASE_URL = 'http://localhost:5000/api';

    // Function to get the JWT token (replace with your actual logic)
    const getAuthToken = () => {
        // Example: Get token from local storage
        return localStorage.getItem('token');
        // Or from a context API, etc.
    };


    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    const content = {
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
        },
    };

    const currentContent = content[languageType] || content.en;

    const handleInputChange = (event) => {
        setBookingId(event.target.value);
        setRefundResult(null);
        setError(null);
    };

    const handleCheckStatus = async () => {
        if (!bookingId.trim()) {
            alert(languageType === 'hi' ? 'कृपया बुकिंग आईडी दर्ज करें।' : 'Please enter a Booking ID.');
            setRefundResult(null);
            setError(null);
            return;
        }

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
                setRefundResult(undefined); // Indicate not found
            } else if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            } else {
                const data = await response.json();
                // Assuming backend returns { booking_id, refund_status, refund_amount, refund_processed_date }
                setRefundResult({
                    status: data.refund_status,
                    amount: data.refund_amount,
                    date: data.refund_processed_date ? new Date(data.refund_processed_date).toLocaleDateString() : currentContent.statusNA,
                });
            }

        } catch (error) {
            console.error('Error fetching refund status:', error);
            setError(error.message || currentContent.fetchErrorMessage);
            setRefundResult(null);
        } finally {
            setLoading(false);
        }
    };

    const getLocalizedStatus = (status) => {
        switch (status) {
            case 'Processed':
                return currentContent.statusProcessed;
            case 'Pending':
                return currentContent.statusPending;
            case 'Rejected':
                return currentContent.statusRejected;
            default:
                return status;
        }
    };

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

                        <button
                            className="crs-check-button"
                            onClick={handleCheckStatus}
                            disabled={loading || !bookingId.trim()}
                        >
                            {loading ? currentContent.loadingMessage : currentContent.checkStatusButton}
                        </button>
                    </div>

                    <div className="crs-results-area">
                        {!loading && !error && refundResult === null && (
                            <p className="crs-message">{currentContent.enterIdMessage}</p>
                        )}

                        {loading && (
                            <p className="crs-message">{currentContent.loadingMessage}</p>
                        )}

                        {error && (
                            <p className="crs-message crs-error-message" style={{ color: 'red' }}>{error}</p>
                        )}

                        {!loading && !error && refundResult === undefined && (
                            <p className="crs-message crs-not-found-message">{currentContent.notFoundMessage}</p>
                        )}

                        {!loading && !error && refundResult && refundResult !== undefined && (
                            <div className="crs-status-details">
                                <p><strong>{currentContent.statusLabel}</strong> {getLocalizedStatus(refundResult.status)}</p>
                                <p><strong>{currentContent.amountLabel}</strong> {refundResult.amount}</p>
                                {refundResult.status === 'Processed' && (
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
