// CheckAvailabilitySection.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import './styles/CheckAvailability.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';

const CheckAvailabilitySection = ({ languageType = 'en' }) => {
    // State to store the list of available halls fetched from the API
    const [availableHalls, setAvailableHalls] = useState([]);
    const [loadingHalls, setLoadingHalls] = useState(true);
    const [hallsError, setHallsError] = useState(null);

    // State for the selected hall, month, and year from dropdowns
    const [selectedHallId, setSelectedHallId] = useState('');
    const [selectedMonthValue, setSelectedMonthValue] = useState('');
    const [selectedYearValue, setSelectedYearValue] = useState('');

    // State for the currently displayed month and year in the calendar/list
    // Initialize with selected values if available, otherwise current date
    const [displayMonth, setDisplayMonth] = useState(parseInt(selectedMonthValue, 10) || new Date().getMonth() + 1);
    const [displayYear, setDisplayYear] = useState(parseInt(selectedYearValue, 10) || new Date().getFullYear());


    // State for availability data fetched for the displayed month/year
    const [availabilityDataForMonth, setAvailabilityDataForMonth] = useState(null);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState(null);


    const [viewMode, setViewMode] = useState('calendar');

    // Base URL for API calls - Consider moving this to a config file or environment variable
    const API_BASE_URL = 'https://kalyanmandapam.onrender.com/api';

    const months = [
        { value: '', label: languageType === 'hi' ? 'महीना चुनें' : 'Select Month' }, // Added placeholder
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
        { value: '', label: languageType === 'hi' ? 'वर्ष चुनें' : 'Select Year' }, // Added placeholder
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
            // Removed showAvailabilityButton text
            legendHeading: 'Booking Status Legend:',
            tableDateHeader: 'DATE', // Keep for potential future use or alternative list views
            tableStatusHeader: 'BOOKING STATUS', // Keep for potential future use or alternative list views
            noDataMessage: 'Please select BaratGhar, Month, and Year.', // Updated message
            noAvailabilityFound: 'No specific availability data found for the selected criteria. Dates are assumed available unless otherwise marked.',
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
            selectHallPlaceholder: 'बारात घर चुनें',
            monthLabel: 'महीना',
            selectMonthPlaceholder: 'महीना चुनें',
            yearLabel: 'वर्ष',
            selectYearPlaceholder: 'वर्ष चुनें',
            // Removed showAvailabilityButton text
            legendHeading: 'बुकिंग स्थिति लीजेंड:',
            tableDateHeader: 'दिनांक', // Keep for potential future use or alternative list views
            tableStatusHeader: 'बुकिंग स्थिति', // Keep for potential future use or alternative list views
            noDataMessage: 'कृपया बारात घर, महीना और वर्ष चुनें।', // Updated message
            noAvailabilityFound: 'चयनित मानदंडों के लिए कोई विशिष्ट उपलब्धता डेटा नहीं मिला। जब तक अन्यथा चिह्नित न किया जाए, तिथियां उपलब्ध मानी जाती हैं।',
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
             // Don't fetch if inputs are not complete
            setAvailabilityDataForMonth(null);
            setAvailabilityError(null);
            setLoadingAvailability(false);
            return;
        }

        setLoadingAvailability(true);
        setAvailabilityError(null);
        setAvailabilityDataForMonth(null); // Clear previous data

        try {
            const response = await fetch(`${API_BASE_URL}/halls/${hallId}/availability?month=${month}&year=${year}`);

            if (!response.ok) {
                 if (response.status === 404) {
                     console.warn(`Availability data not found for hall ${hallId}, month ${month}, year ${year}. Assuming available.`);
                     // If no specific data, generate all days as available
                     const daysInMonth = new Date(year, month, 0).getDate();
                     const availableDays = Array.from({ length: daysInMonth }, (_, i) => ({ date: i + 1, status: 'available' }));
                     setAvailabilityDataForMonth(availableDays);
                     return availableDays;
                 }
                 throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            // Access the nested 'availability' object from the response
            const availabilityData = responseData.availability;

            // Process the availability data object into a flat array for calendar/list
            const processedData = [];
            const daysInMonth = new Date(year, month, 0).getDate();

            // Create a map for quick lookup of availability status by day from fetched data
             const fetchedAvailabilityMap = Object.keys(availabilityData).reduce((map, dateString) => {
                const date = new Date(dateString);
                const day = date.getDate();
                const floorAvailabilities = availabilityData[dateString];

                let overallStatus = 'available'; // Default to available from fetched data if date exists

                if (floorAvailabilities && floorAvailabilities.length > 0) {
                    // Prioritize blocked > booked > preliminary > special
                    if (floorAvailabilities.some(floor => floor.status === 'blocked')) {
                         overallStatus = 'blocked';
                    } else if (floorAvailabilities.some(floor => floor.status === 'booked')) {
                        overallStatus = 'booked';
                    } else if (floorAvailabilities.some(floor => floor.status === 'preliminary')) {
                        overallStatus = 'preliminary';
                    } else if (floorAvailabilities.some(floor => floor.status === 'special')) {
                         overallStatus = 'special';
                    }
                     // If none of the above, it remains 'available' based on fetched data presence
                }
                 map[day] = overallStatus;
                 return map;
            }, {});


            // Generate data for all days of the month, defaulting to 'available'
            for (let day = 1; day <= daysInMonth; day++) {
                 // Use status from fetched data if available, otherwise default to 'available'
                 const status = fetchedAvailabilityMap[day] || 'available';
                 processedData.push({ date: day, status: status });
            }

            setAvailabilityDataForMonth(processedData);
            return processedData; // Return the processed data

        } catch (error) {
            console.error('Error fetching availability data:', error);
            setAvailabilityError(error.message || currentContent.availabilityErrorMessage);
            setAvailabilityDataForMonth([]); // Set empty array or handle as needed on error
            return [];
        } finally {
            setLoadingAvailability(false);
        }
    }, [API_BASE_URL, currentContent.availabilityErrorMessage]); // Added dependencies

    // Effect to fetch data automatically when dropdown selections are complete and change
    useEffect(() => {
        if (selectedHallId && selectedMonthValue && selectedYearValue) {
            const monthInt = parseInt(selectedMonthValue, 10);
            const yearInt = parseInt(selectedYearValue, 10);
            setDisplayMonth(monthInt);
            setDisplayYear(yearInt);
            fetchAvailabilityData(selectedHallId, yearInt, monthInt);
        } else {
            // Clear data and messages if selections are incomplete
            setAvailabilityDataForMonth(null);
            setAvailabilityError(null);
            setLoadingAvailability(false);
             // Optionally reset display month/year if you want it blank when no selection
            // setDisplayMonth(parseInt(new Date().getMonth() + 1, 10)); // Or a default value
            // setDisplayYear(parseInt(new Date().getFullYear(), 10)); // Or a default value
        }
    }, [selectedHallId, selectedMonthValue, selectedYearValue, fetchAvailabilityData]); // Depend on selected values and the memoized fetch function


    // Handle navigation to previous month
    const handlePreviousMonth = () => {
         // Navigation is now tied to displayed month/year, but also needs selected hall
        if (!selectedHallId) return; // Cannot navigate if no hall is selected

        let newMonth = displayMonth - 1;
        let newYear = displayYear;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        setDisplayMonth(newMonth);
        setDisplayYear(newYear);
        // Fetch data for the new month and year for the selected hall
        fetchAvailabilityData(selectedHallId, newYear, newMonth); // Fetch data for the new month
    };

    // Handle navigation to next month
    const handleNextMonth = () => {
         // Navigation is now tied to displayed month/year, but also needs selected hall
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
        fetchAvailabilityData(selectedHallId, newYear, newMonth); // Fetch data for the new month
    };

    // Handle change for BaratGhar select dropdown
    const handleBaratGharChange = (event) => {
        setSelectedHallId(event.target.value);
        // The useEffect will handle fetching if all three are selected
    };

    // Handle change for Month select dropdown
    const handleMonthChange = (event) => {
        setSelectedMonthValue(event.target.value);
        // The useEffect will handle fetching if all three are selected
    };

    // Handle change for Year select dropdown
    const handleYearChange = (event) => {
        setSelectedYearValue(event.target.value);
        // The useEffect will handle fetching if all three are selected
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
        // Return default status info if key is not found
        return bookingStatuses[statusKey] || { label: statusKey, colorClass: '' };
    };

     // Determine if the data area should be shown
    const showDataArea = selectedHallId && selectedMonthValue && selectedYearValue && availabilityDataForMonth !== null;


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

                         {/* Removed the Show Availability Button */}
                    </div>

                     {/* Display initial message if selections are not complete */}
                     {!showDataArea && !loadingHalls && !hallsError && !loadingAvailability && !availabilityError && (
                            <p className="ca-availability-message">{currentContent.noDataMessage}</p>
                    )}

                    {/* Display loading or error messages */}
                    {loadingAvailability && <p className="ca-availability-message">{currentContent.fetchingAvailabilityMessage}</p>}
                    {availabilityError && <p style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>{availabilityError}</p>}


                    {/* Availability Display Area (Calendar or List) */}
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
                                        <button className="ca-nav-button" onClick={handlePreviousMonth} aria-label={currentContent.previousMonth}>
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
                                // List View with Two Columns and Navigation
                                <div className="ca-availability-list"> {/* New container for list view */}
                                     <div className="ca-calendar-header"> {/* Reusing calendar header styles for list nav */}
                                        <button className="ca-nav-button" onClick={handlePreviousMonth} aria-label={currentContent.previousMonth}>
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
                                        <div className="ca-list-columns"> {/* Container for the two columns */}
                                            <div className="ca-list-column"> {/* Left column */}
                                                {availabilityDataForMonth.slice(0, 15).map((day) => {
                                                    const statusInfo = getStatusInfo(day.status);
                                                    // Create a div for each day with status class
                                                    return (
                                                        <div key={`list-day-left-${day.date}`} className={`ca-list-item ${statusInfo.colorClass}`}>
                                                            <span className="ca-list-date">{day.date}</span>
                                                            <span className="ca-list-status">{statusInfo.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="ca-list-column"> {/* Right column */}
                                                {availabilityDataForMonth.slice(15).map((day) => {
                                                     const statusInfo = getStatusInfo(day.status);
                                                    // Create a div for each day with status class
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
                                         // Message when no specific data, displayed in the list area
                                         <p className="ca-availability-message" style={{textAlign: 'center', width: '100%'}}>
                                             {currentContent.noAvailabilityFound}
                                         </p>
                                    )}
                                </div>
                            )}
                            {/* Removed the no data found message outside the conditional render as it's handled by showDataArea */}
                        </>
                    )}

                </div>
            </div>
        </section>
    );
};

export default CheckAvailabilitySection;