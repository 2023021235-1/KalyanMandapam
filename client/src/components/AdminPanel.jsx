// AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import './styles/AdminPanel.css'; // Import the new CSS file
import { CheckCircle, XCircle, Clock, PlusCircle, MinusCircle } from 'lucide-react'; // Import Lucide icons

const AdminPanel = () => {
    // State for managing halls
    const [halls, setHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallError, setHallError] = useState(null);
    const [showHallForm, setShowHallForm] = useState(false);
    const [currentHall, setCurrentHall] = useState(null); // For editing - holds full hall object including ID

    // Initial state for tiered pricing - using empty strings for new inputs,
    // but ensuring existing 0s are displayed correctly in the form.
    const initialTieredPrice = { municipal: '', municipality: '', panchayat: '' };

    const [hallFormData, setHallFormData] = useState({
        hall_name: '',
        location: '',
        capacity: '',
        total_floors: '',
        total_area_sqft: '', // Added total_area_sqft
        description: '',
        // Fixed-price blocks
        conference_hall_ac: { ...initialTieredPrice },
        conference_hall_nonac: { ...initialTieredPrice },
        food_prep_area_ac: { ...initialTieredPrice },
        food_prep_area_nonac: { ...initialTieredPrice },
        lawn_ac: { ...initialTieredPrice },
        lawn_nonac: { ...initialTieredPrice },
        room_rent_ac: { ...initialTieredPrice },
        room_rent_nonac: { ...initialTieredPrice },
        parking: { ...initialTieredPrice },
        electricity_ac: { ...initialTieredPrice },
        electricity_nonac: { ...initialTieredPrice },
        cleaning: { ...initialTieredPrice },
    });

    // State for managing event pricing dynamically - now includes AC and Non-AC tiers
    const [eventPrices, setEventPrices] = useState([{
        event_type: '',
        prices_per_sqft_ac: { ...initialTieredPrice },
        prices_per_sqft_nonac: { ...initialTieredPrice }
    }]);

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
            setBookingError('Authentication token not found. Cannot perform this action.');
            setLoadingBookings(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, {
                method:'GET',
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

    // Handle hall form input changes (for direct fields like name, location, capacity)
    const handleHallInputChange = (e) => {
        const { name, value } = e.target;
        setHallFormData({
            ...hallFormData,
            [name]: value,
        });
    };

    // Handle input changes for nested tiered price objects (for fixed blocks)
    const handleTieredPriceChange = (blockName, type, value) => {
        setHallFormData((prevData) => ({
            ...prevData,
            [blockName]: {
                ...prevData[blockName],
                [type]: value === '' ? '' : Number(value) // Allow empty string for required validation, convert to Number otherwise
            },
        }));
    };

    // Handle input changes for event pricing array - now includes AC and Non-AC tiers
    const handleEventPriceChange = (index, tierType, priceType, value) => {
        const newEventPrices = [...eventPrices];
        if (tierType === 'event_type') {
            newEventPrices[index].event_type = value;
        } else {
            // tierType will be 'prices_per_sqft_ac' or 'prices_per_sqft_nonac'
            newEventPrices[index][tierType][priceType] = value === '' ? '' : Number(value);
        }
        setEventPrices(newEventPrices);
    };

    // Add a new event pricing entry
    const addEventPrice = () => {
        setEventPrices([...eventPrices, {
            event_type: '',
            prices_per_sqft_ac: { ...initialTieredPrice },
            prices_per_sqft_nonac: { ...initialTieredPrice }
        }]);
    };

    // Remove an event pricing entry
    const removeEventPrice = (index) => {
        const newEventPrices = eventPrices.filter((_, i) => i !== index);
        setEventPrices(newEventPrices);
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

        // Combine hallFormData and eventPrices for the payload
        // Ensure all numerical values are converted to numbers, empty strings become 0 if required by backend
        const payload = {
            ...hallFormData,
            // Convert all tiered price values to numbers, treating empty strings as 0 for submission
            conference_hall_ac: {
                municipal: Number(hallFormData.conference_hall_ac.municipal || 0),
                municipality: Number(hallFormData.conference_hall_ac.municipality || 0),
                panchayat: Number(hallFormData.conference_hall_ac.panchayat || 0),
            },
            conference_hall_nonac: {
                municipal: Number(hallFormData.conference_hall_nonac.municipal || 0),
                municipality: Number(hallFormData.conference_hall_nonac.municipality || 0),
                panchayat: Number(hallFormData.conference_hall_nonac.panchayat || 0),
            },
            food_prep_area_ac: {
                municipal: Number(hallFormData.food_prep_area_ac.municipal || 0),
                municipality: Number(hallFormData.food_prep_area_ac.municipality || 0),
                panchayat: Number(hallFormData.food_prep_area_ac.panchayat || 0),
            },
            food_prep_area_nonac: {
                municipal: Number(hallFormData.food_prep_area_nonac.municipal || 0),
                municipality: Number(hallFormData.food_prep_area_nonac.municipality || 0),
                panchayat: Number(hallFormData.food_prep_area_nonac.panchayat || 0),
            },
            lawn_ac: {
                municipal: Number(hallFormData.lawn_ac.municipal || 0),
                municipality: Number(hallFormData.lawn_ac.municipality || 0),
                panchayat: Number(hallFormData.lawn_ac.panchayat || 0),
            },
            lawn_nonac: {
                municipal: Number(hallFormData.lawn_nonac.municipal || 0),
                municipality: Number(hallFormData.lawn_nonac.municipality || 0),
                panchayat: Number(hallFormData.lawn_nonac.panchayat || 0),
            },
            room_rent_ac: {
                municipal: Number(hallFormData.room_rent_ac.municipal || 0),
                municipality: Number(hallFormData.room_rent_ac.municipality || 0),
                panchayat: Number(hallFormData.room_rent_ac.panchayat || 0),
            },
            room_rent_nonac: {
                municipal: Number(hallFormData.room_rent_nonac.municipal || 0),
                municipality: Number(hallFormData.room_rent_nonac.municipality || 0),
                panchayat: Number(hallFormData.room_rent_nonac.panchayat || 0),
            },
            parking: {
                municipal: Number(hallFormData.parking.municipal || 0),
                municipality: Number(hallFormData.parking.municipality || 0),
                panchayat: Number(hallFormData.parking.panchayat || 0),
            },
            electricity_ac: {
                municipal: Number(hallFormData.electricity_ac.municipal || 0),
                municipality: Number(hallFormData.electricity_ac.municipality || 0),
                panchayat: Number(hallFormData.electricity_ac.panchayat || 0),
            },
            electricity_nonac: {
                municipal: Number(hallFormData.electricity_nonac.municipal || 0),
                municipality: Number(hallFormData.electricity_nonac.municipality || 0),
                panchayat: Number(hallFormData.electricity_nonac.panchayat || 0),
            },
            cleaning: {
                municipal: Number(hallFormData.cleaning.municipal || 0),
                municipality: Number(hallFormData.cleaning.municipality || 0),
                panchayat: Number(hallFormData.cleaning.panchayat || 0),
            },
            // Convert capacity and total_floors to numbers, treating empty strings as 0
            capacity: Number(hallFormData.capacity || 0),
            total_floors: Number(hallFormData.total_floors || 0),
            total_area_sqft: Number(hallFormData.total_area_sqft || 0), // Added total_area_sqft

            // Map event prices, ensuring AC and Non-AC tiers are correctly converted
            event_pricing: eventPrices.map(event => ({
                event_type: event.event_type,
                prices_per_sqft_ac: {
                    municipal: Number(event.prices_per_sqft_ac.municipal || 0),
                    municipality: Number(event.prices_per_sqft_ac.municipality || 0),
                    panchayat: Number(event.prices_per_sqft_ac.panchayat || 0),
                },
                prices_per_sqft_nonac: {
                    municipal: Number(event.prices_per_sqft_nonac.municipal || 0),
                    municipality: Number(event.prices_per_sqft_nonac.municipality || 0),
                    panchayat: Number(event.prices_per_sqft_nonac.panchayat || 0),
                }
            }))
        };

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            fetchHalls();
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
            hall_name: hall.hall_name ?? '',
            location: hall.location ?? '',
            capacity: hall.capacity ?? '',
            total_floors: hall.total_floors ?? '',
            total_area_sqft: hall.total_area_sqft ?? '', // Added total_area_sqft
            description: hall.description ?? '',
            conference_hall_ac: hall.conference_hall_ac ?? { ...initialTieredPrice },
            conference_hall_nonac: hall.conference_hall_nonac ?? { ...initialTieredPrice },
            food_prep_area_ac: hall.food_prep_area_ac ?? { ...initialTieredPrice },
            food_prep_area_nonac: hall.food_prep_area_nonac ?? { ...initialTieredPrice },
            lawn_ac: hall.lawn_ac ?? { ...initialTieredPrice },
            lawn_nonac: hall.lawn_nonac ?? { ...initialTieredPrice },
            room_rent_ac: hall.room_rent_ac ?? { ...initialTieredPrice },
            room_rent_nonac: hall.room_rent_nonac ?? { ...initialTieredPrice },
            parking: hall.parking ?? { ...initialTieredPrice },
            electricity_ac: hall.electricity_ac ?? { ...initialTieredPrice },
            electricity_nonac: hall.electricity_nonac ?? { ...initialTieredPrice },
            cleaning: hall.cleaning ?? { ...initialTieredPrice },
        });
        // Map existing event pricing for editing - now includes AC and Non-AC tiers
        setEventPrices(hall.event_pricing && hall.event_pricing.length > 0 ?
            hall.event_pricing.map(event => ({
                event_type: event.event_type ?? '',
                prices_per_sqft_ac: {
                    municipal: event.prices_per_sqft_ac?.municipal ?? '',
                    municipality: event.prices_per_sqft_ac?.municipality ?? '',
                    panchayat: event.prices_per_sqft_ac?.panchayat ?? '',
                },
                prices_per_sqft_nonac: {
                    municipal: event.prices_per_sqft_nonac?.municipal ?? '',
                    municipality: event.prices_per_sqft_nonac?.municipality ?? '',
                    panchayat: event.prices_per_sqft_nonac?.panchayat ?? '',
                }
            })) :
            [{ // Default if no events
                event_type: '',
                prices_per_sqft_ac: { ...initialTieredPrice },
                prices_per_sqft_nonac: { ...initialTieredPrice }
            }]
        );
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

                fetchHalls();
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
        setCurrentHall(null);
        setHallFormData({
            hall_name: '',
            location: '',
            capacity: '',
            total_floors: '',
            total_area_sqft: '', // Added total_area_sqft
            description: '',
            conference_hall_ac: { ...initialTieredPrice },
            conference_hall_nonac: { ...initialTieredPrice },
            food_prep_area_ac: { ...initialTieredPrice },
            food_prep_area_nonac: { ...initialTieredPrice },
            lawn_ac: { ...initialTieredPrice },
            lawn_nonac: { ...initialTieredPrice },
            room_rent_ac: { ...initialTieredPrice },
            room_rent_nonac: { ...initialTieredPrice },
            parking: { ...initialTieredPrice },
            electricity_ac: { ...initialTieredPrice },
            electricity_nonac: { ...initialTieredPrice },
            cleaning: { ...initialTieredPrice },
        });
        setEventPrices([{
            event_type: '',
            prices_per_sqft_ac: { ...initialTieredPrice },
            prices_per_sqft_nonac: { ...initialTieredPrice }
        }]);
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
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: 'Confirmed' }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

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
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                fetchBookings();

            } catch (error) {
                console.error('Error cancelling booking:', error);
                alert(`Failed to cancel booking: ${error.message}`);
            }
        }
    };

    // Handle processing a refund
    const handleProcessRefund = async (bookingId) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found. Cannot perform this action.');
            return;
        }

        if (window.confirm(`Are you sure you want to process the refund for booking ${bookingId}? This will mark the refund as 'Processed'.`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/process-refund`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                fetchBookings();

            } catch (error) {
                console.error('Error processing refund:', error);
                alert(`Failed to process refund: ${error.message}`);
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
                statusText = 'Confirmed';
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
            case 'processed':
                statusClass = 'admin-status-confirmed'; // Green for processed refund
                Icon = CheckCircle;
                statusText = 'Processed';
                break;
            case 'n/a':
                statusClass = 'admin-status-na'; // Neutral color
                Icon = null;
                statusText = 'N/A';
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
            return <span className={`admin-status-indicator ${statusClass}`}>{statusText}</span>;
        }
    };

  
    const renderTieredPriceInputs = (blockName, label) => (
        <div className="admin-form-group-tiered">
            <label>{label}:</label>
            <div className="tiered-inputs">
                <input
                    type="number"
                    placeholder="Municipal"
                    value={hallFormData[blockName]?.municipal ?? ''} // Use ?? to display 0
                    onChange={(e) => handleTieredPriceChange(blockName, 'municipal', e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Municipality"
                    value={hallFormData[blockName]?.municipality ?? ''} // Use ?? to display 0
                    onChange={(e) => handleTieredPriceChange(blockName, 'municipality', e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Panchayat"
                    value={hallFormData[blockName]?.panchayat ?? ''} // Use ?? to display 0
                    onChange={(e) => handleTieredPriceChange(blockName, 'panchayat', e.target.value)}
                    required
                />
            </div>
        </div>
    );

    // Helper to render event specific tiered price inputs
    const renderEventTieredPriceInputs = (index, tierType, label) => (
        <div className="tiered-inputs">
            <label>{label}:</label>
            <input
                type="number"
                placeholder="Municipal"
                value={eventPrices[index][tierType]?.municipal ?? ''}
                onChange={(e) => handleEventPriceChange(index, tierType, 'municipal', e.target.value)}
                required
            />
            <input
                type="number"
                placeholder="Municipality"
                value={eventPrices[index][tierType]?.municipality ?? ''}
                onChange={(e) => handleEventPriceChange(index, tierType, 'municipality', e.target.value)}
                required
            />
            <input
                type="number"
                placeholder="Panchayat"
                value={eventPrices[index][tierType]?.panchayat ?? ''}
                onChange={(e) => handleEventPriceChange(index, tierType, 'panchayat', e.target.value)}
                required
            />
        </div>
    );


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
                                    {/* Basic Hall Details */}
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
                                            value={hallFormData.capacity ?? ''} // Use ?? to display 0
                                            onChange={handleHallInputChange}
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="total_floors">Total Floors:</label>
                                        <input
                                            type="number"
                                            id="total_floors"
                                            name="total_floors"
                                            value={hallFormData.total_floors ?? ''} // Use ?? to display 0
                                            onChange={handleHallInputChange}
                                            required
                                            min="0" // Allow 0 floors, though typically min would be 1
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label htmlFor="total_area_sqft">Total Area (sq. ft.):</label>
                                        <input
                                            type="number"
                                            id="total_area_sqft"
                                            name="total_area_sqft"
                                            value={hallFormData.total_area_sqft ?? ''}
                                            onChange={handleHallInputChange}
                                            min="0"
                                        />
                                    </div>
                                     <div className="admin-form-group">
                                        <label htmlFor="description">Description:</label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={hallFormData.description}
                                            onChange={handleHallInputChange}
                                        ></textarea>
                                    </div>

                                    {/* Fixed-Price Blocks */}
                                    <h4>Fixed Price Blocks (Tiered Rates)</h4>
                                    {renderTieredPriceInputs('conference_hall_ac', 'Conference Hall (AC)')}
                                    {renderTieredPriceInputs('conference_hall_nonac', 'Conference Hall (Non-AC)')}
                                    {renderTieredPriceInputs('food_prep_area_ac', 'Food Prep Area (AC)')}
                                    {renderTieredPriceInputs('food_prep_area_nonac', 'Food Prep Area (Non-AC)')}
                                    {renderTieredPriceInputs('lawn_ac', 'Lawn (AC)')}
                                    {renderTieredPriceInputs('lawn_nonac', 'Lawn (Non-AC)')}
                                    {renderTieredPriceInputs('room_rent_ac', 'Room Rent (AC)')}
                                    {renderTieredPriceInputs('room_rent_nonac', 'Room Rent (Non-AC)')}
                                    {renderTieredPriceInputs('parking', 'Parking')}
                                    {renderTieredPriceInputs('electricity_ac', 'Electricity (AC)')}
                                    {renderTieredPriceInputs('electricity_nonac', 'Electricity (Non-AC)')}
                                    {renderTieredPriceInputs('cleaning', 'Cleaning')}

                                    {/* Event Pricing */}
                                    <h4>Event Pricing (Per Sq. Ft.)</h4>
                                    {eventPrices.map((event, index) => (
                                        <div key={index} className="admin-form-group-event">
                                            <label>Event {index + 1}:</label>
                                            <input
                                                type="text"
                                                placeholder="Event Type (e.g., 'Wedding')"
                                                value={event.event_type}
                                                onChange={(e) => handleEventPriceChange(index, 'event_type', '', e.target.value)}
                                                required
                                            />
                                            {renderEventTieredPriceInputs(index, 'prices_per_sqft_ac', 'AC Prices')}
                                            {renderEventTieredPriceInputs(index, 'prices_per_sqft_nonac', 'Non-AC Prices')}

                                            <button type="button" onClick={() => removeEventPrice(index)} className="admin-remove-event-button">
                                                <MinusCircle size={18} /> Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addEventPrice} className="admin-add-event-button">
                                        <PlusCircle size={18} /> Add Event
                                    </button>


                                    <div className="admin-form-buttons">
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
                            <div className="admin-table-container">
                                 <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Hall ID</th>
                                            <th>Name</th>
                                            <th>Location</th>
                                            <th>Capacity</th>
                                             <th>Total Floors</th>
                                             <th>Total Area (sq. ft.)</th> {/* Added column */}
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
                                                  <td>{hall.total_floors}</td>
                                                  <td>{hall.total_area_sqft || 'N/A'}</td> {/* Display total_area_sqft */}
                                                 <td className="admin-table-actions">
                                                      <button
                                                           onClick={() => startEditHall(hall)}
                                                           className="admin-edit-button"
                                                      >
                                                           Edit
                                                      </button>
                                                      <button
                                                           onClick={() => deleteHall(hall.hall_id)}
                                                           className="admin-delete-button"
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
                             <div className="admin-table-container">
                                  <table className="admin-table">
                                    <thead>
                                        <tr>
                                             <th>Booking ID</th>
                                             <th>Transaction ID</th>
                                            <th>Hall Name</th>
                                             <th>Booking Date</th>
                                             <th>Floor</th>
                                            <th>Function</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Refund Status</th> {/* New column */}
                                            <th>Refund Amount</th> {/* New column */}
                                             <th>User ID</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                     <tbody>
                                         {bookings.map((booking) => (
                                              <tr key={booking.booking_id}>
                                                  <td>{booking.booking_id}</td>
                                                  <td>{booking.transaction_id || 'N/A'}</td>
                                                  <td>
                                                       {booking.hall_id ? booking.hall_id.hall_name : 'N/A'}
                                                  </td>
                                                   <td>
                                                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}
                                                   </td>
                                                   <td>{booking.floor }</td>
                                                   <td>Rs. {booking.booking_amount}</td>
                                                   <td>{renderStatus(booking.booking_status)}</td>
                                                   <td>{renderStatus(booking.refund_status)}</td> {/* Display refund status */}
                                                   <td>{booking.refund_amount}</td> {/* Display refund amount */}
                                                    <td>{booking.user_id}</td>
                                                   <td className="admin-table-actions">
                                                       {booking.booking_status === 'Pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleConfirmBooking(booking.booking_id)}
                                                                    className="admin-confirm-button"
                                                                >
                                                                    Confirm
                                                                </button>
                                                                <button
                                                                    onClick={() => handleCancelBooking(booking.booking_id)}
                                                                    className="admin-cancel-button"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        {booking.refund_status === 'Pending' && (
                                                            <button
                                                                onClick={() => handleProcessRefund(booking.booking_id)}
                                                                className="admin-process-refund-button"
                                                            >
                                                                Process Refund
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => deleteBooking(booking.booking_id)}
                                                            className="admin-delete-button"
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
