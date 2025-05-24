// BookingCertificate.jsx
import React from 'react';
import './styles/Certificate.css'; // Assuming Certificate.css is in a 'styles' subdirectory relative to this component

const BookingCertificate = React.forwardRef(({ bookingDetails, userDetails, logoLeftUrl, logoRightUrl }, ref) => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // DD/MM/YYYY

    if (!bookingDetails || !userDetails) {
        return <div ref={ref} className="cert-container error-message">Missing booking or user details for certificate.</div>;
    }
    const hall = bookingDetails.hall_id || {}; // hall_id is an object with hall details

    return (
        <div ref={ref} className="cert-container">
            <div className="cert-header">
                <div className="cert-logo-container cert-logo-left">
                    {logoLeftUrl ? <img src={logoLeftUrl} alt="Left Logo" /> : <div className="logo-placeholder">Logo</div>}
                </div>
                <div className="cert-title-center">
                    <h1 className="cert-hindi-title">नगर निगम गोरखपुर</h1>
                    <h2>Nagar Nigam Gorakhpur</h2>
                </div>
                <div className="cert-logo-container cert-logo-right">
                    {logoRightUrl ? <img src={logoRightUrl} alt="Right Logo" /> : <div className="logo-placeholder">Logo</div>}
                </div>
            </div>

            <div className="cert-body">
                <h3 className="cert-main-heading">Certificate of Booking</h3>
                <p className="cert-issued-date">Date of Issue: {today}</p>

                <div className="cert-details-grid">
                    <div className="cert-detail-item">
                        <span className="cert-label">Booking ID:</span>
                        <span className="cert-value">{bookingDetails.booking_id}</span>
                    </div>
                    <div className="cert-detail-item">
                        <span className="cert-label">Booked By:</span>
                        {/* Use userDetails.name, userDetails.fullName, or fallback as available */}
                        <span className="cert-value">{userDetails.fullName || userDetails.name || userDetails.username || 'N/A'}</span>
                    </div>
                    <div className="cert-detail-item">
                        <span className="cert-label">Hall Name:</span>
                        <span className="cert-value">{hall.hall_name || 'N/A'}</span>
                    </div>
                    <div className="cert-detail-item">
                        <span className="cert-label">Location:</span>
                        <span className="cert-value">{hall.location || 'N/A'}</span>
                    </div>
                    <div className="cert-detail-item">
                        <span className="cert-label">Booking Date:</span>
                        <span className="cert-value">{bookingDetails.booking_date ? new Date(bookingDetails.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}</span>
                    </div>
                    <div className="cert-detail-item">
                        <span className="cert-label">Function Type:</span>
                        <span className="cert-value">{bookingDetails.function_type || 'N/A'}</span>
                    </div>
                    <div className="cert-detail-item">
                        <span className="cert-label">AC/Non-AC:</span>
                        <span className="cert-value">{bookingDetails.is_ac ? 'AC' : 'Non-AC'}</span>
                    </div>
                    <div className="cert-detail-item">
                        <span className="cert-label">Floor:</span>
                        <span className="cert-value">{bookingDetails.floor || 'N/A'}</span>
                    </div>
                     {bookingDetails.area_sqft && parseFloat(bookingDetails.area_sqft) > 0 && (
                        <div className="cert-detail-item">
                            <span className="cert-label">Area Booked:</span>
                            <span className="cert-value">{bookingDetails.area_sqft} sq. ft.</span>
                        </div>
                    )}
                     <div className="cert-detail-item">
                        <span className="cert-label">Booking Amount:</span>
                        <span className="cert-value">Rs. {bookingDetails.booking_amount ? bookingDetails.booking_amount.toFixed(2) : 'N/A'}</span>
                    </div>
                    <div className="cert-detail-item full-span">
                        <span className="cert-label">Booking Status:</span>
                        <span className="cert-value booking-status-confirmed">{bookingDetails.booking_status}</span>
                    </div>
                </div>

                <div className="cert-footer-message">
                    <p>This is a computer-generated certificate and does not require a physical signature.</p>
                    <p>Please present this certificate at the venue. Ensure all terms and conditions are adhered to.</p>
                    <p>For any queries, contact the Welfare Department, Nagar Nigam Gorakhpur.</p>
                </div>
            </div>

            <div className="cert-signature-area">
                <div className="cert-authority-signature">
                    <p>_________________________</p>
                    <p>(Authorized Signatory)</p>
                    <p>Welfare Department, Nagar Nigam Gorakhpur</p>
                </div>
            </div>
        </div>
    );
});

export default BookingCertificate;