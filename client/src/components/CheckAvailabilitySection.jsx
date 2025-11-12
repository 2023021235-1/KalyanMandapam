// CheckAvailabilitySection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './styles/CheckAvailability.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import axios from 'axios';

const CheckAvailabilitySection = ({ languageType = 'en' }) => {
    // State to store the list of available halls fetched from the API
    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);

    // State for the selected hall, month, and year from dropdowns
    const [selectedHallId, setSelectedHallId] = useState('');
    const [selectedMonthValue, setSelectedMonthValue] = useState('');
    const [selectedYearValue, setSelectedHallYearValue] = useState('');

    // State for the currently displayed month and year in the calendar/list
    const [displayMonth, setDisplayMonth] = useState(new Date().getMonth() + 1);
    const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

    // State for availability data
    const [availabilityDataForMonth, setAvailabilityDataForMonth] = useState(null);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState(null);
    const [showAvailabilityAfterCaptcha, setShowAvailabilityAfterCaptcha] = useState(false);

    const [viewMode, setViewMode] = useState('calendar');

    // CAPTCHA STATES
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");

    // --- CONFIGURATION & CONTENT ---

    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';

    const months = [
        { value: '', label: languageType === 'hi' ? 'महीना चुनें' : 'Select Month' },
        { value: '1', label: languageType === 'hi' ? 'जनवरी' : 'January' },
        { value: '2', label: languageType === 'hi' ? 'फरवरी' : 'February' },
        { value: '3', label: languageType === 'hi' ? 'मार्च' : 'March' },
        { value: '4', label: languageType === 'hi' ? 'अप्रैल' : 'April' },
        { value: '5', label: languageType === 'hi' ? 'मई' : 'May' },
        { value: '6', label: languageType === 'hi' ? 'जून' : 'June' },
        { value: '7', label: languageType === 'hi' ? 'जुलाई' : 'July' },
        { value: '8', label: languageType === 'hi' ? 'अगस्त' : 'August' },
        { value: '9', label: languageType === 'hi' ? 'सितंबर' : 'September' },
        { value: '10', label: languageType === 'hi' ? 'अक्टूबर' : 'October' },
        { value: '11', label: languageType === 'hi' ? 'नवंबर' : 'November' },
        { value: '12', label: languageType === 'hi' ? 'दिसंबर' : 'December' },
    ];

    const daysOfWeek = [
        { en: 'Sun', hi: 'रवि' }, { en: 'Mon', hi: 'सोम' }, { en: 'Tue', hi: 'मंगल' },
        { en: 'Wed', hi: 'बुध' }, { en: 'Thu', hi: 'गुरु' }, { en: 'Fri', hi: 'शुक्र' },
        { en: 'Sat', hi: 'शनि' }
    ];

    const currentYear = new Date().getFullYear();
    const years = [
        { value: '', label: languageType === 'hi' ? 'वर्ष चुनें' : 'Select Year' },
        { value: currentYear.toString(), label: currentYear.toString() },
        { value: (currentYear + 1).toString(), label: (currentYear + 1).toString() },
        { value: (currentYear + 2).toString(), label: (currentYear + 2).toString() },
    ];

    const bookingStatuses = {
        available: { label: languageType === 'hi' ? 'उपलब्ध' : 'Available', colorClass: 'status-available' },
        booked: { label: languageType === 'hi' ? 'बुक किया गया' : 'Booked', colorClass: 'status-booked' },
        blocked: { label: languageType === 'hi' ? 'अवरोधित' : 'Blocked', colorClass: 'status-blocked' },
        past: { label: languageType === 'hi' ? 'पिछली तिथि' : 'Past Date', colorClass: 'status-past' },
    };

    const content = {
        en: {
            sectionHeading: 'Check Availability',
            baratGharLabel: 'Community Hall',
            selectHallPlaceholder: 'Select a Hall',
            monthLabel: 'Month',
            yearLabel: 'Year',
            legendHeading: 'Status Legend:',
            noDataMessage: 'Please select a Hall, Month, and Year to begin.',
            noAvailabilityFound: 'No bookings found for this month. All dates are available.',
            toggleCalendarView: 'Calendar View',
            toggleListView: 'List View',
            previousMonth: 'Previous Month',
            nextMonth: 'Next Month',
            loadingHallsMessage: 'Loading halls...',
            fetchingAvailabilityMessage: 'Fetching availability...',
            enterCaptcha: 'Enter CAPTCHA',
            showAvailabilityButton: 'Show Availability',
            invalidCaptcha: 'Invalid CAPTCHA. Please try again.',
            failedToLoadCaptcha: 'Failed to load CAPTCHA.',
        },
        hi: {
            sectionHeading: 'उपलब्धता जांचें',
            baratGharLabel: 'सामुदायिक भवन',
            selectHallPlaceholder: 'एक हॉल चुनें',
            monthLabel: 'महीना',
            yearLabel: 'वर्ष',
            legendHeading: 'स्थिति लीजेंड:',
            noDataMessage: 'कृपया एक हॉल, महीना और वर्ष चुनें।',
            noAvailabilityFound: 'इस महीने के लिए कोई बुकिंग नहीं मिली। सभी तिथियां उपलब्ध हैं।',
            toggleCalendarView: 'कैलेंडर दृश्य',
            toggleListView: 'सूची दृश्य',
            previousMonth: 'पिछला महीना',
            nextMonth: 'अगला महीना',
            loadingHallsMessage: 'हॉल लोड हो रहे हैं...',
            fetchingAvailabilityMessage: 'उपलब्धता प्राप्त हो रही है...',
            enterCaptcha: 'कैप्चा दर्ज करें',
            showAvailabilityButton: 'उपलब्धता दिखाएं',
            invalidCaptcha: 'अमान्य कैप्चा। कृपया पुन प्रयास करें।',
            failedToLoadCaptcha: 'कैप्चा लोड करने में विफल।',
        },
    };

    const currentContent = content[languageType] || content.en;

    // --- API CALLS & EFFECTS ---

    useEffect(() => {
        const fetchAllHalls = async () => {
            setLoadingHalls(true);
            setHallsError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/halls`);
                setAvailableHalls(response.data);
            } catch (error) {
                console.error('Error fetching halls:', error);
                setHallsError('Failed to load the list of halls.');
            } finally {
                setLoadingHalls(false);
            }
        };
        fetchAllHalls();
    }, [API_BASE_URL]);

    const fetchAvailabilityData = useCallback(async (hallId, year, month) => {
        if (!hallId || !year || !month) return;

        setLoadingAvailability(true);
        setAvailabilityError(null);
        setAvailabilityDataForMonth(null);

        try {
            const response = await axios.get(`${API_BASE_URL}/halls/${hallId}/availability?month=${month}&year=${year}`);
            const availabilityData = response.data.availability || {};

            const processedData = [];
            const daysInMonth = new Date(year, month, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize today's date for accurate comparison

            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(year, month - 1, day);
                const dateString = currentDate.toISOString().split('T')[0];
                
                let status = 'available'; // Default status
                
                // Check if the date is in the past
                if (currentDate < today) {
                    status = 'past';
                } else if (availabilityData[dateString]) {
                    // With the simplified model, we can assume if the date exists, it's booked.
                    // The backend response is an array, check if any entry has 'booked' status.
                    if (availabilityData[dateString].some(s => s.status === 'booked')) {
                       status = 'booked';
                    } else if (availabilityData[dateString].some(s => s.status === 'blocked')) {
                       status = 'blocked';
                    }
                }
                processedData.push({ date: day, status: status });
            }
            setAvailabilityDataForMonth(processedData);
        } catch (error) {
            console.error('Error fetching availability data:', error);
            setAvailabilityError('Could not fetch availability data.');
        } finally {
            setLoadingAvailability(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        if (selectedHallId && selectedMonthValue && selectedYearValue) {
            setShowAvailabilityAfterCaptcha(false);
            setAvailabilityDataForMonth(null);
            setCaptchaError("");
            setCaptchaInput("");

            axios.get(`${API_BASE_URL}/captcha/get-captcha`)
                .then(res => {
                    setCaptchaSvg(res.data.svg);
                    setCaptchaToken(res.data.token);
                })
                .catch(err => {
                    console.error("Failed to load CAPTCHA:", err);
                    setCaptchaError(currentContent.failedToLoadCaptcha);
                });
        }
    }, [selectedHallId, selectedMonthValue, selectedYearValue, API_BASE_URL, currentContent.failedToLoadCaptcha]);

    // --- EVENT HANDLERS ---

    const handleShowAvailability = async () => {
        if (!captchaInput) {
            setCaptchaError(currentContent.enterCaptcha);
            return;
        }
        setLoadingAvailability(true);
        setAvailabilityError(null);
        setCaptchaError("");
        setShowAvailabilityAfterCaptcha(false);

        try {
            const captchaRes = await axios.post(`${API_BASE_URL}/captcha/verify-captcha`, { captchaInput, captchaToken });
            if (!captchaRes.data?.success) {
                throw new Error(currentContent.invalidCaptcha);
            }

            const monthInt = parseInt(selectedMonthValue, 10);
            const yearInt = parseInt(selectedYearValue, 10);
            setDisplayMonth(monthInt);
            setDisplayYear(yearInt);
            await fetchAvailabilityData(selectedHallId, yearInt, monthInt);
            setShowAvailabilityAfterCaptcha(true);

        } catch (err) {
            if (err.message === currentContent.invalidCaptcha) {
                setCaptchaError(err.message);
            } else {
                setAvailabilityError('Failed to fetch data after verification.');
            }
            // Refresh CAPTCHA on error
            axios.get(`${API_BASE_URL}/captcha/get-captcha`)
                .then(res => {
                    setCaptchaSvg(res.data.svg);
                    setCaptchaToken(res.data.token);
                    setCaptchaInput("");
                });
        } finally {
            setLoadingAvailability(false);
        }
    };

    const isPreviousMonthDisabled = () => {
        const today = new Date();
        const firstOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstOfDisplayMonth = new Date(displayYear, displayMonth - 1, 1);
        return firstOfDisplayMonth <= firstOfCurrentMonth;
    };

    const handleMonthNavigation = (direction) => {
        if (!selectedHallId) return;
        
        let newMonth = displayMonth + direction;
        let newYear = displayYear;
        if (newMonth < 1) {
            newMonth = 12; newYear--;
        } else if (newMonth > 12) {
            newMonth = 1; newYear++;
        }
        setDisplayMonth(newMonth);
        setDisplayYear(newYear);
        fetchAvailabilityData(selectedHallId, newYear, newMonth);
    };

    const generateCalendarDays = (year, month, availabilityData = []) => {
        const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const calendarDays = Array(firstDayOfMonth).fill({ type: 'ca-empty-cell' });
        const availabilityMap = availabilityData.reduce((map, dayInfo) => {
            map[dayInfo.date] = dayInfo.status;
            return map;
        }, {});
        for (let day = 1; day <= daysInMonth; day++) {
            calendarDays.push({ type: 'ca-day-cell', date: day, status: availabilityMap[day] || 'available' });
        }
        return calendarDays;
    };

    const allDropdownsSelected = selectedHallId && selectedMonthValue && selectedYearValue;

    // --- RENDER ---
    return (
        <section className="ca-section">
            <div className="ca-container">
                <h2 className="ca-section-heading">{currentContent.sectionHeading}</h2>
                <div className="ca-main-content-block">
                    <div className="ca-controls">
                        <div className="ca-dropdowns-inline">
                            <div className="ca-form-group">
                                <label htmlFor="ca-baratghar-select">{currentContent.baratGharLabel}</label>
                                {loadingHalls ? <p>{currentContent.loadingHallsMessage}</p> : hallsError ? <p style={{ color: 'red' }}>{hallsError}</p> : (
                                    <select id="ca-baratghar-select" value={selectedHallId} onChange={(e) => setSelectedHallId(e.target.value)} required className="ca-select">
                                        <option value="">{currentContent.selectHallPlaceholder}</option>
                                        {/* --- THIS IS THE FIX --- */}
                                        {/* Use hall._id for key and value, not hall.hall_id */}
                                        {availableHalls.map((hall) => (
                                            <option key={hall._id} value={hall._id}>
                                                {hall.hall_name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="ca-form-group">
                                <label htmlFor="ca-month-select">{currentContent.monthLabel}</label>
                                <select id="ca-month-select" value={selectedMonthValue} onChange={(e) => setSelectedMonthValue(e.target.value)} required className="ca-select">
                                    {months.map((option) => <option key={option.value || 'default'} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                            <div className="ca-form-group">
                                <label htmlFor="ca-year-select">{currentContent.yearLabel}</label>
                                <select id="ca-year-select" value={selectedYearValue} onChange={(e) => setSelectedHallYearValue(e.target.value)} required className="ca-select">
                                    {years.map((option) => <option key={option.value || 'default'} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {!allDropdownsSelected && <p className="ca-availability-message">{currentContent.noDataMessage}</p>}

                    {allDropdownsSelected && !showAvailabilityAfterCaptcha && (
                        <div className="captcha-and-details-section">
                            {captchaSvg && (
                                <div className="captcha-wrapper">
                                    <input type="text" placeholder={currentContent.enterCaptcha} value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} required />
                                    <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
                                </div>
                            )}
                            {captchaError && <div className="ca-availability-message ca-message--error">{captchaError}</div>}
                            <button className="show-availability-button" onClick={handleShowAvailability} disabled={loadingAvailability}>
                                {loadingAvailability ? currentContent.fetchingAvailabilityMessage : currentContent.showAvailabilityButton}
                            </button>
                        </div>
                    )}

                    {loadingAvailability && <p className="ca-availability-message">{currentContent.fetchingAvailabilityMessage}</p>}
                    {availabilityError && <p className="ca-availability-message ca-message--error">{availabilityError}</p>}
                    
                    {showAvailabilityAfterCaptcha && availabilityDataForMonth && (
                        <>
                            <div className="ca-view-toggle-buttons">
                                <button className={`ca-toggle-button ${viewMode === 'calendar' ? 'active' : ''}`} onClick={() => setViewMode('calendar')}><CalendarIcon size={18} /> {currentContent.toggleCalendarView}</button>
                                <button className={`ca-toggle-button ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><List size={18} /> {currentContent.toggleListView}</button>
                            </div>
                            <div className="ca-availability-legend">
                                <h4>{currentContent.legendHeading}</h4>
                                <div className="ca-legend-items">
                                    {Object.entries(bookingStatuses).map(([key, { label }]) => (
                                        <div className="ca-legend-item" key={key}><span className={`ca-legend-color-box-${key}`}></span><span>{label}</span></div>
                                    ))}
                                </div>
                            </div>
                            {viewMode === 'calendar' ? (
                                <div className="ca-availability-calendar">
                                    <div className="ca-calendar-header">
                                        <button className="ca-nav-button" onClick={() => handleMonthNavigation(-1)} disabled={isPreviousMonthDisabled()}><ChevronLeft size={24} /></button>
                                        <h3>{months.find(m => m.value === displayMonth)?.label} {displayYear}</h3>
                                        <button className="ca-nav-button" onClick={() => handleMonthNavigation(1)}><ChevronRight size={24} /></button>
                                    </div>
                                    <div className="ca-calendar-weekdays">{daysOfWeek.map(day => <div key={day.en}>{languageType === 'hi' ? day.hi : day.en}</div>)}</div>
                                    <div className="ca-calendar-grid">
                                        {generateCalendarDays(displayYear, displayMonth, availabilityDataForMonth).map((day, index) => (
                                            <div key={index} className={`ca-calendar-day ${day.type} ${bookingStatuses[day.status]?.colorClass || ''}`}>
                                                {day.date}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="ca-availability-list">
                                    <div className="ca-calendar-header">
                                        <button className="ca-nav-button" onClick={() => handleMonthNavigation(-1)} disabled={isPreviousMonthDisabled()}><ChevronLeft size={24} /></button>
                                        <h4>{months.find(m => m.value === displayMonth)?.label} {displayYear}</h4>
                                        <button className="ca-nav-button" onClick={() => handleMonthNavigation(1)}><ChevronRight size={24} /></button>
                                    </div>
                                    {availabilityDataForMonth.length > 0 ? (
                                        <div className="ca-list-columns">
                                            {[0, 1].map(colIndex => (
                                                <div className="ca-list-column" key={colIndex}>
                                                    {availabilityDataForMonth.slice(colIndex * 16, (colIndex + 1) * 16).map(day => (
                                                        <div key={day.date} className={`ca-list-item ${bookingStatuses[day.status]?.colorClass || ''}`}>
                                                            <span className="ca-list-date">{day.date}</span>
                                                            <span className="ca-list-status">{bookingStatuses[day.status]?.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="ca-availability-message">{currentContent.noAvailabilityFound}</p>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CheckAvailabilitySection;