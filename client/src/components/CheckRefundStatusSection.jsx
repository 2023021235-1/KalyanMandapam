import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './styles/CheckRefundStatus.css';

const CheckRefundStatusSection = ({ languageType = 'en', user }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [bookingId, setBookingId] = useState('');
  const [refundResult, setRefundResult] = useState(null);

  // useEffect to handle redirection if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]); // Dependencies: user and navigate

  // If user is not logged in, don't render the component content
  if (!user) {
    return null; // Or a loading spinner
  }

  const sampleRefundData = {
    'BOOK12345': { status: 'Processed', amount: 'Rs. 15,000', date: '2023-10-26' },
    'BOOK67890': { status: 'Pending', amount: 'Rs. 20,000', date: 'N/A' },
    'BOOK11223': { status: 'Rejected', amount: 'Rs. 0', date: '2023-11-15' },
  };

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
    },
  };

  const currentContent = content[languageType] || content.en;

  const handleInputChange = (event) => {
    setBookingId(event.target.value);
    setRefundResult(null);
  };

  const handleCheckStatus = () => {
    if (!bookingId.trim()) {
      alert(languageType === 'hi' ? 'कृपया बुकिंग आईडी दर्ज करें।' : 'Please enter a Booking ID.');
      setRefundResult(null);
      return;
    }

    const foundStatus = Object.keys(sampleRefundData).find(
        key => key.toLowerCase() === bookingId.trim().toLowerCase()
    );

    if (foundStatus) {
      setRefundResult(sampleRefundData[foundStatus]);
    } else {
      setRefundResult(undefined);
    }
  };

  const getLocalizedStatus = (status) => {
      switch(status) {
          case 'Processed': return currentContent.statusProcessed;
          case 'Pending': return currentContent.statusPending;
          case 'Rejected': return currentContent.statusRejected;
          default: return status;
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
                  />
                </div>

                <button
                    className="crs-check-button"
                    onClick={handleCheckStatus}
                >
                    {currentContent.checkStatusButton}
                </button>
            </div>

            <div className="crs-results-area">
                {refundResult === null && (
                    <p className="crs-message">{currentContent.enterIdMessage}</p>
                )}

                {refundResult === undefined && (
                    <p className="crs-message crs-not-found-message">{currentContent.notFoundMessage}</p>
                )}

                {refundResult && refundResult !== undefined && (
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