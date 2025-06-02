// CheckAvailabilitySection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './styles/CheckAvailability.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import axios from 'axios'; // Import axios for CAPTCHA functionality

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
    // Initialize with selected values if available, otherwise current date
    const [displayMonth, setDisplayMonth] = useState(parseInt(selectedMonthValue, 10) || new Date().getMonth() + 1);
    const [displayYear, setDisplayYear] = useState(parseInt(selectedYearValue, 10) || new Date().getFullYear());


    // State for availability data fetched for the displayed month/year
    const [availabilityDataForMonth, setAvailabilityDataForMonth] = useState(null);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState(null);
    const [showAvailabilityAfterCaptcha, setShowAvailabilityAfterCaptcha] = useState(false); // New state for CAPTCHA

    const [viewMode, setViewMode] = useState('calendar');

    // CAPTCHA STATES
    const [captchaSvg, setCaptchaSvg] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");   // JWT from server
    const [captchaInput, setCaptchaInput] = useState("");
    const [captchaError, setCaptchaError] = useState("");

    // Base URL for API calls - Consider moving this to a config file or environment variable
    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';

    const months = [
        { value: '', label: languageType === 'hi' ? 'महीना चुनें' : 'Select Month' },
        { value: '01', label: languageType === 'hi' ? 'जनवरी' : 'January' },
        { value: '02', label: languageType === 'hi' ? 'फरवरी' : 'February' },
        { value: '03', label: languageType === 'hi' ? 'मार्च' : 'March' },
        { value: '04', label: languageType === 'hi' ? 'अप्रैल' : 'April' },
        { value: '05', label: languageType === 'hi' ? 'मई' : 'May' },
        { value: '06', label: languageType === 'hi' ? 'जून' : 'June' },
        { value: '07', label: languageType === 'hi' ? 'जुलाई' : 'July' },
        { value: '08', label: languageType === 'hi' ? 'अगस्त' : 'August' },
        { value: '09', label: languageType === 'hi' ? 'सितंबर' : 'September' },
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

    // Define booking statuses with labels and corresponding CSS color classes
    const bookingStatuses = {
        available: { label: languageType === 'hi' ? 'उपलब्ध' : 'Available', colorClass: 'status-available' },
        preliminary: { label: languageType === 'hi' ? 'प्रारंभिक रूप से बुक किया गया' : 'Preliminary Booked', colorClass: 'status-preliminary' },
        booked: { label: languageType === 'hi' ? 'बुक किया गया' : 'Booked', colorClass: 'status-booked' },
        blocked: { label: languageType === 'hi' ? 'अवरोधित' : 'Blocked', colorClass: 'status-blocked' },
        special: { label: languageType === 'hi' ? 'विशेष बुकिंग' : 'Special Booking', colorClass: 'status-special' },
        past: { label: languageType === 'hi' ? 'पिछली तिथि' : 'Past Date', colorClass: 'status-past' }, // New status for past dates
    };

    // Localized content based on languageType
    const content = {
        en: {
            sectionHeading: 'Check Availability',
            baratGharLabel: 'BaratGhar Name',
            selectHallPlaceholder: 'Select BaratGhar',
            monthLabel: 'Month',
            selectMonthPlaceholder: 'Select Month',
            yearLabel: 'Year',
            selectYearPlaceholder: 'Select Year',
            legendHeading: 'Booking Status Legend:',
            tableDateHeader: 'DATE',
            tableStatusHeader: 'BOOKING STATUS',
            noDataMessage: 'Please select BaratGhar, Month, and Year.',
            noAvailabilityFound: 'No specific availability data found for the selected criteria. Dates are assumed available unless otherwise marked.',
            toggleCalendarView: 'Calendar View',
            toggleListView: 'List View',
            previousMonth: 'Previous Month',
            nextMonth: 'Next Month',
            loadingHallsMessage: 'Loading halls...',
            fetchingAvailabilityMessage: 'Fetching availability...',
            hallsErrorMessage: 'Failed to load halls.',
            availabilityErrorMessage: 'Failed to fetch availability data.',
            enterCaptcha: 'Enter CAPTCHA', // New
            showAvailabilityButton: 'Show Availability', // New
            invalidCaptcha: 'Invalid CAPTCHA', // New
            failedToLoadCaptcha: 'Failed to load CAPTCHA', // New
        },
        hi: {
            sectionHeading: 'उपलब्धता जांचें',
            baratGharLabel: 'बारात घर का नाम',
            selectHallPlaceholder: 'बारात घर चुनें',
            monthLabel: 'महीना',
            selectMonthPlaceholder: 'महीना चुनें',
            yearLabel: 'वर्ष',
            selectYearPlaceholder: 'वर्ष चुनें',
            legendHeading: 'बुकिंग स्थिति लीजेंड:',
            tableDateHeader: 'दिनांक',
            tableStatusHeader: 'बुकिंग स्थिति',
            noDataMessage: 'कृपया बारात घर, महीना और वर्ष चुनें।',
            noAvailabilityFound: 'चयनित मानदंडों के लिए कोई विशिष्ट उपलब्धता डेटा नहीं मिला। जब तक अन्यथा चिह्नित न किया जाए, तिथियां उपलब्ध मानी जाती हैं।',
            toggleCalendarView: 'कैलेंडर दृश्य',
            toggleListView: 'सूची दृश्य',
            previousMonth: 'पिछला महीना',
            nextMonth: 'अगला महीना',
            loadingHallsMessage: 'बारात घर लोड हो रहे हैं...',
            fetchingAvailabilityMessage: 'उपलब्धता प्राप्त हो रही है...',
            hallsErrorMessage: 'बारात घर लोड करने में विफल।',
            availabilityErrorMessage: 'उपलब्धता डेटा प्राप्त करने में विफल।',
            enterCaptcha: 'कैप्चा दर्ज करें', // New
            showAvailabilityButton: 'उपलब्धता दिखाएं', // New
            invalidCaptcha: 'अमान्य कैप्चा', // New
            failedToLoadCaptcha: 'कैप्चा लोड करने में विफल', // New
        },
    };

    const currentContent = content[languageType] || content.en;

    // Fetch the list of all halls when the component mounts
    useEffect(() => {
        const fetchAllHalls = async () => {
            setLoadingHalls(true);
            setHallsError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/halls`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAvailableHalls(data);
            } catch (error) {
                console.error('Error fetching halls:', error);
                setHallsError(currentContent.hallsErrorMessage);
            } finally {
                setLoadingHalls(false);
            }
        };

        fetchAllHalls();
    }, [API_BASE_URL, currentContent.hallsErrorMessage]);

    // Memoized function to fetch availability data
    const fetchAvailabilityData = useCallback(async (hallId, year, month) => {
        if (!hallId || !year || !month) {
            setAvailabilityDataForMonth(null);
            setAvailabilityError(null);
            setLoadingAvailability(false);
            return;
        }

        setLoadingAvailability(true);
        setAvailabilityError(null);
        setAvailabilityDataForMonth(null);

        try {
            const response = await fetch(`${API_BASE_URL}/halls/${hallId}/availability?month=${month}&year=${year}`);

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Availability data not found for hall ${hallId}, month ${month}, year ${year}. Assuming available.`);
                    const daysInMonth = new Date(year, month, 0).getDate();
                    const availableDays = Array.from({ length: daysInMonth }, (_, i) => ({ date: i + 1, status: 'available' }));
                    setAvailabilityDataForMonth(availableDays);
                    return availableDays;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            const availabilityData = responseData.availability;

            const processedData = [];
            const daysInMonth = new Date(year, month, 0).getDate();
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonth = today.getMonth() + 1;
            const currentYearLocal = today.getFullYear();

            const fetchedAvailabilityMap = Object.keys(availabilityData).reduce((map, dateString) => {
                const date = new Date(dateString);
                const day = date.getDate();
                const floorAvailabilities = availabilityData[dateString];

                let overallStatus = 'available';

                if (floorAvailabilities && floorAvailabilities.length > 0) {
                    if (floorAvailabilities.some(floor => floor.status === 'blocked')) {
                        overallStatus = 'blocked';
                    } else if (floorAvailabilities.some(floor => floor.status === 'booked')) {
                        overallStatus = 'booked';
                    } else if (floorAvailabilities.some(floor => floor.status === 'preliminary')) {
                        overallStatus = 'preliminary';
                    } else if (floorAvailabilities.some(floor => floor.status === 'special')) {
                        overallStatus = 'special';
                    }
                }
                map[day] = overallStatus;
                return map;
            }, {});

            for (let day = 1; day <= daysInMonth; day++) {
                let status = fetchedAvailabilityMap[day] || 'available';

                // Mark past dates as 'past' status
                if (year < currentYearLocal || (year === currentYearLocal && month < currentMonth) || (year === currentYearLocal && month === currentMonth && day < currentDay)) {
                    status = 'past';
                }
                processedData.push({ date: day, status: status });
            }

            setAvailabilityDataForMonth(processedData);
            setShowAvailabilityAfterCaptcha(true); // Set to true after successful data fetch
            return processedData;

        } catch (error) {
            console.error('Error fetching availability data:', error);
            setAvailabilityError(error.message || currentContent.availabilityErrorMessage);
            setAvailabilityDataForMonth([]);
            setShowAvailabilityAfterCaptcha(false); // Reset on error
            return [];
        } finally {
            setLoadingAvailability(false);
        }
    }, [API_BASE_URL, currentContent.availabilityErrorMessage]);


    // Effect to fetch CAPTCHA when dropdown selections are complete
    useEffect(() => {
        if (selectedHallId && selectedMonthValue && selectedYearValue) {
            setCaptchaError("");
            setCaptchaInput(""); // Clear input when new captcha is loaded
            setCaptchaSvg("");
            setCaptchaToken("");
            setAvailabilityDataForMonth(null); // Clear previous data
            setShowAvailabilityAfterCaptcha(false); // Reset display flag

            axios
                .get(`${API_BASE_URL}/captcha/get-captcha`)
                .then((res) => {
                    setCaptchaSvg(res.data.svg);
                    setCaptchaToken(res.data.token);
                })
                .catch((err) => {
                    console.error("Failed to load CAPTCHA:", err);
                    setCaptchaError(currentContent.failedToLoadCaptcha);
                });
        }
    }, [selectedHallId, selectedMonthValue, selectedYearValue, API_BASE_URL, currentContent.failedToLoadCaptcha]);

    // Handle "Show Availability" button click
    const handleShowAvailability = async () => {
        setLoadingAvailability(true);
        setAvailabilityError(null);
        setCaptchaError("");
        setShowAvailabilityAfterCaptcha(false); // Hide details until re-verified

        if (!captchaInput) {
            setCaptchaError(currentContent.enterCaptcha);
            setLoadingAvailability(false);
            return;
        }

        try {
            // 1. Verify CAPTCHA first
            const captchaRes = await axios.post(`${API_BASE_URL}/captcha/verify-captcha`, {
                captchaInput,
                captchaToken,
            });

            if (!captchaRes.data?.success) {
                throw new Error(currentContent.invalidCaptcha);
            }

            // If CAPTCHA is successful, proceed with fetching hall details
            const monthInt = parseInt(selectedMonthValue, 10);
            const yearInt = parseInt(selectedYearValue, 10);
            setDisplayMonth(monthInt);
            setDisplayYear(yearInt);
            await fetchAvailabilityData(selectedHallId, yearInt, monthInt);
            setShowAvailabilityAfterCaptcha(true); // Set to true after successful data fetch

        } catch (err) {
            console.error("Availability fetch/CAPTCHA error:", err.response || err.message);
            let errorMessage = err.message || currentContent.fetchingAvailabilityMessage + ' failed.';

            if (err.message === currentContent.invalidCaptcha) {
                setCaptchaError(errorMessage); // Specific error for CAPTCHA
            } else if (err.response?.data?.message) {
                setAvailabilityError(err.response.data.message);
            } else {
                setAvailabilityError(errorMessage);
            }

            // Always try to refresh CAPTCHA on any error
            try {
                const r2 = await axios.get(`${API_BASE_URL}/captcha/get-captcha`);
                setCaptchaSvg(r2.data.svg);
                setCaptchaToken(r2.data.token);
                setCaptchaInput(""); // Clear input on refresh
            } catch (e2) {
                console.error("Failed to reload CAPTCHA after error:", e2);
                setCaptchaError(currentContent.failedToLoadCaptcha);
            }
        } finally {
            setLoadingAvailability(false);
        }
    };


    // Determine if the previous month button should be disabled
    const isPreviousMonthDisabled = () => {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        // If the displayed month/year is the current month/year, disable
        if (displayYear === currentYear && displayMonth === currentMonth) {
            return true;
        }
        // If the displayed year is less than the current year, disable
        if (displayYear < currentYear) {
            return true;
        }
        // If the displayed year is the current year, but the displayed month is less than the current month, disable
        if (displayYear === currentYear && displayMonth < currentMonth) {
            return true;
        }
        return false;
    };

    // Handle navigation to previous month
    const handlePreviousMonth = () => {
        if (!selectedHallId || !showAvailabilityAfterCaptcha || isPreviousMonthDisabled()) return; // Added check for showAvailabilityAfterCaptcha

        let newMonth = displayMonth - 1;
        let newYear = displayYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setDisplayMonth(newMonth);
        setDisplayYear(newYear);
        fetchAvailabilityData(selectedHallId, newYear, newMonth);
    };

    // Handle navigation to next month
    const handleNextMonth = () => {
        if (!selectedHallId || !showAvailabilityAfterCaptcha) return; // Added check for showAvailabilityAfterCaptcha

        let newMonth = displayMonth + 1;
        let newYear = displayYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        setDisplayMonth(newMonth);
        setDisplayYear(newYear);
        fetchAvailabilityData(selectedHallId, newYear, newMonth);
    };

    // Handle change for BaratGhar select dropdown
    const handleBaratGharChange = (event) => {
        setSelectedHallId(event.target.value);
        setAvailabilityError(null); // Clear errors
        setCaptchaError(""); // Clear CAPTCHA errors
        setShowAvailabilityAfterCaptcha(false); // Reset display flag
    };

    // Handle change for Month select dropdown
    const handleMonthChange = (event) => {
        setSelectedMonthValue(event.target.value);
        setAvailabilityError(null); // Clear errors
        setCaptchaError(""); // Clear CAPTCHA errors
        setShowAvailabilityAfterCaptcha(false); // Reset display flag
    };

    // Handle change for Year select dropdown
    const handleYearChange = (event) => {
        setSelectedHallYearValue(event.target.value);
        setAvailabilityError(null); // Clear errors
        setCaptchaError(""); // Clear CAPTCHA errors
        setShowAvailabilityAfterCaptcha(false); // Reset display flag
    };

    // Generates the array of days for the calendar grid
    const generateCalendarDays = (year, month, availabilityData = []) => {
        const date = new Date(year, month - 1, 1);
        const firstDayOfMonth = date.getDay();
        const daysInMonth = new Date(year, month, 0).getDate();

        const calendarDays = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push({ type: 'ca-empty-cell' });
        }

        const availabilityMap = availabilityData.reduce((map, dayInfo) => {
            map[Number(dayInfo.date)] = dayInfo.status;
            return map;
        }, {});

        for (let day = 1; day <= daysInMonth; day++) {
            const status = availabilityMap[day] || 'available';
            calendarDays.push({ type: 'ca-day-cell', date: day, status: status });
        }

        while (calendarDays.length % 7 !== 0) {
            calendarDays.push({ type: 'ca-empty-cell' });
        }

        return calendarDays;
    };

    // Helper to get localized status label and color class
    const getStatusInfo = (statusKey) => {
        return bookingStatuses[statusKey] || { label: statusKey, colorClass: '' };
    };

    // Determine if the data area should be shown
    const allDropdownsSelected = selectedHallId && selectedMonthValue && selectedYearValue;
    const showDataArea = allDropdownsSelected && availabilityDataForMonth !== null && showAvailabilityAfterCaptcha;

    return (
        <section className="ca-section">
            <div className="ca-container">
                <h2 className="ca-section-heading">{currentContent.sectionHeading}</h2>

                <div className="ca-main-content-block">

                    <div className="ca-controls">
                        <div className="ca-dropdowns-inline">
                            <div className="ca-form-group">
                                <label htmlFor="ca-baratghar-select">{currentContent.baratGharLabel}</label>
                                {loadingHalls ? (
                                    <p>{currentContent.loadingHallsMessage}</p>
                                ) : hallsError ? (
                                    <p style={{ color: 'red' }}>{hallsError}</p>
                                ) : (
                                    <select
                                        id="ca-baratghar-select"
                                        value={selectedHallId}
                                        onChange={handleBaratGharChange}
                                        required
                                        className="ca-select"
                                    >
                                        <option value="">{currentContent.selectHallPlaceholder}</option>
                                        {availableHalls.map((hall) => (
                                            <option key={hall.hall_id} value={hall.hall_id}>
                                                {hall.hall_name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="ca-form-group">
                                <label htmlFor="ca-month-select">{currentContent.monthLabel}</label>
                                <select
                                    id="ca-month-select"
                                    value={selectedMonthValue}
                                    onChange={handleMonthChange}
                                    required
                                    className="ca-select"
                                >
                                    {months.map((option) => (
                                        <option key={option.value || 'default'} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="ca-form-group">
                                <label htmlFor="ca-year-select">{currentContent.yearLabel}</label>
                                <select
                                    id="ca-year-select"
                                    value={selectedYearValue}
                                    onChange={handleYearChange}
                                    required
                                    className="ca-select"
                                >
                                    {years.map((option) => (
                                        <option key={option.value || 'default'} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Conditional rendering for messages and CAPTCHA/button */}
                    {!allDropdownsSelected && !loadingHalls && !hallsError && (
                        <p className="ca-availability-message">{currentContent.noDataMessage}</p>
                    )}

                    {allDropdownsSelected && !loadingHalls && !hallsError && !showAvailabilityAfterCaptcha && (
                        <div className="captcha-and-details-section">
                            {/* CAPTCHA IMAGE & INPUT */}
                            {captchaSvg && (
                                <div className="captcha-wrapper">
                                    <input
                                        type="text"
                                        placeholder={currentContent.enterCaptcha}
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        required
                                    />
                                    <div
                                        dangerouslySetInnerHTML={{ __html: captchaSvg }}
                                        style={{ marginBottom: "0.5rem" }}
                                    />
                                </div>
                            )}

                            {/* Error/Success Messages for CAPTCHA */}
                            {captchaError && <div className="ca-availability-message ca-message--error">{captchaError}</div>}


                            <button
                                className="show-availability-button"
                                onClick={handleShowAvailability}
                                disabled={loadingAvailability}
                            >
                                {loadingAvailability ? currentContent.fetchingAvailabilityMessage : currentContent.showAvailabilityButton}
                            </button>
                        </div>
                    )}


                    {loadingAvailability && !availabilityDataForMonth && (
                        <p className="ca-availability-message"> {currentContent.fetchingAvailabilityMessage}</p>
                    )}
                    {availabilityError && (
                        <p className="ca-availability-message ca-message--error"> {availabilityError}</p>
                    )}


                    {showDataArea && !loadingAvailability && !availabilityError && (
                        <>
                            <div className="ca-view-toggle-buttons">
                                <button
                                    className={`ca-toggle-button ${viewMode === 'calendar' ? 'active' : ''}`}
                                    onClick={() => setViewMode('calendar')}
                                    aria-label={currentContent.toggleCalendarView}
                                >
                                    <CalendarIcon size={18} style={{ marginRight: '5px' }} /> {currentContent.toggleCalendarView}
                                </button>
                                <button
                                    className={`ca-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    aria-label={currentContent.toggleListView}
                                >
                                    <List size={18} style={{ marginRight: '5px' }} /> {currentContent.toggleListView}
                                </button>
                            </div>
                            <div className="ca-availability-legend">
                                <h4>{currentContent.legendHeading}</h4>
                                <div className="ca-legend-items">
                                    {Object.keys(bookingStatuses).map(statusKey => {
                                        const statusInfo = bookingStatuses[statusKey];
                                        return (
                                            <div className="ca-legend-item" key={statusKey}>
                                                <span className={`ca-legend-color-box-${statusKey}`}></span>
                                                <span>{statusInfo.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>


                            {viewMode === 'calendar' ? (
                                <div className="ca-availability-calendar">
                                    <div className="ca-calendar-header">
                                        <button
                                            className="ca-nav-button"
                                            onClick={handlePreviousMonth}
                                            aria-label={currentContent.previousMonth}
                                            disabled={isPreviousMonthDisabled()} // Disable button
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <h3>
                                            {months.find(m => parseInt(m.value, 10) === displayMonth)?.label} {displayYear}
                                        </h3>
                                        <button className="ca-nav-button" onClick={handleNextMonth} aria-label={currentContent.nextMonth}>
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                    <div className="ca-calendar-weekdays">
                                        {daysOfWeek.map(day => (
                                            <div key={day.en}>{languageType === 'hi' ? day.hi : day.en}</div>
                                        ))}
                                    </div>
                                    <div className="ca-calendar-grid">
                                        {generateCalendarDays(displayYear, displayMonth, availabilityDataForMonth).map((day, index) => {
                                            const statusInfo = getStatusInfo(day.status);
                                            return (
                                                <div
                                                    key={index}
                                                    className={`ca-calendar-day ${day.type} ${day.type === 'ca-day-cell' ? statusInfo.colorClass : ''}`}
                                                >
                                                    {day.type === 'ca-day-cell' ? day.date : ''}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            ) : (
                                <div className="ca-availability-list">
                                    <div className="ca-calendar-header">
                                        <button
                                            className="ca-nav-button"
                                            onClick={handlePreviousMonth}
                                            aria-label={currentContent.previousMonth}
                                            disabled={isPreviousMonthDisabled()} // Disable button
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <h4 className="ca-availability-table-month-year">
                                            {months.find(m => parseInt(m.value, 10) === displayMonth)?.label} {displayYear}
                                        </h4>
                                        <button className="ca-nav-button" onClick={handleNextMonth} aria-label={currentContent.nextMonth}>
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                    {availabilityDataForMonth && availabilityDataForMonth.length > 0 ? (
                                        <div className="ca-list-columns">
                                            <div className="ca-list-column">
                                                {availabilityDataForMonth.slice(0, 15).map((day) => {
                                                    const statusInfo = getStatusInfo(day.status);
                                                    return (
                                                        <div key={`list-day-left-${day.date}`} className={`ca-list-item ${statusInfo.colorClass}`}>
                                                            <span className="ca-list-date">{day.date}</span>
                                                            <span className="ca-list-status">{statusInfo.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="ca-list-column">
                                                {availabilityDataForMonth.slice(15).map((day) => {
                                                    const statusInfo = getStatusInfo(day.status);
                                                    return (
                                                        <div key={`list-day-right-${day.date}`} className={`ca-list-item ${statusInfo.colorClass}`}>
                                                            <span className="ca-list-date">{day.date}</span>
                                                            <span className="ca-list-status">{statusInfo.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="ca-availability-message" style={{ textAlign: 'center', width: '100%' }}>
                                            {currentContent.noAvailabilityFound}
                                        </p>
                                    )}
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