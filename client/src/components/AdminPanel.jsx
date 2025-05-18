// AdminPanel.jsx
import React, { useState, useEffect } from 'react';
// Assuming you have a CSS file for styling the admin panel
// import './styles/AdminPanel.css';

const AdminPanel = () => {
    // State for managing halls
    const [halls, setHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallError, setHallError] = useState(null);
    const [showHallForm, setShowHallForm] = useState(false);
    const [currentHall, setCurrentHall] = useState(null); // For editing
    const [hallFormData, setHallFormData] = useState({
        hall_id: '',
        hall_name: '',
        location: '',
        capacity: '',
        description: '',
        rent_commercial: '',
        rent_social: '',
        rent_non_commercial: '',
    });

    // State for managing bookings
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState(null);


    // Base URL for API calls
    const API_BASE_URL = 'http://localhost:5000/api';

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

    // useEffect to fetch data on component mount
    useEffect(() => {
        fetchHalls();
        fetchBookings();
    }, []); // Empty dependency array means this runs once on mount

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
        const url = currentHall ? `${API_BASE_URL}/halls/${currentHall.hall_id}` : `${API_BASE_URL}/halls`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
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
        setCurrentHall(hall);
        setHallFormData({
            hall_id: hall.hall_id,
            hall_name: hall.hall_name,
            location: hall.location || '', // Handle potential null/undefined
            capacity: hall.capacity || '',
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

            } catch (error) {
                console.error('Error deleting hall:', error);
                 alert(`Failed to delete hall: ${error.message}`);
            }
        }
    };

     // Reset the hall form
    const resetHallForm = () => {
        setCurrentHall(null);
        setHallFormData({
            hall_id: '',
            hall_name: '',
            location: '',
            capacity: '',
            description: '',
            rent_commercial: '',
            rent_social: '',
            rent_non_commercial: '',
        });
        setShowHallForm(false);
    };


    // Handle update for a booking (simplified - you might want a modal/form)
    const updateBookingStatus = async (bookingId, newStatus) => {
         const token = getAuthToken();
         if (!token) {
             alert('Authentication token not found. Cannot perform this action.');
             return;
         }

        if (window.confirm(`Change status for booking ${bookingId} to ${newStatus}?`)) {
             try {
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                         'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ booking_status: newStatus }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                // Refresh the booking list
                fetchBookings();

             } catch (error) {
                console.error('Error updating booking status:', error);
                alert(`Failed to update booking status: ${error.message}`);
             }
        }
    };


    // Delete a booking
    const deleteBooking = async (bookingId) => {
         const token = getAuthToken();
         if (!token) {
             alert('Authentication token not found. Cannot perform this action.');
             return;
         }
        if (window.confirm(`Are you sure you want to delete booking with ID: ${bookingId}?`)) {
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


    return (
        <div className="admin-panel-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Admin Panel</h1>

            {/* Hall Management Section */}
            <section style={{ marginBottom: '40px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                <h2 style={{ marginTop: '0' }}>Hall Management</h2>

                <button
                    onClick={() => setShowHallForm(!showHallForm)}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginBottom: '20px',
                    }}
                >
                    {showHallForm ? 'Hide Form' : 'Add New Hall'}
                </button>

                {showHallForm && (
                    <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #ccc', borderRadius: '5px' }}>
                        <h3>{currentHall ? 'Edit Hall' : 'Add Hall'}</h3>
                        <form onSubmit={handleHallSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="hall_id">Hall ID:</label>
                                <input
                                    type="text"
                                    id="hall_id"
                                    name="hall_id"
                                    value={hallFormData.hall_id}
                                    onChange={handleHallInputChange}
                                    required
                                    disabled={!!currentHall} // Disable ID field when editing
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                             <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="hall_name">Hall Name:</label>
                                <input
                                    type="text"
                                    id="hall_name"
                                    name="hall_name"
                                    value={hallFormData.hall_name}
                                    onChange={handleHallInputChange}
                                    required
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="location">Location:</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={hallFormData.location}
                                    onChange={handleHallInputChange}
                                     style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                             <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="capacity">Capacity:</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={hallFormData.capacity}
                                    onChange={handleHallInputChange}
                                     style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                             <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}> {/* Span across two columns */}
                                <label htmlFor="description">Description:</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={hallFormData.description}
                                    onChange={handleHallInputChange}
                                     style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="rent_commercial">Rent (Commercial):</label>
                                <input
                                    type="text"
                                    id="rent_commercial"
                                    name="rent_commercial"
                                    value={hallFormData.rent_commercial}
                                    onChange={handleHallInputChange}
                                    required
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                             <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="rent_social">Rent (Social):</label>
                                <input
                                    type="text"
                                    id="rent_social"
                                    name="rent_social"
                                    value={hallFormData.rent_social}
                                    onChange={handleHallInputChange}
                                    required
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                             <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="rent_non_commercial">Rent (Non-Commercial):</label>
                                <input
                                    type="text"
                                    id="rent_non_commercial"
                                    name="rent_non_commercial"
                                    value={hallFormData.rent_non_commercial}
                                    onChange={handleHallInputChange}
                                    required
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    gridColumn: 'span 2', // Span across two columns
                                }}
                            >
                                {currentHall ? 'Update Hall' : 'Create Hall'}
                            </button>
                             {currentHall && (
                                 <button
                                     type="button"
                                     onClick={resetHallForm}
                                     style={{
                                         padding: '10px 15px',
                                         backgroundColor: '#dc3545',
                                         color: 'white',
                                         border: 'none',
                                         borderRadius: '5px',
                                         cursor: 'pointer',
                                          gridColumn: 'span 2', // Span across two columns
                                     }}
                                 >
                                     Cancel Edit
                                 </button>
                             )}
                        </form>
                    </div>
                )}


                {loadingHalls ? (
                    <p>Loading halls...</p>
                ) : hallError ? (
                    <p style={{ color: 'red' }}>{hallError}</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Hall ID</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Location</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Capacity</th>
                                     <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Rent (Comm.)</th>
                                     <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Rent (Social)</th>
                                     <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Rent (Non-Comm.)</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {halls.map((hall) => (
                                    <tr key={hall.hall_id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{hall.hall_id}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{hall.hall_name}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{hall.location}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{hall.capacity}</td>
                                         <td style={{ padding: '10px', border: '1px solid #ddd' }}>{hall.rent_commercial}</td>
                                         <td style={{ padding: '10px', border: '1px solid #ddd' }}>{hall.rent_social}</td>
                                         <td style={{ padding: '10px', border: '1px solid #ddd' }}>{hall.rent_non_commercial}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            <button
                                                onClick={() => startEditHall(hall)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#ffc107',
                                                    color: 'black',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    marginRight: '5px',
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteHall(hall.hall_id)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Booking Management Section */}
            <section style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                <h2>Booking Management</h2>
                {loadingBookings ? (
                    <p>Loading bookings...</p>
                ) : bookingError ? (
                    <p style={{ color: 'red' }}>{bookingError}</p>
                ) : (
                     <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f2f2f2' }}>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Booking ID</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Hall Name</th>
                                     <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Booking Date</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Function</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Amount</th>
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
                                     <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>User ID</th> {/* Display User ID */}
                                    <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking) => (
                                    <tr key={booking.booking_id}>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{booking.booking_id}</td>
                                        {/* Display Hall Name using populated data */}
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                             {booking.hall_id ? booking.hall_id.hall_name : 'N/A'}
                                        </td>
                                         <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                             {new Date(booking.booking_date).toLocaleDateString()}
                                         </td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{booking.function_type}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{booking.booking_amount}</td>
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{booking.booking_status}</td>
                                         <td style={{ padding: '10px', border: '1px solid #ddd' }}>{booking.user_id}</td> {/* Display User ID */}
                                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                            {/* Simplified status update - could use a dropdown or modal */}
                                             <select
                                                 value={booking.booking_status}
                                                 onChange={(e) => updateBookingStatus(booking.booking_id, e.target.value)}
                                                 style={{ padding: '5px', borderRadius: '4px', marginRight: '5px' }}
                                             >
                                                 <option value="Pending">Pending</option>
                                                 <option value="Confirmed">Confirmed</option>
                                                 <option value="Cancelled">Cancelled</option>
                                             </select>
                                            <button
                                                onClick={() => deleteBooking(booking.booking_id)}
                                                style={{
                                                    padding: '5px 10px',
                                                    backgroundColor: '#dc3545',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                }}
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
        </div>
    );
};

export default AdminPanel;
