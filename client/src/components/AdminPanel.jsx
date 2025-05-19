// AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import './styles/AdminPanel.css'; // Import the new CSS file
import { CheckCircle, XCircle, Clock } from 'lucide-react'; // Import Lucide icons

const AdminPanel = () => {
    // State for managing halls
    const [halls, setHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallError, setHallError] = useState(null);
    const [showHallForm, setShowHallForm] = useState(false);
    const [currentHall, setCurrentHall] = useState(null); // For editing - holds full hall object including ID
    const [hallFormData, setHallFormData] = useState({
        // hall_id is removed from formData as it's backend-generated for new halls
        hall_name: '',
        location: '',
        capacity: '',
        total_floors: '', // Added total_floors
        description: '',
        rent_commercial: '',
        rent_social: '',
        rent_non_commercial: '',
    });

    // State for managing bookings
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState(null);

    // State for managing tabs
    const [activeTab, setActiveTab] = useState('halls'); // 'halls' or 'bookings'


    // Base URL for API calls
    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';

    // Function to get the JWT token (replace with your actual logic)
    const getAuthToken = () => {
        // Example: Get token from local storage
        return localStorage.getItem('token');
    };

    // Fetch all halls
    const fetchHalls = async () => {
        setLoadingHalls(true);
        setHallError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/halls`, {
                headers: {
                    // No auth header needed for GET /api/halls based on your routes
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setHalls(data);
        } catch (error) {
            console.error('Error fetching halls:', error);
            setHallError('Failed to fetch halls.');
        } finally {
            setLoadingHalls(false);
        }
    };

    // Fetch all bookings
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                   // Check for expired token specifically if your backend sends a distinct response
                    if (response.status === 401) {
                        throw new Error('Authentication failed or token expired.');
                    }
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

    // useEffect to fetch data on component mount or tab change
    useEffect(() => {
        if (activeTab === 'halls') {
            fetchHalls();
        } else {
            fetchBookings();
        }
    }, [activeTab]); // Rerun when activeTab changes

    // Handle hall form input changes
    const handleHallInputChange = (e) => {
        const { name, value } = e.target;
        setHallFormData({
            ...hallFormData,
            [name]: value,
        });
    };

    // Handle submit for creating/updating a hall
    const handleHallSubmit = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found. Cannot perform this action.');
            return;
        }

        const method = currentHall ? 'PUT' : 'POST';
        // For PUT, use the ID from currentHall. For POST, the URL is just /halls
        const url = currentHall ? `${API_BASE_URL}/halls/${currentHall.hall_id}` : `${API_BASE_URL}/halls`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                // Send the formData state which now excludes hall_id for POST,
                // and contains updated fields for PUT. The backend uses the ID from the URL for PUT.
                body: JSON.stringify(hallFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // Refresh the hall list
            fetchHalls();
            // Reset form and hide it
            resetHallForm();

        } catch (error) {
            console.error('Error saving hall:', error);
            alert(`Failed to save hall: ${error.message}`);
        }
    };

    // Set form data for editing a hall
    const startEditHall = (hall) => {
        // Store the whole hall object for ID reference in PUT request
        setCurrentHall(hall);
        // Populate form data fields (excluding hall_id as it's not editable via input)
        setHallFormData({
            hall_name: hall.hall_name,
            location: hall.location || '', // Handle potential null/undefined
            capacity: hall.capacity || '',
            total_floors: hall.total_floors || '', // Include total_floors
            description: hall.description || '',
            rent_commercial: hall.rent_commercial,
            rent_social: hall.rent_social,
            rent_non_commercial: hall.rent_non_commercial,
        });
        setShowHallForm(true);
    };

    // Delete a hall
    const deleteHall = async (hallId) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found. Cannot perform this action.');
            return;
        }

        if (window.confirm(`Are you sure you want to delete hall with ID: ${hallId}?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/halls/${hallId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                // Refresh the hall list
                fetchHalls();
                 // If the deleted hall was being edited, close/reset the form
                if (currentHall && currentHall.hall_id === hallId) {
                    resetHallForm();
                }

            } catch (error) {
                console.error('Error deleting hall:', error);
                alert(`Failed to delete hall: ${error.message}`);
            }
        }
    };

      // Reset the hall form
    const resetHallForm = () => {
        setCurrentHall(null); // Clear the hall being edited
        setHallFormData({
            // Reset to initial empty state
            hall_name: '',
            location: '',
            capacity: '',
            total_floors: '',
            description: '',
            rent_commercial: '',
            rent_social: '',
            rent_non_commercial: '',
        });
        setShowHallForm(false);
    };


    // Handle confirming a booking
    const handleConfirmBooking = async (bookingId) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found. Cannot perform this action.');
            return;
        }

        if (window.confirm(`Are you sure you want to confirm booking ${bookingId}?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ booking_status: 'Confirmed' }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                // Refresh the booking list
                fetchBookings();

            } catch (error) {
                console.error('Error confirming booking:', error);
                alert(`Failed to confirm booking: ${error.message}`);
            }
        }
    };

    // Handle cancelling a booking (this will trigger refund logic in backend if applicable)
    const handleCancelBooking = async (bookingId) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found. Cannot perform this action.');
            return;
        }

        if (window.confirm(`Are you sure you want to cancel booking ${bookingId}? This may initiate a refund.`)) {
            try {
                // Use the specific cancel endpoint
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
                    method: 'PUT', // Or DELETE, depending on how your backend defines the cancel route verb
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                     // No body needed for the cancel endpoint based on the backend code
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                // Refresh the booking list
                fetchBookings();

            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert(`Failed to cancel booking: ${error.message}`);
            }
        }
    };


    // Delete a booking (hard delete)
    const deleteBooking = async (bookingId) => {
          const token = getAuthToken();
          if (!token) {
              alert('Authentication token not found. Cannot perform this action.');
              return;
          }
          // Note: This is a hard delete. Cancelling (above) is generally preferred
          // as it updates status and handles refunds. Use this with caution.
        if (window.confirm(`WARNING: Are you sure you want to PERMANENTLY delete booking with ID: ${bookingId}? This action cannot be undone.`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                    method: 'DELETE',
                     headers: {
                         'Authorization': `Bearer ${token}`,
                     },
                });

                if (!response.ok) {
                     const errorData = await response.json();
                     throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                // Refresh the booking list
                fetchBookings();

            } catch (error) {
                console.error('Error deleting booking:', error);
                 alert(`Failed to delete booking: ${error.message}`);
            }
        }
    };

      // Function to render status with icons and colors (matching BookNow)
      const renderStatus = (status) => {
        let statusClass = '';
        let Icon = null;
        let statusText = status || 'N/A';

        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'approved':
                statusClass = 'admin-status-confirmed';
                Icon = CheckCircle;
                statusText = 'Confirmed'; // Use English for admin panel simplicity, or add localization if needed
                break;
            case 'rejected':
                statusClass = 'admin-status-rejected';
                Icon = XCircle;
                 statusText = 'Rejected';
                break;
            case 'pending':
                statusClass = 'admin-status-pending';
                Icon = Clock;
                 statusText = 'Pending';
                break;
             case 'cancelled':
                 statusClass = 'admin-status-cancelled';
                 Icon = XCircle;
                 statusText = 'Cancelled';
                 break;
            default:
                statusClass = '';
                Icon = null;
                statusText = status || 'N/A';
                break;
        }

        if (Icon) {
            return (
                <span className={`admin-status-indicator ${statusClass}`}>
                    <Icon size={16} />
                    {statusText}
                </span>
            );
        } else {
            return statusText;
        }
    };


    return (
        <div className="admin-panel-container">
            <h1>Admin Panel</h1>

            {/* Tab Buttons */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab-button ${activeTab === 'halls' ? 'active' : ''}`}
                    onClick={() => setActiveTab('halls')}
                >
                    Hall Management
                </button>
                <button
                     className={`admin-tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Booking Management
                </button>
            </div>

            {/* Tab Content */}
            <div className="admin-tab-content">
                {activeTab === 'halls' && (
                    <section>
                        <h2>Hall Management</h2>

                        <button
                            className="admin-form-toggle-button"
                            onClick={() => setShowHallForm(!showHallForm)}
                        >
                            {showHallForm ? 'Hide Form' : 'Add New Hall'}
                        </button>

                        {showHallForm && (
                            <div className="admin-form-container">
                                <h3>{currentHall ? `Edit Hall (ID: ${currentHall.hall_id})` : 'Add Hall'}</h3>
                                <form onSubmit={handleHallSubmit} className="admin-form-grid">
                                    {/* Hall ID field removed as it's not needed for input/editing form */}
                                    <div className="admin-form-group">
                                        <label htmlFor="hall_name">Hall Name:</label>
                                        <input
                                            type="text"
                                            id="hall_name"
                                            name="hall_name"
                                            value={hallFormData.hall_name}
                                            onChange={handleHallInputChange}
                                            required
                                        />
                                    </div>
                                     <div className="admin-form-group">
                                        <label htmlFor="location">Location:</label>
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={hallFormData.location}
                                            onChange={handleHallInputChange}
                                        />
                                    </div>
                                     <div className="admin-form-group">
                                        <label htmlFor="capacity">Capacity:</label>
                                        <input
                                            type="number"
                                            id="capacity"
                                            name="capacity"
                                            value={hallFormData.capacity}
                                            onChange={handleHallInputChange}
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="total_floors">Total Floors:</label>
                                        <input
                                            type="number"
                                            id="total_floors"
                                            name="total_floors"
                                            value={hallFormData.total_floors}
                                            onChange={handleHallInputChange}
                                            required
                                            min="1"
                                        />
                                    </div>
                                     <div className="admin-form-group"> {/* Removed inline span style */}
                                        <label htmlFor="description">Description:</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={hallFormData.description}
                                            onChange={handleHallInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="rent_commercial">Rent (Commercial):</label>
                                        <input
                                            type="text"
                                            id="rent_commercial"
                                            name="rent_commercial"
                                            value={hallFormData.rent_commercial}
                                            onChange={handleHallInputChange}
                                            required
                                        />
                                    </div>
                                     <div className="admin-form-group">
                                        <label htmlFor="rent_social">Rent (Social):</label>
                                        <input
                                            type="text"
                                            id="rent_social"
                                            name="rent_social"
                                            value={hallFormData.rent_social}
                                            onChange={handleHallInputChange}
                                            required
                                        />
                                    </div>
                                     <div className="admin-form-group">
                                        <label htmlFor="rent_non_commercial">Rent (Non-Commercial):</label>
                                        <input
                                            type="text"
                                            id="rent_non_commercial"
                                            name="rent_non_commercial"
                                            value={hallFormData.rent_non_commercial}
                                            onChange={handleHallInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="admin-form-buttons"> {/* Group buttons */}
                                        <button type="submit" className="admin-form-submit-button">
                                            {currentHall ? 'Update Hall' : 'Create Hall'}
                                        </button>
                                         {currentHall && (
                                             <button
                                                 type="button"
                                                 onClick={resetHallForm}
                                                 className="admin-form-cancel-button"
                                             >
                                                 Cancel Edit
                                             </button>
                                         )}
                                    </div>
                                </form>
                            </div>
                        )}


                        {loadingHalls ? (
                            <p>Loading halls...</p>
                        ) : hallError ? (
                            <p style={{ color: 'red' }}>{hallError}</p>
                        ) : (
                            <div className="admin-table-container"> {/* Added container for scroll */}
                                 <table className="admin-table"> {/* Applied table class */}
                                    <thead>
                                        <tr>
                                            <th>Hall ID</th> {/* Keep ID in table for reference */}
                                            <th>Name</th>
                                            <th>Location</th>
                                            <th>Capacity</th>
                                             <th>Total Floors</th> {/* Added Total Floors header */}
                                             <th>Rent (Comm.)</th>
                                             <th>Rent (Social)</th>
                                             <th>Rent (Non-Comm.)</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {halls.map((hall) => (
                                             <tr key={hall.hall_id}>
                                                 <td>{hall.hall_id}</td>
                                                 <td>{hall.hall_name}</td>
                                                 <td>{hall.location}</td>
                                                 <td>{hall.capacity}</td>
                                                  <td>{hall.total_floors}</td> {/* Display total_floors */}
                                                  <td>{hall.rent_commercial}</td>
                                                  <td>{hall.rent_social}</td>
                                                  <td>{hall.rent_non_commercial}</td>
                                                 <td className="admin-table-actions"> {/* Applied actions class */}
                                                      <button
                                                           onClick={() => startEditHall(hall)}
                                                           className="admin-edit-button" // Applied button class
                                                      >
                                                           Edit
                                                      </button>
                                                      <button
                                                           onClick={() => deleteHall(hall.hall_id)}
                                                           className="admin-delete-button" // Applied button class
                                                      >
                                                           Delete
                                                      </button>
                                                 </td>
                                             </tr>
                                         ))}
                                    </tbody>
                                </table>
                                 {halls.length === 0 && <p>No halls found.</p>}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'bookings' && (
                    <section>
                        <h2>Booking Management</h2>
                        {loadingBookings ? (
                            <p>Loading bookings...</p>
                        ) : bookingError ? (
                            <p style={{ color: 'red' }}>{bookingError}</p>
                        ) : (
                             <div className="admin-table-container"> {/* Added container for scroll */}
                                  <table className="admin-table"> {/* Applied table class */}
                                    <thead>
                                        <tr>
                                             <th>Booking ID</th>
                                             <th>Transaction ID</th>
                                            <th>Hall Name</th>
                                             <th>Booking Date</th>
                                             <th>Floor</th> {/* Updated header */}
                                            <th>Function</th>
                                            <th>Amount</th>
                                            <th>Status</th> {/* Status header */}
                                             <th>User ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                     <tbody>
                                         {bookings.map((booking) => (
                                              <tr key={booking.booking_id}>
                                                  <td>{booking.booking_id}</td>
                                                  <td>{booking.transaction_id || 'N/A'}</td> {/* Handle potential null */}
                                                  <td>
                                                       {booking.hall_id ? booking.hall_id.hall_name : 'N/A'}
                                                  </td>
                                                   <td>
                                                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                                                   </td>
                                                   {/* Display selected floors */}
                                                   <td>{booking.floor }</td>
                                                   <td>{booking.function_type}</td>
                                                   <td>{booking.booking_amount}</td>
                                                   {/* Render status with color and icon */}
                                                   <td>{renderStatus(booking.booking_status)}</td>
                                                    <td>{booking.user_id}</td>
                                                   <td className="admin-table-actions"> {/* Applied actions class */}
                                                       {/* Conditional rendering of buttons based on status */}
                                                        {booking.booking_status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleConfirmBooking(booking.booking_id)}
                                                                    className="admin-confirm-button" // Applied button class
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancelBooking(booking.booking_id)}
                                                                    className="admin-cancel-button" // Applied button class
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {/* Delete button remains available for hard delete, outside of status checks */}
                                                        <button
                                                            onClick={() => deleteBooking(booking.booking_id)}
                                                            className="admin-delete-button" // Applied button class
                                                         >
                                                             Delete
                                                        </button>
                                                   </td>
                                               </tr>
                                           ))}
                                     </tbody>
                                 </table>
                                  {bookings.length === 0 && <p>No bookings found.</p>}
                             </div>
                         )}
                    </section>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;