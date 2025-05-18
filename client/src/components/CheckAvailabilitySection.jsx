import React, { useState, useEffect } from 'react';
import './styles/CheckAvailability.css';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';

const CheckAvailabilitySection = ({ languageType = 'en' }) => {
  const baratGharNames = [
    { value: '', label: languageType === 'hi' ? 'बारात घर चुनें' : 'Select BaratGhar' },
    { value: 'baratghar1', label: languageType === 'hi' ? 'बारात घर नंबर १' : 'BaratGhar Name 1' },
    { value: 'baratghar2', label: languageType === 'hi' ? 'बारात घर नंबर २' : 'BaratGhar Name 2' },
    { value: 'baratghar3', label: languageType === 'hi' ? 'बारात घर नंबर ३' : 'BaratGhar Name 3' },
  ];

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
     { value: currentYear, label: currentYear.toString() },
     { value: currentYear + 1, label: (currentYear + 1).toString() },
     { value: currentYear + 2, label: (currentYear + 2).toString() },
  ];

  const sampleAvailabilityData = {
      baratghar1: {
          [currentYear]: {
              6: [
                  { date: 3, status: 'booked' },
                  { date: 5, status: 'preliminary' },
                  { date: 8, status: 'blocked' },
                  { date: 11, status: 'booked' },
                  { date: 15, status: 'special' },
                  { date: 18, status: 'booked' },
                  { date: 23, status: 'preliminary' },
                  { date: 26, status: 'blocked' },
                  { date: 29, status: 'booked' },
              ],
               7: [
                   { date: 3, status: 'booked' },
                   { date: 7, status: 'booked' },
                   { date: 12, status: 'booked' },
                   { date: 17, status: 'booked' },
                   { date: 22, status: 'booked' },
                   { date: 27, status: 'booked' },
                   { date: 31, status: 'booked' },
               ]
          },
          [currentYear + 1]: {
              1: [ ],
          }
      },
       baratghar2: {
          [currentYear]: {
              6: [ ],
               7: [ ],
          }
       },
        baratghar3: {
          [currentYear]: {
              6: [ ],
               7: [ ],
          }
       },
  };

  const bookingStatuses = {
      available: { label: languageType === 'hi' ? 'उपलब्ध' : 'Available', colorClass: 'status-available' },
      preliminary: { label: languageType === 'hi' ? 'प्रारंभिक रूप से बुक किया गया' : 'Preliminary Booked', colorClass: 'status-preliminary' },
      booked: { label: languageType === 'hi' ? 'बुक किया गया' : 'Booked', colorClass: 'status-booked' },
      blocked: { label: languageType === 'hi' ? 'अवरोधित' : 'Blocked', colorClass: 'status-blocked' },
      special: { label: languageType === 'hi' ? 'विशेष बुकिंग' : 'Special Booking', colorClass: 'status-special' },
  };

  const [selectedBaratGhar, setSelectedBaratGhar] = useState('');
  const [selectedMonthValue, setSelectedMonthValue] = useState('');
  const [selectedYearValue, setSelectedYearValue] = useState('');

  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear());

  const [availabilityDataForMonth, setAvailabilityDataForMonth] = useState(null);

  const [viewMode, setViewMode] = useState('calendar');

  const content = {
    en: {
      sectionHeading: 'Check Availability',
      baratGharLabel: 'BaratGhar Name',
      monthLabel: 'Month',
      yearLabel: 'Year',
      showAvailabilityButton: 'Show Availability',
      legendHeading: 'Booking Status Legend:',
      tableDateHeader: 'DATE',
      tableStatusHeader: 'BOOKING STATUS',
      noDataMessage: 'Please select BaratGhar, Month, and Year and click "Show Availability".',
      noAvailabilityFound: 'No availability data found for the selected criteria.',
      toggleCalendarView: 'Calendar View',
      toggleListView: 'List View',
      previousMonth: 'Previous Month',
      nextMonth: 'Next Month',
    },
    hi: {
      sectionHeading: 'उपलब्धता जांचें',
      baratGharLabel: 'बारात घर का नाम',
      monthLabel: 'महीना',
      yearLabel: 'वर्ष',
      showAvailabilityButton: 'उपलब्धता दिखाएं',
      legendHeading: 'बुकिंग स्थिति लीजेंड:',
      tableDateHeader: 'दिनांक',
      tableStatusHeader: 'बुकिंग स्थिति',
      noDataMessage: 'कृपया बारात घर, महीना और वर्ष चुनें और "उपलब्धता दिखाएं" पर क्लिक करें।',
      noAvailabilityFound: 'चयनित मानदंडों के लिए कोई उपलब्धता डेटा नहीं मिला।',
      toggleCalendarView: 'कैलेंडर दृश्य',
      toggleListView: 'सूची दृश्य',
      previousMonth: 'पिछला महीना',
      nextMonth: 'अगला महीना',
    },
  };

  const currentContent = content[languageType] || content.en;

  const handleBaratGharChange = (event) => {
    setSelectedBaratGhar(event.target.value);
    setAvailabilityDataForMonth(null);
  };

  const handleMonthChange = (event) => {
    setSelectedMonthValue(event.target.value);
     setAvailabilityDataForMonth(null);
  };

  const handleYearChange = (event) => {
    setSelectedYearValue(parseInt(event.target.value));
     setAvailabilityDataForMonth(null);
  };

  const handleShowAvailability = () => {
    if (!selectedBaratGhar || !selectedMonthValue || !selectedYearValue) {
      alert(languageType === 'hi' ? 'कृपया सभी फ़ील्ड चुनें।' : 'Please select all fields.');
      setAvailabilityDataForMonth(null);
      return;
    }

    setDisplayMonth(parseInt(selectedMonthValue));
    setDisplayYear(selectedYearValue);

    fetchAvailabilityData(selectedBaratGhar, selectedYearValue, parseInt(selectedMonthValue));

    setViewMode('calendar');
  };

  const fetchAvailabilityData = (baratGhar, year, month) => {
       const data = sampleAvailabilityData?.[baratGhar]?.[year]?.[month] || [];

       const availabilityMap = data.reduce((map, dayInfo) => {
           map[dayInfo.date] = dayInfo.status;
           return map;
       }, {});

       const daysInMonth = new Date(year, month, 0).getDate();
       const fullMonthData = [];
       for (let day = 1; day <= daysInMonth; day++) {
           const status = availabilityMap[day] || 'available';
           fullMonthData.push({ date: day, status: status });
       }

       setAvailabilityDataForMonth(fullMonthData);
  };

  const handlePreviousMonth = () => {
      if (!selectedBaratGhar) return;

      let newMonth = displayMonth - 1;
      let newYear = displayYear;
      if (newMonth < 1) {
          newMonth = 12;
          newYear--;
      }
      setDisplayMonth(newMonth);
      setDisplayYear(newYear);
      fetchAvailabilityData(selectedBaratGhar, newYear, newMonth);
  };

  const handleNextMonth = () => {
       if (!selectedBaratGhar) return;

       let newMonth = displayMonth + 1;
       let newYear = displayYear;
       if (newMonth > 12) {
           newMonth = 1;
           newYear++;
       }
       setDisplayMonth(newMonth);
       setDisplayYear(newYear);
       fetchAvailabilityData(selectedBaratGhar, newYear, newMonth);
  };

  const generateCalendarDays = (year, month, availabilityData = []) => {
      const date = new Date(year, month - 1, 1);
      const firstDayOfMonth = date.getDay();
      const daysInMonth = new Date(year, month, 0).getDate();

      const calendarDays = [];

      for (let i = 0; i < firstDayOfMonth; i++) {
          calendarDays.push({ type: 'ca-empty-cell' });
      }

      const availabilityMap = availabilityData.reduce((map, dayInfo) => {
          map[dayInfo.date] = dayInfo.status;
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

    const getStatusInfo = (statusKey) => {
        return bookingStatuses[statusKey] || { label: statusKey, colorClass: '' };
    };

    const showDataArea = availabilityDataForMonth !== null && availabilityDataForMonth.length > 0;
    const noAvailabilityFound = availabilityDataForMonth !== null && availabilityDataForMonth.length === 0;


  return (
    <section className="ca-section">
      <div className="ca-container">
        <h2 className="ca-section-heading">{currentContent.sectionHeading}</h2>

        <div className="ca-main-content-block">

            <div className="ca-controls">
                <div className="ca-dropdowns-inline">
                    <div className="ca-form-group">
                        <label htmlFor="ca-baratghar-select">{currentContent.baratGharLabel}</label>
                        <select
                            id="ca-baratghar-select"
                            value={selectedBaratGhar}
                            onChange={handleBaratGharChange}
                            required
                             className="ca-select"
                        >
                            <option value="">{languageType === 'hi' ? 'बारात घर चुनें' : 'Select BaratGhar'}</option>
                            {baratGharNames.slice(1).map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
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
                            <option value="">{languageType === 'hi' ? 'महीना चुनें' : 'Select Month'}</option>
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
                           <option value="">{languageType === 'hi' ? 'वर्ष चुनें' : 'Select Year'}</option>
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
                >
                    {currentContent.showAvailabilityButton}
                </button>
            </div>

            {availabilityDataForMonth === null && (
                 <p className="ca-availability-message">{currentContent.noDataMessage}</p>
            )}

             {availabilityDataForMonth !== null && availabilityDataForMonth.length === 0 && (
                  <p className="ca-availability-message">{currentContent.noAvailabilityFound}</p>
             )}

            {showDataArea && (
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
                            <CalendarIcon size={18} style={{marginRight: '5px'}}/> {currentContent.toggleCalendarView}
                        </button>
                         <button
                            className={`ca-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                             aria-label={currentContent.toggleListView}
                        >
                            <List size={18} style={{marginRight: '5px'}}/> {currentContent.toggleListView}
                        </button>
                    </div>

                    {viewMode === 'calendar' ? (
                        <div className="ca-availability-calendar">
                            <div className="ca-calendar-header">
                                 <button className="ca-nav-button" onClick={handlePreviousMonth} aria-label={currentContent.previousMonth}>
                                    <ChevronLeft size={24}/>
                                </button>
                                <h3>
                                    {months.find(m => m.value === displayMonth.toString().padStart(2, '0'))?.label} {displayYear}
                                </h3>
                                <button className="ca-nav-button" onClick={handleNextMonth} aria-label={currentContent.nextMonth}>
                                    <ChevronRight size={24}/>
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
                                    {availabilityDataForMonth && availabilityDataForMonth.map((day) => {
                                        const statusInfo = getStatusInfo(day.status);
                                        return (
                                            <tr key={day.date} className={statusInfo.colorClass}>
                                                <td>{day.date}</td>
                                            <td>{statusInfo.label}</td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
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