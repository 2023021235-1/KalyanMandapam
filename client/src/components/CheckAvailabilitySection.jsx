// CheckAvailabilitySection.jsx
import React, { useState, useEffect } from 'react';
import './styles/CheckAvailability.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';

const CheckAvailabilitySection = ({ languageType = 'en' }) => {
    // State to store the list of available halls fetched from the API
    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);

    // State for the selected hall, month, and year
    const [selectedHallId, setSelectedHallId] = useState('');
    const [selectedMonthValue, setSelectedMonthValue] = useState('');
    const [selectedYearValue, setSelectedYearValue] = useState('');

    // State for the currently displayed month and year in the calendar/list
    const [displayMonth, setDisplayMonth] = useState(new Date().getMonth() + 1);
    const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

    // State for availability data fetched for the displayed month/year
    const [availabilityDataForMonth, setAvailabilityDataForMonth] = useState(null);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState(null);


    const [viewMode, setViewMode] = useState('calendar');

    // Base URL for API calls
    const API_BASE_URL = 'http://localhost:5000/api';

    const months = [
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
        { value: currentYear.toString(), label: currentYear.toString() },
        { value: (currentYear + 1).toString(), label: (currentYear + 1).toString() },
        { value: (currentYear + 2).toString(), label: (currentYear + 2).toString() },
    ];

    const bookingStatuses = {
        available: { label: languageType === 'hi' ? 'उपलब्ध' : 'Available', colorClass: 'status-available' },
        preliminary: { label: languageType === 'hi' ? 'प्रारंभिक रूप से बुक किया गया' : 'Preliminary Booked', colorClass: 'status-preliminary' },
        booked: { label: languageType === 'hi' ? 'बुक किया गया' : 'Booked', colorClass: 'status-booked' },
        blocked: { label: languageType === 'hi' ? 'अवरोधित' : 'Blocked', colorClass: 'status-blocked' },
        special: { label: languageType === 'hi' ? 'विशेष बुकिंग' : 'Special Booking', colorClass: 'status-special' },
    };

    const content = {
        en: {
            sectionHeading: 'Check Availability',
            baratGharLabel: 'BaratGhar Name',
            selectHallPlaceholder: 'Select BaratGhar', // Added placeholder text
            monthLabel: 'Month',
            selectMonthPlaceholder: 'Select Month', // Added placeholder text
            yearLabel: 'Year',
            selectYearPlaceholder: 'Select Year', // Added placeholder text
            showAvailabilityButton: 'Show Availability',
            legendHeading: 'Booking Status Legend:',
            tableDateHeader: 'DATE',
            tableStatusHeader: 'BOOKING STATUS',
            noDataMessage: 'Please select BaratGhar, Month, and Year and click "Show Availability".',
            noAvailabilityFound: 'No specific availability data found for the selected criteria. Dates are assumed available unless otherwise marked.', // Modified message
            toggleCalendarView: 'Calendar View',
            toggleListView: 'List View',
            previousMonth: 'Previous Month',
            nextMonth: 'Next Month',
            loadingHallsMessage: 'Loading halls...',
            fetchingAvailabilityMessage: 'Fetching availability...',
            hallsErrorMessage: 'Failed to load halls.',
            availabilityErrorMessage: 'Failed to fetch availability data.',
        },
        hi: {
            sectionHeading: 'उपलब्धता जांचें',
            baratGharLabel: 'बारात घर का नाम',
            selectHallPlaceholder: 'बारात घर चुनें', // Added placeholder text
            monthLabel: 'महीना',
            selectMonthPlaceholder: 'महीना चुनें', // Added placeholder text
            yearLabel: 'वर्ष',
            selectYearPlaceholder: 'वर्ष चुनें', // Added placeholder text
            showAvailabilityButton: 'उपलब्धता दिखाएं',
            legendHeading: 'बुकिंग स्थिति लीजेंड:',
            tableDateHeader: 'दिनांक',
            tableStatusHeader: 'बुकिंग स्थिति',
            noDataMessage: 'कृपया बारात घर, महीना और वर्ष चुनें और "उपलब्धता दिखाएं" पर क्लिक करें।',
            noAvailabilityFound: 'चयनित मानदंडों के लिए कोई विशिष्ट उपलब्धता डेटा नहीं मिला। जब तक अन्यथा चिह्नित न किया जाए, तिथियां उपलब्ध मानी जाती हैं।', // Modified message
            toggleCalendarView: 'कैलेंडर दृश्य',
            toggleListView: 'सूची दृश्य',
            previousMonth: 'पिछला महीना',
            nextMonth: 'अगला महीना',
            loadingHallsMessage: 'बारात घर लोड हो रहे हैं...',
            fetchingAvailabilityMessage: 'उपलब्धता प्राप्त हो रही है...',
            hallsErrorMessage: 'बारात घर लोड करने में विफल।',
            availabilityErrorMessage: 'उपलब्धता डेटा प्राप्त करने में विफल।',
        },
    };

    const currentContent = content[languageType] || content.en;

    // Fetch the list of all halls when the component mounts
    useEffect(() => {
        const fetchAllHalls = async () => {
            setLoadingHalls(true);
            setHallsError(null);
            try {
                // GET /api/halls is a public route
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
    }, [API_BASE_URL, currentContent.hallsErrorMessage]); // Dependencies

    // Function to fetch availability data for a specific hall, year, and month
    const fetchAvailabilityData = async (hallId, year, month) => {
        setLoadingAvailability(true);
        setAvailabilityError(null);
        setAvailabilityDataForMonth(null); // Clear previous data

        try {
            // GET /api/halls/:id/availability?month=MM&year=YYYY
            const response = await fetch(`${API_BASE_URL}/halls/${hallId}/availability?month=${month}&year=${year}`);

            if (!response.ok) {
                 if (response.status === 404) {
                     // Hall not found or availability data not found for this month/year
                     // We will treat this as no specific bookings found, so all days are available by default
                     console.warn(`Availability data not found for hall ${hallId}, month ${month}, year ${year}. Assuming available.`);
                     setAvailabilityDataForMonth([]); // Set empty array to indicate no specific data
                     return []; // Return empty array to calling function
                 }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // The backend should return an array of availability objects for the month
            // e.g., [{ date: 'YYYY-MM-DD', status: 'booked' }, ...]
            // We need to convert the date strings to Date objects and extract the day
            const processedData = data.map(item => {
                 const itemDate = new Date(item.date);
                 return {
                     date: itemDate.getDate(), // Get the day of the month
                     status: item.status,
                 };
            });

            setAvailabilityDataForMonth(processedData);
            return processedData; // Return the data for use in calendar generation

        } catch (error) {
            console.error('Error fetching availability data:', error);
            setAvailabilityError(error.message || currentContent.availabilityErrorMessage);
            setAvailabilityDataForMonth([]); // Set empty array on error to show calendar with default available
            return []; // Return empty array on error
        } finally {
            setLoadingAvailability(false);
        }
    };


    // Handle the "Show Availability" button click
    const handleShowAvailability = () => {
        if (!selectedHallId || !selectedMonthValue || !selectedYearValue) {
            alert(languageType === 'hi' ? 'कृपया सभी फ़ील्ड चुनें।' : 'Please select all fields.');
            setAvailabilityDataForMonth(null); // Keep message visible if fields are missing
            return;
        }

        const monthInt = parseInt(selectedMonthValue);
        const yearInt = parseInt(selectedYearValue);

        setDisplayMonth(monthInt);
        setDisplayYear(yearInt);

        // Fetch data for the selected month and year
        fetchAvailabilityData(selectedHallId, yearInt, monthInt);

        setViewMode('calendar'); // Default to calendar view after showing availability
    };

    // Handle navigation to previous month
    const handlePreviousMonth = () => {
        if (!selectedHallId) return; // Cannot navigate if no hall is selected

        let newMonth = displayMonth - 1;
        let newYear = displayYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setDisplayMonth(newMonth);
        setDisplayYear(newYear);
        // Fetch data for the new month and year
        fetchAvailabilityData(selectedHallId, newYear, newMonth);
    };

    // Handle navigation to next month
    const handleNextMonth = () => {
        if (!selectedHallId) return; // Cannot navigate if no hall is selected

        let newMonth = displayMonth + 1;
        let newYear = displayYear;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        setDisplayMonth(newMonth);
        setDisplayYear(newYear);
        // Fetch data for the new month and year
        fetchAvailabilityData(selectedHallId, newYear, newMonth);
    };

    // Handle change for BaratGhar select dropdown
    const handleBaratGharChange = (event) => {
        setSelectedHallId(event.target.value);
        // Clear availability data when hall changes
        setAvailabilityDataForMonth(null);
        setAvailabilityError(null);
        setLoadingAvailability(false);
    };

    // Handle change for Month select dropdown
    const handleMonthChange = (event) => {
        setSelectedMonthValue(event.target.value);
        // Clear availability data when month changes
        setAvailabilityDataForMonth(null);
        setAvailabilityError(null);
        setLoadingAvailability(false);
    };

    // Handle change for Year select dropdown
    const handleYearChange = (event) => {
        setSelectedYearValue(event.target.value);
        // Clear availability data when year changes
        setAvailabilityDataForMonth(null);
        setAvailabilityError(null);
        setLoadingAvailability(false);
    };


    // Generates the array of days for the calendar grid
    const generateCalendarDays = (year, month, availabilityData = []) => {
        const date = new Date(year, month - 1, 1);
        const firstDayOfMonth = date.getDay(); // 0 for Sunday, 6 for Saturday
        const daysInMonth = new Date(year, month, 0).getDate();

        const calendarDays = [];

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push({ type: 'ca-empty-cell' });
        }

        // Create a map for quick lookup of availability status by day
        const availabilityMap = availabilityData.reduce((map, dayInfo) => {
            // Ensure dayInfo.date is treated as a number for the map key
            map[Number(dayInfo.date)] = dayInfo.status;
            return map;
        }, {});

        // Add day cells for the month
        for (let day = 1; day <= daysInMonth; day++) {
            // Default status is 'available' if no specific data is found for the day
            const status = availabilityMap[day] || 'available';
            calendarDays.push({ type: 'ca-day-cell', date: day, status: status });
        }

        // Add empty cells at the end to fill the last week row
        while (calendarDays.length % 7 !== 0) {
            calendarDays.push({ type: 'ca-empty-cell' });
        }

        return calendarDays;
    };

    // Helper to get localized status label and color class
    const getStatusInfo = (statusKey) => {
        return bookingStatuses[statusKey] || { label: statusKey, colorClass: '' };
    };

    // Determine if the data area should be shown (only after availability data is fetched)
    const showDataArea = availabilityDataForMonth !== null;


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
                                    <option value="">{currentContent.selectMonthPlaceholder}</option>
                                    {months.map((option) => (
                                        <option key={option.value} value={option.value}>
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
                                    <option value="">{currentContent.selectYearPlaceholder}</option>
                                    {years.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            className="ca-show-button"
                            onClick={handleShowAvailability}
                            disabled={loadingHalls || loadingAvailability} // Disable button while loading
                        >
                            {loadingAvailability ? currentContent.fetchingAvailabilityMessage : currentContent.showAvailabilityButton}
                        </button>
                    </div>

                    {/* Display messages based on state */}
                    {!selectedHallId && availabilityDataForMonth === null && !loadingHalls && !hallsError && (
                         <p className="ca-availability-message">{currentContent.noDataMessage}</p>
                    )}

                    {availabilityError && (
                         <p style={{ color: 'red' }}>{availabilityError}</p>
                    )}


                    {/* Availability Display Area (Calendar or List) */}
                    {showDataArea && !loadingAvailability && !availabilityError && (
                        <>
                            <div className="ca-availability-legend">
                                <h4>{currentContent.legendHeading}</h4>
                                <div className="ca-legend-items">
                                    {Object.keys(bookingStatuses).map(statusKey => {
                                        const statusInfo = bookingStatuses[statusKey];
                                        return (
                                            <div className="ca-legend-item" key={statusKey}>
                                                {/* Use unique class for each color box */}
                                                <span className={`ca-legend-color-box-${statusKey}`}></span>
                                                <span>{statusInfo.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

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

                            {viewMode === 'calendar' ? (
                                <div className="ca-availability-calendar">
                                    <div className="ca-calendar-header">
                                        <button className="ca-nav-button" onClick={handlePreviousMonth} aria-label={currentContent.previousMonth}>
                                            <ChevronLeft size={24} />
                                        </button>
                                        <h3>
                                            {months.find(m => m.value === displayMonth.toString().padStart(2, '0'))?.label} {displayYear}
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
                                <div className="ca-availability-table-container">
                                    <h4 className="ca-availability-table-month-year">
                                        {months.find(m => m.value === displayMonth.toString().padStart(2, '0'))?.label} {displayYear}
                                    </h4>
                                    <table className="ca-availability-table">
                                        <thead>
                                            <tr>
                                                <th>{currentContent.tableDateHeader}</th>
                                                <th>{currentContent.tableStatusHeader}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Map over availabilityDataForMonth to display in list view */}
                                            {availabilityDataForMonth && availabilityDataForMonth.length > 0 ? (
                                                 availabilityDataForMonth.map((day) => {
                                                     const statusInfo = getStatusInfo(day.status);
                                                     return (
                                                         <tr key={day.date} className={statusInfo.colorClass}>
                                                             <td>{day.date}</td>
                                                             <td>{statusInfo.label}</td>
                                                         </tr>
                                                     );
                                                 })
                                            ) : (
                                                 // If no specific data, show all days as available (optional, or just the no data message)
                                                 // This part might need adjustment based on desired UI for "no specific data"
                                                 <tr>
                                                     <td colSpan="2" style={{textAlign: 'center'}}>
                                                         {currentContent.noAvailabilityFound}
                                                     </td>
                                                 </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                             {/* Message when no specific availability data is found */}
                            {availabilityDataForMonth !== null && availabilityDataForMonth.length === 0 && !loadingAvailability && !availabilityError && (
                                <p className="ca-availability-message">{currentContent.noAvailabilityFound}</p>
                            )}
                        </>
                    )}

                </div>
            </div>
        </section>
    );
};

export default CheckAvailabilitySection;
