import React, { useState, useEffect } from 'react';
import './styles/adminManagement.css'; // CORRECTED PATH

// --- SVG Icons ---
const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);
// --- End SVG Icons ---

const content = {
    en: {
        title: 'Admin Management',
        subtitle: 'Add new admin users and view existing ones.',
        loading: 'Loading...',
        addAdminTitle: 'Add New Admin',
        editAdminTitle: 'Edit Admin', // NEW
        usernameLabel: 'Name', // CHANGED
        usernamePlaceholder: '', // CHANGED
        phoneLabel: 'Phone Number',
        phonePlaceholder: '', // CHANGED
        passwordLabel: 'Password',
        passwordPlaceholder: '', // CHANGED
        editPasswordLabel: 'New Password (Optional)', // NEW
        editPasswordPlaceholder: 'Leave blank to keep unchanged', // NEW
        addButton: 'Add Admin',
        addingButton: 'Adding...',
        updateButton: 'Update Admin', // NEW
        updatingButton: 'Updating...', // NEW
        existingAdminsTitle: 'Existing Admins',
        deleteConfirmTitle: 'Confirm Deletion', // NEW
        deleteConfirmText: 'Are you sure you want to delete this admin? This action cannot be undone.', // NEW
        deleteButton: 'Delete', // NEW
        confirmDeleteButton: 'Yes, Delete', // NEW
        cancelButton: 'Cancel', // NEW
        messages: {
            required: 'All fields are required.',
            passwordShort: 'Password must be at least 6 characters.',
            successAdd: 'Admin user added successfully!', // CHANGED
            successUpdate: 'Admin user updated successfully!', // NEW
            successDelete: 'Admin user deleted successfully!', // NEW
            addError: 'Failed to add admin.',
            updateError: 'Failed to update admin.', // NEW
            deleteError: 'Failed to delete admin.', // NEW
            loadError: 'Could not load admin data.',
            lastAdminError: 'Cannot delete the last admin account.' // NEW
        }
    },
    hi: {
        title: ' व्यवस्थापक प्रबंधन',
        subtitle: 'नए व्यवस्थापक उपयोगकर्ता जोड़ें और मौजूदा देखें।',
        loading: 'लोड हो रहा है...',
        addAdminTitle: 'नया व्यवस्थापक जोड़ें',
        editAdminTitle: 'व्यवस्थापक संपादित करें', // NEW
        usernameLabel: 'नाम', // CHANGED
        usernamePlaceholder: '', // CHANGED
        phoneLabel: 'फ़ोन नंबर',
        phonePlaceholder: '', // CHANGED
        passwordLabel: 'पासवर्ड',
        passwordPlaceholder: '', // CHANGED
        editPasswordLabel: 'नया पासवर्ड (वैकल्पिक)', // NEW
        editPasswordPlaceholder: 'अपरिवर्तित रखने के लिए खाली छोड़ दें', // NEW
        addButton: 'व्यवस्थापक जोड़ें',
        addingButton: 'जोड़ा जा रहा है...',
        updateButton: 'व्यवस्थापक अपडेट करें', // NEW
        updatingButton: 'अपडेट हो रहा है...', // NEW
        existingAdminsTitle: 'मौजूदा व्यवस्थापक',
        deleteConfirmTitle: 'हटाने की पुष्टि करें', // NEW
        deleteConfirmText: 'क्या आप वाकई इस व्यवस्थापक को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।', // NEW
        deleteButton: 'हटाएं', // NEW
        confirmDeleteButton: 'हां, हटाएं', // NEW
        cancelButton: 'रद्द करें', // NEW
        messages: {
            required: 'सभी फ़ील्ड आवश्यक हैं।',
            passwordShort: 'पासवर्ड कम से "कम 6 अक्षरों का होना चाहिए।',
            successAdd: 'व्यवस्थापक उपयोगकर्ता सफलतापूर्वक जोड़ा गया!', // CHANGED
            successUpdate: 'व्यवस्थापक उपयोगकर्ता सफलतापूर्वक अपडेट किया गया!', // NEW
            successDelete: 'व्यवस्थापक उपयोगकर्ता सफलतापूर्वक हटा दिया गया!', // NEW
            addError: 'व्यवस्थापक जोड़ने में विफल।',
            updateError: 'व्यवस्थापक अपडेट करने में विफल।', // NEW
            deleteError: 'व्यवस्थापक हटाने में विफल।', // NEW
            loadError: 'व्यवस्थापक डेटा लोड नहीं हो सका।',
            lastAdminError: 'अंतिम व्यवस्थापक खाते को हटाया नहीं जा सकता।' // NEW
        }
    }
};

const AdminManagement = ({ languageType = 'en' }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: ''
    });
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showForm, setShowForm] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null); // NEW: State for editing
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // NEW: State for delete modal

    const currentContent = content[languageType] || content.en;
    const backend = "https://kalyanmandapam.onrender.com";

    const fetchAdmins = async () => {
        try {
            const response = await fetch(`${backend}/api/admin/admins`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error(currentContent.messages.loadError);
            const data = await response.json();
            setAdmins(data);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || currentContent.messages.loadError });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleShowAddForm = () => {
        setEditingAdmin(null);
        setFormData({ name: '', phone: '', password: '' });
        setShowForm(true);
        setMessage({ type: '', text: '' });
    };

    const handleShowEditForm = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            name: admin.name,
            phone: admin.phone,
            password: '' // Clear password field for editing
        });
        setShowForm(true);
        setMessage({ type: '', text: '' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAdmin(null);
        setFormData({ name: '', phone: '', password: '' });
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        const { name, phone, password } = formData;
        
        // --- Validation ---
        if (!name || !phone) {
            setMessage({ type: 'error', text: currentContent.messages.required });
            return;
        }
        // Password required for 'add', optional for 'edit'
        if (!editingAdmin && !password) {
            setMessage({ type: 'error', text: currentContent.messages.required });
            return;
        }
        if (password && password.length < 6) {
            setMessage({ type: 'error', text: currentContent.messages.passwordShort });
            return;
        }

        setIsSubmitting(true);

        const isEditing = !!editingAdmin;
        const url = isEditing 
            ? `${backend}/api/admin/admin/${editingAdmin._id}` 
            : `${backend}/api/admin/add-admin`;
        
        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || (isEditing ? currentContent.messages.updateError : currentContent.messages.addError));

            setMessage({ type: 'success', text: isEditing ? currentContent.messages.successUpdate : currentContent.messages.successAdd });
            handleCancel(); // Reset form
            fetchAdmins(); // Refresh list

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (adminId) => {
        setShowDeleteConfirm(null); // Close modal
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch(`${backend}/api/admin/admin/${adminId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();
            if (!response.ok) {
                 // Handle specific "last admin" error
                if (data.message === "Cannot delete the last admin account.") {
                   throw new Error(currentContent.messages.lastAdminError);
                }
                throw new Error(data.message || currentContent.messages.deleteError);
            }

            setMessage({ type: 'success', text: currentContent.messages.successDelete });
            fetchAdmins(); // Refresh list

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    return (
        <div className="admin-mgmt-container">
            <div className="admin-mgmt-card">
           
                <div className="admin-mgmt-header">
                    <div className="admin-mgmt-message-container">
                        {message.text && (
                            <div className={`admin-mgmt-message admin-mgmt-message--${message.type}`}>
                                {message.text}
                            </div>
                        )}
                    </div>
                  
                    {!showForm && (
                        <button 
                            className="admin-mgmt-btn-submit admin-mgmt-btn-header" /* MODIFIED */
                            onClick={handleShowAddForm} 
                            type="button"
                        >
                            {currentContent.addButton}
                        </button>
                    )}
                </div>

              
                {showForm && (
                    <div className="admin-mgmt-form-wrapper admin-mgmt-fade-in">
                        <h2 className="admin-mgmt-section-title">
                            {editingAdmin ? currentContent.editAdminTitle : currentContent.addAdminTitle}
                        </h2>
                        <form onSubmit={handleSubmit} className="admin-mgmt-form">
                            <div className="admin-mgmt-form-row">
                                <div className="admin-mgmt-form-group">
                                    <label>{currentContent.usernameLabel}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="admin-mgmt-form-control"
                                    />
                                </div>

                                <div className="admin-mgmt-form-group">
                                    <label>{currentContent.phoneLabel}</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="admin-mgmt-form-control"
                                    />
                                </div>
                            </div>

                            <div className="admin-mgmt-form-group">
                                <label>
                                    {editingAdmin ? currentContent.editPasswordLabel : currentContent.passwordLabel}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="admin-mgmt-form-control"
                                    placeholder={editingAdmin ? currentContent.editPasswordPlaceholder : currentContent.passwordPlaceholder}
                                />
                            </div>

                            <div className="admin-mgmt-form-button-row">
                                <button
                                    type="button"
                                    className="admin-mgmt-btn-cancel-form"
                                    onClick={handleCancel}
                                >
                                    {currentContent.cancelButton}
                                </button>
                                <button type="submit" className="admin-mgmt-btn-submit-form" disabled={isSubmitting}>
                                    {isSubmitting 
                                        ? (editingAdmin ? currentContent.updatingButton : currentContent.addingButton)
                                        : (editingAdmin ? currentContent.updateButton : currentContent.addButton)
                                    }
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <h2 className="admin-mgmt-section-title admin-mgmt-list-title">
                    {currentContent.existingAdminsTitle}
                </h2>
                
                {isLoading ? (
                    <div className="admin-mgmt-loader">{currentContent.loading}</div>
                ) : (
                    <div className="admin-list-container">
                        {admins.length > 0 ? (
                            admins.map(admin => (
                                <div key={admin._id} className="admin-list-item">
                                   <div className="admin-info">
                                        <div className="admin-avatar">
                                            {admin.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="admin-details">
                                            <span className="admin-name">{admin.name}</span>
                                            <span className="admin-detail">{admin.phone}</span>
                                        </div>
                                    </div>
                                    {/* --- NEW ACTIONS --- */}
                                    <div className="admin-list-actions">
                                        <button 
                                            className="admin-btn-edit" 
                                            title="Edit"
                                            onClick={() => handleShowEditForm(admin)}
                                        >
                                            <EditIcon />
                                        </button>
                                        <button 
                                            className="admin-btn-delete" 
                                            title="Delete"
                                            onClick={() => setShowDeleteConfirm(admin._id)}
                                            disabled={admins.length <= 1} // Disable if only one admin
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="admin-mgmt-empty-state">No admin users found.</p>
                        )}
                    </div>
                )}

                {/* --- NEW BUTTON FOR MOBILE --- */}
                {!showForm && (
                    <button 
                        className="admin-mgmt-btn-submit admin-mgmt-btn-mobile-fab" 
                        onClick={handleShowAddForm} 
                        type="button"
                    >
                        {currentContent.addButton}
                    </button>
                )}
                {/* --- END NEW BUTTON --- */}

            </div>

            {/* --- NEW: Delete Confirmation Modal --- */}
            {showDeleteConfirm && (
                <div className="admin-mgmt-modal-overlay">
                    <div className="admin-mgmt-modal">
                        <h3>{currentContent.deleteConfirmTitle}</h3>
                        <p>{currentContent.deleteConfirmText}</p>
                        <div className="admin-mgmt-modal-actions">
                            <button 
                                className="admin-mgmt-btn-modal-cancel"
                                onClick={() => setShowDeleteConfirm(null)}
                            >
                                {currentContent.cancelButton}
                            </button>
                            <button 
                                className="admin-mgmt-btn-modal-confirm"
                                onClick={() => handleDelete(showDeleteConfirm)}
                            >
                                {currentContent.confirmDeleteButton}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;