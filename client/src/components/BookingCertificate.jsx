import React from 'react';
import './styles/Certificate.css';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString("en-GB");
};

const BookingCertificate = ({ bookingDetails, userName }) => {
  if (!bookingDetails) {
    return <div className="user-dl-empty-data-state">No booking details provided.</div>;
  }

  const currentDateOnCertificate = new Date().toLocaleDateString('en-GB');
  const {
    hall_id_string,
    booking_id,
    transaction_id,
    booking_date,
    floor,
    function_type,
    area_sqft,
    booking_type,
    is_parking,
    is_conference_hall,
    is_food_prep_area,
    is_lawn,
    is_ac,
    add_parking,
    num_ac_rooms_booked,
    num_non_ac_rooms_booked,
    booking_status,
    booking_amount,
    createdAt,
    refund_status,
    refund_amount,
    refund_processed_date
  } = bookingDetails;

  // Facilities List
  const bookedFacilitiesList = [];
  if (is_parking) bookedFacilitiesList.push("Parking");
  if (is_conference_hall) bookedFacilitiesList.push("Conference Hall");
  if (is_food_prep_area) bookedFacilitiesList.push("Food Preparation Area");
  if (is_lawn) bookedFacilitiesList.push("Lawn");
  if (add_parking && !is_parking) bookedFacilitiesList.push("Additional Parking");

  // Rooms Booked Text
  let roomsBookedText = '';
  if (num_ac_rooms_booked > 0 && num_non_ac_rooms_booked > 0) {
    roomsBookedText = `${num_ac_rooms_booked} (AC), ${num_non_ac_rooms_booked} (Non-AC)`;
  } else if (num_ac_rooms_booked > 0) {
    roomsBookedText = `${num_ac_rooms_booked} (AC)`;
  } else if (num_non_ac_rooms_booked > 0) {
    roomsBookedText = `${num_non_ac_rooms_booked} (Non-AC)`;
  }

  // Optimized Terms
  const termsAndConditions = [
    'Please read all terms & conditions carefully before proceeding with the booking.',
    'Users must provide accurate information. Incorrect details may lead to booking cancellation and penalties as per terms.',
    'For technical or other assistance, contact us at it@nagar_nigam_gkp.gov.in or visit the Welfare Department Helpdesk.',
    'Single-use plastics are banned under the Clean India Mission. Please adhere strictly.',
    'Arrange your own valet parking. A penalty of Rs. 5000 will be deducted from the security deposit for non-compliance.',
    'The Community Hall manager will ensure valet parking arrangements are checked upon handover.',
    'Bookings are non-transferable and non-changeable.'
  ];

  return (
    <div className="user-dl-certificate-display-area">
      <div id={`booking-certificate-${booking_id}`} className="user-dl-pdf-layout">

        {/* Page 1: Main Content */}
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

                {/* Hall Details */}
                <div className="user-dl-pdf-details-section">
                  <div className="user-dl-pdf-section-title">Hall & Function Details / हॉल और समारोह का विवरण</div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Hall Name / हॉल का नाम</div>
                    <div className="user-dl-pdf-details-value">: {hall_id_string || "N/A"}</div>
                  </div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Floor / मंजिल</div>
                    <div className="user-dl-pdf-details-value">: {floor || "N/A"}</div>
                  </div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Function Type / समारोह का प्रकार</div>
                    <div className="user-dl-pdf-details-value">: {function_type || "N/A"}</div>
                  </div>
                  {area_sqft > 0 && (
                    <div className="user-dl-pdf-details-row">
                      <div className="user-dl-pdf-details-label">Area (sq. ft.) / क्षेत्रफल (वर्ग फुट)</div>
                      <div className="user-dl-pdf-details-value">: {area_sqft}</div>
                    </div>
                  )}
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Booking Category / बुकिंग श्रेणी</div>
                    <div className="user-dl-pdf-details-value">: {booking_type || "N/A"}</div>
                  </div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Hall Configuration / हॉल कॉन्फ़िगरेशन</div>
                    <div className="user-dl-pdf-details-value">: {is_ac ? "AC" : "Non-AC"}</div>
                  </div>
                  {(num_ac_rooms_booked > 0 || num_non_ac_rooms_booked > 0) && (
                    <div className="user-dl-pdf-details-row">
                      <div className="user-dl-pdf-details-label">Rooms Booked / बुक किए गए कमरे</div>
                      <div className="user-dl-pdf-details-value">: {roomsBookedText}</div>
                    </div>
                  )}
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Booked Facilities / बुक की गई सुविधाएं</div>
                    <div className="user-dl-pdf-details-value">: {bookedFacilitiesList.join(', ') || "None"}</div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="user-dl-pdf-details-section">
                  <div className="user-dl-pdf-section-title">Financial & Status Details / वित्तीय और स्थिति विवरण</div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Booking Amount / बुकिंग राशि</div>
                    <div className="user-dl-pdf-details-value">: ₹{booking_amount?.toFixed(2) || "0.00"}</div>
                  </div>
                  <div className="user-dl-pdf-details-row">
                    <div className="user-dl-pdf-details-label">Booking Status / बुकिंग स्थिति</div>
                    <div className="user-dl-pdf-details-value">: {booking_status || "N/A"}</div>
                  </div>
                  {refund_status && refund_status !== 'N/A' && (
                    <>
                      <div className="user-dl-pdf-details-row">
                        <div className="user-dl-pdf-details-label">Refund Status / धनवापसी स्थिति</div>
                        <div className="user-dl-pdf-details-value">: {refund_status}</div>
                      </div>
                      <div className="user-dl-pdf-details-row">
                        <div className="user-dl-pdf-details-label">Refund Amount / धनवापसी राशि</div>
                        <div className="user-dl-pdf-details-value">: {refund_amount || "Rs. 0"}</div>
                      </div>
                      {refund_processed_date && (
                        <div className="user-dl-pdf-details-row">
                          <div className="user-dl-pdf-details-label">Refund Processed Date / धनवापसी संसाधित तिथि</div>
                          <div className="user-dl-pdf-details-value">: {formatDate(refund_processed_date)}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer Elements */}
                <div className="user-dl-pdf-footer-elements-container">
                  <div className="user-dl-pdf-qr-placeholder">QR Code</div>
                  <div className="user-dl-pdf-issuing-authority-block">
                    <div className="user-dl-pdf-stamp-placeholder">
                      <p>Stamp</p>
                    </div>
                    <div className="user-dl-pdf-signature-line"></div>
                    <p>Issuing Authority / जारीकर्ता अधिकारी</p>
                  </div>
                </div>
              </div>

              {/* Generated Date Footer */}
              <div className="user-dl-pdf-contact-footer">
                Certificate Generated on: {currentDateOnCertificate}
              </div>
            </div>
          </div>
        </div>

        {/* Page 2: Terms & Conditions */}
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

              {/* Terms Title */}
              <div className="user-dl-pdf-certificate-title user-dl-terms-title">
                <h2>TERMS & CONDITIONS</h2>
                <h3>नियम एवं शर्तें</h3>
              </div>

              {/* Terms Content */}
              <div className="user-dl-pdf-terms-content">
                <ol>
                  {termsAndConditions.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ol>
              </div>

              {/* Footer */}
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