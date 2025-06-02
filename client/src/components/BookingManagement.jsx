import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Ban } from 'lucide-react'; // Added Ban icon for 'AwaitingPayment'
import './styles/BookingManagement.css'; // Import the CSS file

const BookingManagement = ({ API_BASE_URL, getAuthToken }) => {
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState(null);

    const fetchBookings = async () => {
        setLoadingBookings(true);
        setBookingError(null);
        const token = getAuthToken();
        if (!token) {
            setBookingError('Authentication token not found.');
            setLoadingBookings(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                if (response.status === 401) throw new Error('Authentication failed or token expired.');
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookingError(`Failed to fetch bookings: ${error.message}`);
        } finally {
            setLoadingBookings(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleBookingAction = async (url, method, body, successMessage, errorMessagePrefix) => {
        const token = getAuthToken();
        if (!token) {
            // Using a custom message box instead of alert()
            alert('Authentication token not found.'); // Replace with custom modal/toast
            return false;
        }
        try {
            const options = {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
            };
            if (body) {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            fetchBookings();
            console.log(successMessage); // Log success
            return true;
        } catch (error) {
            console.error(`${errorMessagePrefix}:`, error);
            // Using a custom message box instead of alert()
            alert(`${errorMessagePrefix}: ${error.message}`); // Replace with custom modal/toast
            return false;
        }
    };

    // Admin allows a booking (sets isAllowed to true, status to AwaitingPayment)
    const handleAllowBooking = (bookingId) => {
        if (window.confirm(`Are you sure you want to ALLOW booking ${bookingId}? This will allow the user to pay.`)) {
            handleBookingAction(`${API_BASE_URL}/bookings/${bookingId}/allow`, 'PUT', null,
                'Booking allowed. User can now pay.', 'Error allowing booking');
        }
    };

    // Admin confirms a booking (sets status to Confirmed, isPaid to true, updates hall availability)
    // This acts as an admin override if payment isn't handled by the user flow.
    const handleConfirmBooking = (bookingId) => {
        if (window.confirm(`Are you sure you want to CONFIRM booking ${bookingId}? This will mark it as paid and update hall availability.`)) {
            handleBookingAction(`${API_BASE_URL}/bookings/${bookingId}/status`, 'PUT', { status: 'Confirmed' },
                'Booking confirmed by admin.', 'Error confirming booking');
        }
    };

    const handleCancelBooking = (bookingId) => {
        if (window.confirm(`Are you sure you want to cancel booking ${bookingId}? This may initiate a refund.`)) {
            handleBookingAction(`${API_BASE_URL}/bookings/${bookingId}/cancel`, 'PUT', null,
                'Booking cancelled.', 'Error cancelling booking');
        }
    };
    
    const handleProcessRefund = (bookingId) => {
        if (window.confirm(`Are you sure you want to process the refund for booking ${bookingId}?`)) {
            handleBookingAction(`${API_BASE_URL}/bookings/${bookingId}/process-refund`, 'PUT', null,
                'Refund processed.', 'Error processing refund');
        }
    };

    const deleteBooking = (bookingId) => {
        if (window.confirm(`WARNING: Permanently delete booking ${bookingId}? This cannot be undone.`)) {
            handleBookingAction(`${API_BASE_URL}/bookings/${bookingId}`, 'DELETE', null,
                'Booking deleted.', 'Error deleting booking');
        }
    };

    const renderStatus = (status) => {
        let statusClass = '', Icon = null, statusText = status || 'N/A';
        switch (status?.toLowerCase()) {
            case 'confirmed': case 'approved': statusClass = 'admin-status-confirmed'; Icon = CheckCircle; statusText = 'Confirmed'; break;
            case 'rejected': statusClass = 'admin-status-rejected'; Icon = XCircle; statusText = 'Rejected'; break;
            case 'pending': statusClass = 'admin-status-pending'; Icon = Clock; statusText = 'Pending'; break;
            case 'awaitingpayment': statusClass = 'admin-status-awaiting-payment'; Icon = Ban; statusText = 'Awaiting Payment'; break; // New status
            case 'cancelled': statusClass = 'admin-status-cancelled'; Icon = XCircle; statusText = 'Cancelled'; break;
            case 'processed': statusClass = 'admin-status-confirmed'; Icon = CheckCircle; statusText = 'Processed'; break;
            case 'n/a': statusClass = 'admin-status-na'; Icon = null; statusText = 'N/A'; break;
            default: statusClass = ''; Icon = null; statusText = status || 'N/A'; break;
        }
        return (
            <span className={`admin-status-indicator ${statusClass}`}>
                {Icon && <Icon size={16} />} {statusText}
            </span>
        );
    };

    return (
        <div className="admin-card">
            <section>
                <h2>Booking Management</h2>
                {loadingBookings ? <p>Loading bookings...</p> : bookingError ? <p style={{ color: 'red' }}>{bookingError}</p> : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Booking ID</th><th>Trans. ID</th><th>Hall Name</th><th>Booking Date</th><th>Floor</th>
                                    <th>Function</th><th>AC Rms</th><th>Non-AC Rms</th><th>Amount</th><th>Status</th>
                                    <th>Allowed</th><th>Paid</th><th>Refund Status</th><th>Refund Amt.</th>
                                    <th>Booker Name</th> {/* Added Booker Name */}
                                    <th>Booker Email</th> {/* Added Booker Email */}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.booking_id}>
                                        <td>{booking.booking_id}</td>
                                        <td>{booking.transaction_id || 'N/A'}</td>
                                        <td>{booking.hall_id?.hall_name || 'N/A'}</td>
                                        <td>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}</td>
                                        <td>{booking.floor}</td>
                                        <td>{booking.function_type}</td>
                                        <td>{booking.num_ac_rooms_booked ?? 0}</td>
                                        <td>{booking.num_non_ac_rooms_booked ?? 0}</td>
                                        <td>Rs. {booking.booking_amount}</td>
                                        <td>{renderStatus(booking.booking_status)}</td>
                                        <td>{booking.isAllowed ? 'Yes' : 'No'}</td> {/* Display isAllowed */}
                                        <td>{booking.isPaid ? 'Yes' : 'No'}</td>       {/* Display isPaid */}
                                        <td>{renderStatus(booking.refund_status)}</td>
                                        <td>{booking.refund_amount ?? 'N/A'}</td>
                                        <td>{booking.user_id?.name || 'N/A'}</td> {/* Display booker's name */}
                                        <td>{booking.user_id?.email || 'N/A'}</td> {/* Display booker's email */}
                                        <td className="admin-table-actions">
                                            {/* Allow button: Only for Pending bookings */}
                                            {booking.booking_status === 'Pending' && (
                                                <button onClick={() => handleAllowBooking(booking.booking_id)} className="book-m-allow-button">Allow</button>
                                            )}
                                            {/* Confirm button: Can be used as an admin override, e.g., for AwaitingPayment or Pending */}
                                            {['Pending', 'AwaitingPayment'].includes(booking.booking_status) && (
                                                <button onClick={() => handleConfirmBooking(booking.booking_id)} className="book-m-confirm-button">Confirm</button>
                                            )}
                                            {/* Cancel button: If not already cancelled */}
                                            {booking.booking_status !== 'Cancelled' && (
                                                <button onClick={() => handleCancelBooking(booking.booking_id)} className="book-m-cancel-button">Cancel</button>
                                            )}
                                            {/* Process Refund button: If refund status is Pending */}
                                            {booking.refund_status === 'Pending' && (
                                                <button onClick={() => handleProcessRefund(booking.booking_id)} className="book-m-process-refund-button">Process Refund</button>
                                            )}
                                            {/* Delete button: Always available for admin */}
                                            <button onClick={() => deleteBooking(booking.booking_id)} className="book-m-delete-button">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bookings.length === 0 && <p>No bookings found.</p>}
                    </div>
                )}
            </section>
        </div>
    );
};

export default BookingManagement;