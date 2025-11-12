import React, { useState, useEffect,useCallback } from 'react';
import './styles/HallManagement.css';

// The getAuthToken prop is no longer needed and has been removed.
const HallManagement = ({ API_BASE_URL }) => {
    const [halls, setHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallError, setHallError] = useState(null);
    const [showHallForm, setShowHallForm] = useState(false);
    
    // The hall being edited, or null if creating a new one.
    const [currentHall, setCurrentHall] = useState(null); 

    // State for the form.
    const [hallFormData, setHallFormData] = useState({
        hall_name: '',
        location: '',
        pricing: '',
    });

    // --- Data Fetching ---

    const fetchHalls = useCallback(async () => {
        setLoadingHalls(true);
        setHallError(null);
        try {
            // This is a public endpoint, so no credentials are needed.
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
    },[API_BASE_URL]);

    useEffect(() => {
        fetchHalls();
    }, [fetchHalls]);

    // --- Form Handling ---

    const handleHallInputChange = (e) => {
        const { name, value } = e.target;
        setHallFormData(prev => ({ ...prev, [name]: value }));
    };

    const resetHallForm = () => {
        setCurrentHall(null);
        setHallFormData({
            hall_name: '',
            location: '',
            pricing: '',
        });
        setShowHallForm(false);
    };

    const handleHallSubmit = async (e) => {
        e.preventDefault();
        
        // No need to get token manually.
        const method = currentHall ? 'PUT' : 'POST';
        const url = currentHall ? `${API_BASE_URL}/halls/${currentHall._id}` : `${API_BASE_URL}/halls`;

        const payload = {
            ...hallFormData,
            pricing: Number(hallFormData.pricing), // Ensure pricing is a number
        };

        try {
            const response = await fetch(url, {
                method,
                credentials: 'include', // <-- SEND COOKIES FOR AUTHENTICATION
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to save the hall.`);
            }

            fetchHalls();
            resetHallForm();
        } catch (error) {
            console.error('Error saving hall:', error);
            alert(`Error: ${error.message}`);
        }
    };

    // --- Actions ---

    const startEditHall = (hall) => {
        setCurrentHall(hall);
        setHallFormData({
            hall_name: hall.hall_name,
            location: hall.location,
            pricing: hall.pricing,
        });
        setShowHallForm(true);
    };

    const deleteHall = async (hallId) => {
        // No need to get token manually.
        if (window.confirm(`Are you sure you want to delete this hall? This action cannot be undone.`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/halls/${hallId}`, {
                    method: 'DELETE',
                    credentials: 'include', // <-- SEND COOKIES FOR AUTHENTICATION
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to delete hall.');
                }

                fetchHalls();
                if (currentHall && currentHall._id === hallId) {
                    resetHallForm();
                }
            } catch (error) {
                console.error('Error deleting hall:', error);
                alert(`Error: ${error.message}`);
            }
        }
    };

    // --- Render ---

    return (
        <div className="admin-card">
            <section>
                <div className="admin-section-header-with-button">
                    <h2>Hall Management</h2>
                    <button 
                        className="admin-form-toggle-button" 
                        onClick={() => {
                            if (showHallForm) {
                                resetHallForm();
                            } else {
                                setCurrentHall(null);
                                setShowHallForm(true);
                            }
                        }}
                    >
                        {showHallForm ? 'Close Form' : 'Add New Hall'}
                    </button>
                </div>

                {showHallForm && (
                    <div className="admin-form-container">
                        <h3>{currentHall ? `Editing "${currentHall.hall_name}"` : 'Create a New Hall'}</h3>
                        <form onSubmit={handleHallSubmit}>
                            <div className="admin-form-grid">
                                <div className="admin-form-group">
                                    <label htmlFor="hall_name">Hall Name:</label>
                                    <input type="text" id="hall_name" name="hall_name" value={hallFormData.hall_name} onChange={handleHallInputChange} required />
                                </div>
                                <div className="admin-form-group">
                                    <label htmlFor="location">Location:</label>
                                    <input type="text" id="location" name="location" value={hallFormData.location} onChange={handleHallInputChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label htmlFor="pricing">Pricing (per booking):</label>
                                    <input type="number" id="pricing" name="pricing" value={hallFormData.pricing} onChange={handleHallInputChange} required min="0" placeholder="e.g., 5000" />
                                </div>
                            </div>
                            <div className="admin-form-buttons">
                                <button type="submit" className="admin-form-submit-button">
                                    {currentHall ? 'Update Hall' : 'Create Hall'}
                                </button>
                                <button type="button" onClick={resetHallForm} className="admin-form-cancel-button">
                                    Cancel
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
                                    <th>Name</th>
                                    <th>Location</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {halls.map((hall) => (
                                    <tr key={hall._id}>
                                        <td>{hall.hall_name}</td>
                                        <td>{hall.location || 'N/A'}</td>
                                        <td>Rs. {hall.pricing.toLocaleString()}</td>
                                        <td className="admin-table-actions">
                                            <button onClick={() => startEditHall(hall)} className="hall-m-edit-button">Edit</button>
                                            <button onClick={() => deleteHall(hall._id)} className="hall-m-delete-button">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {halls.length === 0 && <p>No halls found. Click "Add New Hall" to create one.</p>}
                    </div>
                )}
            </section>
        </div>
    );
};

export default HallManagement;