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

    const initialTieredPrice = { municipal: '', municipality: '', panchayat: '' };

    const [hallFormData, setHallFormData] = useState({
        hall_name: '',
        location: '',
        capacity: '',
        total_floors: '',
        total_area_sqft: '',
        num_ac_rooms: '', 
        num_non_ac_rooms: '', 
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

    const [eventPrices, setEventPrices] = useState([{
        event_type: '',
        prices_per_sqft_ac: { ...initialTieredPrice },
        prices_per_sqft_nonac: { ...initialTieredPrice }
    }]);

    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [bookingError, setBookingError] = useState(null);
    const [activeTab, setActiveTab] = useState('halls'); 

    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';
    // const API_BASE_URL = 'http://localhost:5000/api';

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const fetchHalls = async () => {
        setLoadingHalls(true);
        setHallError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/halls`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setHalls(data);
        } catch (error) {
            console.error('Error fetching halls:', error);
            setHallError('Failed to fetch halls.');
        } finally {
            setLoadingHalls(false);
        }
    };

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
        if (activeTab === 'halls') {
            fetchHalls();
        } else {
            fetchBookings();
        }
    }, [activeTab]);

    const handleHallInputChange = (e) => {
        const { name, value } = e.target;
        setHallFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTieredPriceChange = (blockName, type, value) => {
        setHallFormData(prevData => ({
            ...prevData,
            [blockName]: {
                ...prevData[blockName],
                [type]: value === '' ? '' : Number(value)
            },
        }));
    };

    const handleEventPriceChange = (index, tierType, priceType, value) => {
        const newEventPrices = [...eventPrices];
        if (tierType === 'event_type') {
            newEventPrices[index].event_type = value;
        } else {
            newEventPrices[index][tierType][priceType] = value === '' ? '' : Number(value);
        }
        setEventPrices(newEventPrices);
    };

    const addEventPrice = () => {
        setEventPrices([...eventPrices, {
            event_type: '',
            prices_per_sqft_ac: { ...initialTieredPrice },
            prices_per_sqft_nonac: { ...initialTieredPrice }
        }]);
    };

    const removeEventPrice = (index) => {
        setEventPrices(eventPrices.filter((_, i) => i !== index));
    };

    const handleHallSubmit = async (e) => {
        e.preventDefault();
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found.');
            return;
        }

        const method = currentHall ? 'PUT' : 'POST';
        const url = currentHall ? `${API_BASE_URL}/halls/${currentHall.hall_id}` : `${API_BASE_URL}/halls`;

        // Helper to ensure tiered prices are numbers or 0
        const formatTieredPrice = (priceObj) => ({
            municipal: Number(priceObj?.municipal || 0),
            municipality: Number(priceObj?.municipality || 0),
            panchayat: Number(priceObj?.panchayat || 0),
        });

        const payload = {
            ...hallFormData,
            conference_hall_ac: formatTieredPrice(hallFormData.conference_hall_ac),
            conference_hall_nonac: formatTieredPrice(hallFormData.conference_hall_nonac),
            food_prep_area_ac: formatTieredPrice(hallFormData.food_prep_area_ac),
            food_prep_area_nonac: formatTieredPrice(hallFormData.food_prep_area_nonac),
            lawn_ac: formatTieredPrice(hallFormData.lawn_ac),
            lawn_nonac: formatTieredPrice(hallFormData.lawn_nonac),
            room_rent_ac: formatTieredPrice(hallFormData.room_rent_ac),
            room_rent_nonac: formatTieredPrice(hallFormData.room_rent_nonac),
            parking: formatTieredPrice(hallFormData.parking),
            electricity_ac: formatTieredPrice(hallFormData.electricity_ac),
            electricity_nonac: formatTieredPrice(hallFormData.electricity_nonac),
            cleaning: formatTieredPrice(hallFormData.cleaning),
            capacity: Number(hallFormData.capacity || 0),
            total_floors: Number(hallFormData.total_floors || 0),
            total_area_sqft: Number(hallFormData.total_area_sqft || 0),
            num_ac_rooms: Number(hallFormData.num_ac_rooms || 0),
            num_non_ac_rooms: Number(hallFormData.num_non_ac_rooms || 0),
            event_pricing: eventPrices.map(event => ({
                event_type: event.event_type,
                prices_per_sqft_ac: formatTieredPrice(event.prices_per_sqft_ac),
                prices_per_sqft_nonac: formatTieredPrice(event.prices_per_sqft_nonac),
            }))
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            fetchHalls();
            resetHallForm(); // Also hides the form
        } catch (error) {
            console.error('Error saving hall:', error);
            alert(`Failed to save hall: ${error.message}`);
        }
    };

    const startEditHall = (hall) => {
        setCurrentHall(hall);
        // Helper to ensure tiered prices have all keys for the form
        const ensureTieredStructure = (priceObj) => ({ ...initialTieredPrice, ...priceObj });

        setHallFormData({
            hall_name: hall.hall_name ?? '',
            location: hall.location ?? '',
            capacity: hall.capacity ?? '',
            total_floors: hall.total_floors ?? '',
            total_area_sqft: hall.total_area_sqft ?? '',
            num_ac_rooms: hall.num_ac_rooms ?? '',
            num_non_ac_rooms: hall.num_non_ac_rooms ?? '',
            description: hall.description ?? '',
            conference_hall_ac: ensureTieredStructure(hall.conference_hall_ac),
            conference_hall_nonac: ensureTieredStructure(hall.conference_hall_nonac),
            food_prep_area_ac: ensureTieredStructure(hall.food_prep_area_ac),
            food_prep_area_nonac: ensureTieredStructure(hall.food_prep_area_nonac),
            lawn_ac: ensureTieredStructure(hall.lawn_ac),
            lawn_nonac: ensureTieredStructure(hall.lawn_nonac),
            room_rent_ac: ensureTieredStructure(hall.room_rent_ac),
            room_rent_nonac: ensureTieredStructure(hall.room_rent_nonac),
            parking: ensureTieredStructure(hall.parking),
            electricity_ac: ensureTieredStructure(hall.electricity_ac),
            electricity_nonac: ensureTieredStructure(hall.electricity_nonac),
            cleaning: ensureTieredStructure(hall.cleaning),
        });
        setEventPrices(hall.event_pricing && hall.event_pricing.length > 0 ?
            hall.event_pricing.map(event => ({
                event_type: event.event_type ?? '',
                prices_per_sqft_ac: ensureTieredStructure(event.prices_per_sqft_ac),
                prices_per_sqft_nonac: ensureTieredStructure(event.prices_per_sqft_nonac),
            })) :
            [{ event_type: '', prices_per_sqft_ac: { ...initialTieredPrice }, prices_per_sqft_nonac: { ...initialTieredPrice } }]
        );
        setShowHallForm(true);
    };

    const deleteHall = async (hallId) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete hall with ID: ${hallId}?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/halls/${hallId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
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

    const resetHallForm = () => {
        setCurrentHall(null);
        setHallFormData({
            hall_name: '', location: '', capacity: '', total_floors: '', total_area_sqft: '',
            num_ac_rooms: '', num_non_ac_rooms: '', description: '',
            conference_hall_ac: { ...initialTieredPrice }, conference_hall_nonac: { ...initialTieredPrice },
            food_prep_area_ac: { ...initialTieredPrice }, food_prep_area_nonac: { ...initialTieredPrice },
            lawn_ac: { ...initialTieredPrice }, lawn_nonac: { ...initialTieredPrice },
            room_rent_ac: { ...initialTieredPrice }, room_rent_nonac: { ...initialTieredPrice },
            parking: { ...initialTieredPrice }, electricity_ac: { ...initialTieredPrice },
            electricity_nonac: { ...initialTieredPrice }, cleaning: { ...initialTieredPrice },
        });
        setEventPrices([{ event_type: '', prices_per_sqft_ac: { ...initialTieredPrice }, prices_per_sqft_nonac: { ...initialTieredPrice } }]);
        setShowHallForm(false);
    };

    const handleBookingAction = async (url, method, body, successMessage, errorMessagePrefix) => {
        const token = getAuthToken();
        if (!token) {
            alert('Authentication token not found.');
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
            return true;
        } catch (error) {
            console.error(`${errorMessagePrefix}:`, error);
            alert(`${errorMessagePrefix}: ${error.message}`);
            return false;
        }
    };

    const handleConfirmBooking = (bookingId) => {
        if (window.confirm(`Are you sure you want to confirm booking ${bookingId}?`)) {
            handleBookingAction(`${API_BASE_URL}/bookings/${bookingId}/status`, 'PUT', { status: 'Confirmed' },
                'Booking confirmed.', 'Error confirming booking');
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

    const renderTieredPriceInputsRow = (blockName, label, formData) => (
        <div className="admin-form-group-tiered">
            <label>{label}:</label>
            <div className="tiered-inputs">
                <input type="number" placeholder="Municipal" value={formData[blockName]?.municipal ?? ''} onChange={(e) => handleTieredPriceChange(blockName, 'municipal', e.target.value)} />
                <input type="number" placeholder="Municipality" value={formData[blockName]?.municipality ?? ''} onChange={(e) => handleTieredPriceChange(blockName, 'municipality', e.target.value)} />
                <input type="number" placeholder="Panchayat" value={formData[blockName]?.panchayat ?? ''} onChange={(e) => handleTieredPriceChange(blockName, 'panchayat', e.target.value)} />
            </div>
        </div>
    );

    const renderEventTieredPriceInputsRow = (index, priceTierKey, label, eventData) => (
         <div className="event-tiered-group">
            <label>{label}:</label>
            <div className="tiered-inputs">
                <input type="number" placeholder="Municipal" value={eventData[priceTierKey]?.municipal ?? ''} onChange={(e) => handleEventPriceChange(index, priceTierKey, 'municipal', e.target.value)} />
                <input type="number" placeholder="Municipality" value={eventData[priceTierKey]?.municipality ?? ''} onChange={(e) => handleEventPriceChange(index, priceTierKey, 'municipality', e.target.value)} />
                <input type="number" placeholder="Panchayat" value={eventData[priceTierKey]?.panchayat ?? ''} onChange={(e) => handleEventPriceChange(index, priceTierKey, 'panchayat', e.target.value)} />
            </div>
        </div>
    );


    return (
        <div className="admin-panel-container">
            <h1>Admin Panel</h1>

            <div className="admin-tabs">
                <button className={`admin-tab-button ${activeTab === 'halls' ? 'active' : ''}`} onClick={() => setActiveTab('halls')}>Hall Management</button>
                <button className={`admin-tab-button ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Booking Management</button>
            </div>

            <div className="admin-tab-content">
                {activeTab === 'halls' && (
                    <section>
                        <div className="admin-section-header-with-button">
                            <h2>Hall Management</h2>
                            <button className="admin-form-toggle-button" onClick={() => {
                                if (showHallForm) {
                                    resetHallForm(); 
                                } else {
                                    setCurrentHall(null); 
                                    setHallFormData({ 
                                        hall_name: '', location: '', capacity: '', total_floors: '', total_area_sqft: '',
                                        num_ac_rooms: '', num_non_ac_rooms: '', description: '',
                                        conference_hall_ac: { ...initialTieredPrice }, conference_hall_nonac: { ...initialTieredPrice },
                                        food_prep_area_ac: { ...initialTieredPrice }, food_prep_area_nonac: { ...initialTieredPrice },
                                        lawn_ac: { ...initialTieredPrice }, lawn_nonac: { ...initialTieredPrice },
                                        room_rent_ac: { ...initialTieredPrice }, room_rent_nonac: { ...initialTieredPrice },
                                        parking: { ...initialTieredPrice }, electricity_ac: { ...initialTieredPrice },
                                        electricity_nonac: { ...initialTieredPrice }, cleaning: { ...initialTieredPrice },
                                    });
                                    setEventPrices([{ event_type: '', prices_per_sqft_ac: { ...initialTieredPrice }, prices_per_sqft_nonac: { ...initialTieredPrice } }]);
                                    setShowHallForm(true);
                                }
                            }}>
                                {showHallForm ? (currentHall ? 'Cancel Edit / Hide Form' : 'Hide Form') : 'Add New Hall'}
                            </button>
                        </div>

                        {showHallForm && (
                            <div className="admin-form-container">
                                <h3>{currentHall ? `Edit Hall (ID: ${currentHall.hall_id})` : 'Create New Hall'}</h3>
                                <form onSubmit={handleHallSubmit}>
                                    <div className="admin-hall-form-section admin-hall-form-common-details">
                                        <h4 className="admin-hall-form-section-header">Common Hall Details</h4>
                                        <div className="admin-form-grid">
                                            <div className="admin-form-group">
                                                <label htmlFor="hall_name">Hall Name:</label>
                                                <input type="text" id="hall_name" name="hall_name" value={hallFormData.hall_name} onChange={handleHallInputChange} required />
                                            </div>
                                            <div className="admin-form-group">
                                                <label htmlFor="location">Location:</label>
                                                <input type="text" id="location" name="location" value={hallFormData.location} onChange={handleHallInputChange}/>
                                            </div>
                                            <div className="admin-form-group">
                                                <label htmlFor="capacity">Capacity:</label>
                                                <input type="number" id="capacity" name="capacity" value={hallFormData.capacity ?? ''} onChange={handleHallInputChange} min="0" />
                                            </div>
                                            <div className="admin-form-group">
                                                <label htmlFor="total_floors">Total Floors:</label>
                                                <input type="number" id="total_floors" name="total_floors" value={hallFormData.total_floors ?? ''} onChange={handleHallInputChange} required min="0"/>
                                            </div>
                                            <div className="admin-form-group">
                                                <label htmlFor="total_area_sqft">Total Area (sq. ft.):</label>
                                                <input type="number" id="total_area_sqft" name="total_area_sqft" value={hallFormData.total_area_sqft ?? ''} onChange={handleHallInputChange} min="0"/>
                                            </div>
                                            <div className="admin-form-group">
                                                <label htmlFor="num_ac_rooms">Number of AC Rooms:</label>
                                                <input type="number" id="num_ac_rooms" name="num_ac_rooms" value={hallFormData.num_ac_rooms ?? ''} onChange={handleHallInputChange} min="0"/>
                                            </div>
                                            <div className="admin-form-group">
                                                <label htmlFor="num_non_ac_rooms">Number of Non-AC Rooms:</label>
                                                <input type="number" id="num_non_ac_rooms" name="num_non_ac_rooms" value={hallFormData.num_non_ac_rooms ?? ''} onChange={handleHallInputChange} min="0"/>
                                            </div>
                                            <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
                                                <label htmlFor="description">Description:</label>
                                                <textarea id="description" name="description" value={hallFormData.description} onChange={handleHallInputChange}></textarea>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-hall-form-section">
                                        <h4 className="admin-hall-form-section-header">Fixed Price Blocks (Tiered Rates)</h4>
                                        <div className="admin-hall-form-price-columns two-cols">
                                            <div className="admin-hall-form-price-column">
                                                <h5>AC Blocks</h5>
                                                {renderTieredPriceInputsRow('conference_hall_ac', 'Conference Hall (AC)', hallFormData)}
                                                {renderTieredPriceInputsRow('food_prep_area_ac', 'Food Prep Area (AC)', hallFormData)}
                                                {renderTieredPriceInputsRow('lawn_ac', 'Lawn (AC)', hallFormData)}
                                                {renderTieredPriceInputsRow('room_rent_ac', 'Rent per AC Room', hallFormData)}
                                                {renderTieredPriceInputsRow('electricity_ac', 'Electricity (AC)', hallFormData)}
                                            </div>
                                            <div className="admin-hall-form-price-column">
                                                <h5>Non-AC Blocks</h5>
                                                {renderTieredPriceInputsRow('conference_hall_nonac', 'Conference Hall (Non-AC)', hallFormData)}
                                                {renderTieredPriceInputsRow('food_prep_area_nonac', 'Food Prep Area (Non-AC)', hallFormData)}
                                                {renderTieredPriceInputsRow('lawn_nonac', 'Lawn (Non-AC)', hallFormData)}
                                                {renderTieredPriceInputsRow('room_rent_nonac', 'Rent per Non-AC Room', hallFormData)}
                                                {renderTieredPriceInputsRow('electricity_nonac', 'Electricity (Non-AC)', hallFormData)}
                                            </div>
                                        </div>
                                        <h5 style={{marginTop: '20px', color: 'var(--admin-primary-color)', fontWeight:'600'}}>Common Facilities</h5>
                                        <div className="admin-hall-form-price-columns two-cols" style={{ marginTop: '10px' }}>
                                            <div className="admin-hall-form-price-column">
                                                {renderTieredPriceInputsRow('parking', 'Parking', hallFormData)}
                                            </div>
                                            <div className="admin-hall-form-price-column">
                                                {renderTieredPriceInputsRow('cleaning', 'Cleaning', hallFormData)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-hall-form-section admin-hall-form-event-pricing-section">
                                        <div className="admin-hall-form-section-header-flex">
                                            <h4>Event Pricing (Per Sq. Ft.)</h4>
                                            <button type="button" onClick={addEventPrice} className="admin-add-event-button">
                                                <PlusCircle size={18} /> Add Event Type
                                            </button>
                                        </div>
                                        {eventPrices.map((event, index) => (
                                            <div key={index} className="admin-form-group-event">
                                                <div className="admin-event-type-header">
                                                    <label>Event Type {index + 1}:</label>
                                                    <button type="button" onClick={() => removeEventPrice(index)} className="admin-remove-event-button">
                                                        <MinusCircle size={18} /> Remove
                                                    </button>
                                                </div>
                                                <div className="admin-form-group">
                                                    <input type="text" placeholder="e.g., 'Wedding', 'Birthday Party'" value={event.event_type} onChange={(e) => handleEventPriceChange(index, 'event_type', '', e.target.value)} required />
                                                </div>
                                                <div className="admin-hall-form-price-columns two-cols">
                                                    <div className="admin-hall-form-price-column">
                                                        {renderEventTieredPriceInputsRow(index, 'prices_per_sqft_ac', 'AC Prices (per sqft)', event)}
                                                    </div>
                                                    <div className="admin-hall-form-price-column">
                                                        {renderEventTieredPriceInputsRow(index, 'prices_per_sqft_nonac', 'Non-AC Prices (per sqft)', event)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="admin-form-buttons">
                                        <button type="submit" className="admin-form-submit-button">
                                            {currentHall ? 'Update Hall' : 'Create Hall'}
                                        </button>
                                        <button type="button" onClick={resetHallForm} className="admin-form-cancel-button">
                                            {currentHall ? 'Cancel Edit' : 'Clear & Hide Form'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {loadingHalls ? <p>Loading halls...</p> : hallError ? <p style={{ color: 'red' }}>{hallError}</p> : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Name</th><th>Location</th><th>Capacity</th><th>Floors</th>
                                            <th>Area (sqft)</th><th>AC Rms</th><th>Non-AC Rms</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {halls.map((hall) => (
                                            <tr key={hall.hall_id}>
                                                <td>{hall.hall_id}</td><td>{hall.hall_name}</td><td>{hall.location}</td>
                                                <td>{hall.capacity}</td><td>{hall.total_floors}</td><td>{hall.total_area_sqft || 'N/A'}</td>
                                                <td>{hall.num_ac_rooms ?? 'N/A'}</td><td>{hall.num_non_ac_rooms ?? 'N/A'}</td>
                                                <td className="admin-table-actions">
                                                    <button onClick={() => startEditHall(hall)} className="admin-edit-button">Edit</button>
                                                    <button onClick={() => deleteHall(hall.hall_id)} className="admin-delete-button">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {halls.length === 0 && <p>No halls found. Click "Add New Hall" to create one.</p>}
                            </div>
                        )}
                    </section>
                )}

                {activeTab === 'bookings' && (
                    <section>
                        <h2>Booking Management</h2> {/* This h2 remains as is, not affected by the Hall Management button change */}
                        {loadingBookings ? <p>Loading bookings...</p> : bookingError ? <p style={{ color: 'red' }}>{bookingError}</p> : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Booking ID</th><th>Trans. ID</th><th>Hall Name</th><th>Booking Date</th><th>Floor</th>
                                            <th>Function</th><th>AC Rms</th><th>Non-AC Rms</th><th>Amount</th><th>Status</th>
                                            <th>Refund Status</th><th>Refund Amt.</th><th>User ID</th><th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => (
                                            <tr key={booking.booking_id}>
                                                <td>{booking.booking_id}</td><td>{booking.transaction_id || 'N/A'}</td>
                                                <td>{booking.hall_id?.hall_name || 'N/A'}</td>
                                                <td>{booking.booking_date ? new Date(booking.booking_date).toLocaleDateString() : 'N/A'}</td>
                                                <td>{booking.floor}</td><td>{booking.function_type}</td>
                                                <td>{booking.num_ac_rooms_booked ?? 0}</td><td>{booking.num_non_ac_rooms_booked ?? 0}</td>
                                                <td>Rs. {booking.booking_amount}</td><td>{renderStatus(booking.booking_status)}</td>
                                                <td>{renderStatus(booking.refund_status)}</td><td>{booking.refund_amount ?? 'N/A'}</td>
                                                <td>{booking.user_id}</td>
                                                <td className="admin-table-actions">
                                                    {booking.booking_status === 'Pending' && (
                                                        <>
                                                            <button onClick={() => handleConfirmBooking(booking.booking_id)} className="admin-confirm-button">Confirm</button>
                                                            <button onClick={() => handleCancelBooking(booking.booking_id)} className="admin-cancel-button">Cancel</button>
                                                        </>
                                                    )}
                                                    {booking.refund_status === 'Pending' && (
                                                        <button onClick={() => handleProcessRefund(booking.booking_id)} className="admin-process-refund-button">Process Refund</button>
                                                    )}
                                                    <button onClick={() => deleteBooking(booking.booking_id)} className="admin-delete-button">Delete</button>
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
