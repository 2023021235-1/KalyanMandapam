import React, { useState } from 'react';
import axios from 'axios';
import './VerifyBooking.css'; // Using the new dedicated stylesheet

// A helper function to format dates into a more readable format
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// A small, reusable component to display each row of booking details cleanly
const BookingDetailRow = ({ label, value }) => (
    <div className="verify-booking-detail-row">
        <strong className="verify-booking-detail-label">{label}:</strong>
        <span className="verify-booking-detail-value">{value}</span>
    </div>
);

/**
 * VerifyBooking Component
 * Allows an admin to fetch and verify a booking application.
 * @param {object} props - Component props
 * @param {string} props.API_BASE_URL - The base URL for the API.
 * @param {function} props.getAuthToken - A function to retrieve the auth token.
 */
const VerifyBooking = ({ API_BASE_URL, getAuthToken }) => {
    const [bookingId, setBookingId] = useState('');
    const [bookingDetails, setBookingDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        setBookingDetails(null);

        if (!bookingId.trim()) {
            setError('Please provide a Booking ID.');
            setIsLoading(false);
            return;
        }

        try {
            const token = getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/api/bookings/${bookingId.trim()}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            setBookingDetails(response.data);
        } catch (err) {
            const message = err.response?.status === 404
                ? `Booking with ID "${bookingId.trim()}" was not found.`
                : 'An error occurred. Please check the ID and try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (action) => {
        setIsUpdating(true);
        setError('');
        setSuccess('');

        try {
            const token = getAuthToken();
            let response;
            const currentBookingId = bookingDetails.booking_id;

            if (action === 'approve') {
                response = await axios.put(`${API_BASE_URL}/bookings/${currentBookingId}/allow`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSuccess('Booking approved successfully! The user can now proceed to payment.');
            } else if (action === 'reject') {
                response = await axios.put(`${API_BASE_URL}/bookings/${currentBookingId}/status`,
                    { status: 'Rejected' },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setSuccess('Booking has been rejected successfully.');
            }
            
            if (response && response.data.booking) {
                setBookingDetails(response.data.booking);
            }
        } catch (err) {
            const message = err.response?.data?.message || `Failed to ${action} the booking.`;
            setError(message);
        } finally {
            setIsUpdating(false);
        }
    };
    
    const getStatusClass = (status) => {
        const lowerStatus = status?.toLowerCase() || '';
        if (lowerStatus.includes('confirmed') || lowerStatus.includes('awaitingpayment')) return 'verify-booking-status-confirmed';
        if (lowerStatus.includes('pending')) return 'verify-booking-status-pending';
        if (lowerStatus.includes('cancelled') || lowerStatus.includes('rejected')) return 'verify-booking-status-rejected';
        return 'verify-booking-status-na';
    };

    return (
        <div className="verify-booking-container">
            <div className="verify-booking-card">
                <div className="verify-booking-header">
                    <h2>Verify Booking Status</h2>
                </div>

                <form onSubmit={handleSearch} className="verify-booking-search-form">
                    <div className="verify-booking-form-group">
                        <label htmlFor="bookingId">Booking ID</label>
                        <input
                            type="text"
                            id="bookingId"
                            value={bookingId}
                            onChange={(e) => setBookingId(e.target.value)}
                            placeholder="Enter Booking ID to fetch details"
                            required
                        />
                    </div>
                    <button type="submit" className="verify-booking-submit-btn" disabled={isLoading}>
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {error && <div className="verify-booking-message error">{error}</div>}
                {success && <div className="verify-booking-message success">{success}</div>}
                
                {bookingDetails && (
                    <div className="verify-booking-details-card">
                        <h3>Booking Details</h3>
                        <BookingDetailRow label="Booking ID" value={bookingDetails.booking_id} />
                        <BookingDetailRow label="Hall Name" value={bookingDetails.hall_id?.hall_name || 'N/A'} />
                        <BookingDetailRow label="Applicant Name" value={bookingDetails.user_id?.name || 'N/A'} />
                        <BookingDetailRow label="Applicant Email" value={bookingDetails.user_id?.email || 'N/A'} />
                        <BookingDetailRow label="Booking Date" value={formatDate(bookingDetails.booking_date)} />
                        <BookingDetailRow label="Booking Amount" value={`Rs. ${bookingDetails.booking_amount?.toLocaleString('en-IN') || 'N/A'}`} />
                        <BookingDetailRow
                            label="Status"
                            value={
                                <span className={`verify-booking-status-indicator ${getStatusClass(bookingDetails.booking_status)}`}>
                                    {bookingDetails.booking_status.replace('-', ' ')}
                                </span>
                            }
                        />

                        {bookingDetails.booking_status === 'Pending-Approval' && (
                            <div className="verify-booking-actions">
                                <button
                                    onClick={() => handleUpdateStatus('approve')}
                                    className="verify-booking-approve-btn"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Approving...' : 'Approve Application'}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('reject')}
                                    className="verify-booking-reject-btn"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Rejecting...' : 'Reject Application'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyBooking;