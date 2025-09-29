import React from 'react';
import './styles/Certificate.css';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const BookingCertificate = ({ bookingDetails, userName }) => {
  if (!bookingDetails) {
    return <div className="user-dl-empty-data-state">No booking details provided.</div>;
  }

  // Destructure the simplified booking object. hall_id is now a populated object.
  const {
    booking_id,
    transaction_id,
    booking_date,
    booking_amount,
    booking_status,
    createdAt,
    hall_id, // This is the populated hall object: { _id, hall_name, location, pricing }
  } = bookingDetails;

  const hallName = hall_id?.hall_name || 'N/A';
  const hallLocation = hall_id?.location || 'N/A';
  const currentDateOnCertificate = new Date().toLocaleDateString('en-GB');

  return (
    <div className="user-dl-certificate-display-area">
      <div id={`booking-certificate-${booking_id}`} className="user-dl-pdf-layout">
        <div className="user-dl-pdf-page">
          <div className="user-dl-outer-pdf-border">
            <div className="user-dl-pdf-border">
              
              {/* Header */}
              <div className="user-dl-pdf-header">
                <div className="user-dl-pdf-header-left">
                  <img src='/logo.webp' alt="Municipal Logo" className="user-dl-pdf-logo" />
                </div>
                <div className="user-dl-pdf-header-center">
                  <div className="user-dl-pdf-org-name">
                    <h2>Nagar Nigam Gorakhpur</h2>
                    <h3>नगर निगम गोरखपुर</h3>
                  </div>
                </div>
                <div className="user-dl-pdf-header-right">
                  <img src='./up.webp' alt="Govt Logo" className="user-dl-pdf-gov-logo" />
                </div>
              </div>

              {/* Title */}
              <div className="user-dl-pdf-certificate-title">
                <h2>HALL BOOKING CONFIRMATION</h2>
                <h3>हॉल बुकिंग पुष्टि</h3>
              </div>

              {/* Body Content */}
              <div className="user-dl-pdf-body">
                
                {/* Booking Info Section */}
                <div className="user-dl-pdf-info-block">
                  <div className="user-dl-pdf-info-row">
                    <div className="user-dl-pdf-info-label">Booking ID / बुकिंग आईडी</div>
                    <div className="user-dl-pdf-info-value">: {booking_id || "N/A"}</div>
                  </div>
                  <div className="user-dl-pdf-info-row">
                    <div className="user-dl-pdf-info-label">Transaction ID / लेनदेन आईडी</div>
                    <div className="user-dl-pdf-info-value">: {transaction_id || "N/A"}</div>
                  </div>
                  <div className="user-dl-pdf-info-row">
                    <div className="user-dl-pdf-info-label">Issued Date / जारी दिनांक</div>
                    <div className="user-dl-pdf-info-value">: {formatDate(createdAt)}</div>
                  </div>
                  <div className="user-dl-pdf-info-row">
                    <div className="user-dl-pdf-info-label">Booking Date / बुकिंग दिनांक</div>
                    <div className="user-dl-pdf-info-value">: {formatDate(booking_date)}</div>
                  </div>
                </div>

                {/* Applicant Details */}
                <div className="user-dl-pdf-details-section">
                  <div className="user-dl-pdf-section-title">Applicant Details / आवेदक का विवरण</div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Applicant Name / आवेदक का नाम</div>
                    <div className="user-dl-pdf-details-value">: {userName || "N/A"}</div>
                  </div>
                </div>

                {/* Hall Details - SIMPLIFIED */}
                <div className="user-dl-pdf-details-section">
                  <div className="user-dl-pdf-section-title">Hall Details / हॉल का विवरण</div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Hall Name / हॉल का नाम</div>
                    <div className="user-dl-pdf-details-value">: {hallName}</div>
                  </div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Location / स्थान</div>
                    <div className="user-dl-pdf-details-value">: {hallLocation}</div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="user-dl-pdf-details-section">
                  <div className="user-dl-pdf-section-title">Financial & Status Details / वित्तीय और स्थिति विवरण</div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Booking Amount / बुकिंग राशि</div>
                    <div className="user-dl-pdf-details-value">: ₹{booking_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}</div>
                  </div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Booking Status / बुकिंग स्थिति</div>
                    <div className="user-dl-pdf-details-value">: {booking_status || "N/A"}</div>
                  </div>
                </div>

                {/* Footer Elements */}
                <div className="user-dl-pdf-footer-elements-container">
                  <div className="user-dl-pdf-qr-placeholder">QR Code</div>
                  <div className="user-dl-pdf-issuing-authority-block">
                    <div className="user-dl-pdf-stamp-placeholder"><p>Stamp</p></div>
                    <div className="user-dl-pdf-signature-line"></div>
                    <p>Issuing Authority / जारीकर्ता अधिकारी</p>
                  </div>
                </div>
              </div>

              <div className="user-dl-pdf-contact-footer">
                Certificate Generated on: {currentDateOnCertificate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCertificate;