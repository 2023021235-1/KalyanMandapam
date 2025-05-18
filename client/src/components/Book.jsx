import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/BookNow.css'; // Assuming this is the style file for Book.jsx

const BookNowSection = ({ languageType = 'en', user }) => {
  // --- All Hooks must be called at the top level ---
  const navigate = useNavigate();

  // State hooks are now before any conditional returns
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [showBookingTypeModal, setShowBookingTypeModal] = useState(false);
  const [bookings, setBookings] = useState([
    { id: 'BOOK101', baratGhar: 'BaratGhar Name 1', floor: 'Ground', function: 'Marriage', amount: 'Rs. 50,000', status: 'Confirmed', addOn: 'No', date: '2024-07-15' },
    { id: 'BOOK102', baratGhar: 'BaratGhar Name 2', floor: 'First', function: 'Engagement', amount: 'Rs. 30,000', status: 'Pending', addOn: 'Yes', date: '2024-08-20' },
    { id: 'BOOK103', baratGhar: 'BaratGhar Name 1', floor: 'Ground', function: 'Birthday Party', amount: 'Rs. 25,000', status: 'Cancelled', addOn: 'No', date: '2024-09-10' },
  ]);

  // useEffect for redirection
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]); // Dependencies: user and navigate

  // --- Conditional return (Guard Clause) is now AFTER all Hook calls ---
  if (!user) {
    // If user is not logged in, the useEffect above will handle the redirection.
    // Returning null here prevents rendering the rest of the component.
    return null; // Or a loading spinner, e.g., <div>Redirecting to login...</div>
  }

  // --- Component logic and JSX (only runs if user is logged in) ---
  const content = {
    en: {
      sectionHeading: 'Book BaratGhar',
      disclaimerHeading: 'Disclaimer',
      disclaimerPoints: [
        'Before going to book the Barat Ghar please read all the terms & Conditions carefully.',
        'Beneficiary users/citizens are requested to provide the correct information at the time of booking of Barat Ghar, if found any wrong credential or data, booking has been cancelled and penalties will be imposed on immediate as per clause mentioned in the terms & Conditions.',
        'For any technical assistance or any other assistance, please mail us on it@ndmc.gov.in / director.welfare@ndmc.gov.in or contact to Helpdesk of Welfare Department at Ground Floor, New Delhi Municipal Council, Palika Kendra, New Delhi- 110001.',
        'Under Swachh Bharat Mission, the single use of plastic are being ban. To strictly adhere the guidelines of the Swachh Bharat Mission.',
        'The party make own arrangement for valet parking during their function/program, failing which they will be liable amount of Rs. 5000/- to be recovered from the security deposit, as penalty for violation of the said condition.',
        'Further the concern Deputy Manager (CS) of Barat Ghar have been directed to ensure valet parking at the time of handing over the Barat Ghar to the party and in case the arrangement is not made by the Parking Management System Department for providing the valet parking.',
        'Booking is neither transferable nor changeable.',
      ],
      disclaimerAgreeButton: 'Agree',
      disclaimerCloseButton: 'Close',
      newBookingButton: 'New Booking',
      previousBookingsHeading: 'All Bookings',
      tableHeaders: ['S.No.', 'Booking Id', 'BaratGhar Name', 'Floor Name', 'Function', 'Total Amount', 'Status', 'Add-On AC/Heating', 'Booking Date', 'Action'],
      deleteButton: 'Delete',
      noBookingsMessage: 'No bookings found.',
      bookingTypeHeading: 'Select Booking Type:',
      bookingTypeOptions: [
          { value: 'employee', label: 'Employee of NDMC' },
          { value: 'ex-employee', label: 'Ex-Employee of NDMC' },
          { value: 'ndmc-resident', label: 'NDMC Area Resident' },
          { value: 'non-ndmc-resident', label: 'Non NDMC Area Resident' },
      ],
      proceedButton: 'Proceed',
      closeModalButton: 'Close',
      confirmDeleteMessage: 'Are you sure you want to delete this booking?',
    },
    hi: {
      sectionHeading: 'बारात घर बुक करें',
      disclaimerHeading: 'अस्वीकरण',
      disclaimerPoints: [
        'बारात घर बुक करने से पहले कृपया सभी नियम और शर्तें ध्यान से पढ़ लें।',
        'लाभार्थी उपयोगकर्ताओं/नागरिकों से अनुरोध है कि वे बारात घर की बुकिंग के समय सही जानकारी प्रदान करें, यदि कोई गलत क्रेडेंशियल या डेटा पाया जाता है, तो बुकिंग रद्द कर दी जाएगी और नियम और शर्तों में उल्लिखित खंड के अनुसार तत्काल जुर्माना लगाया जाएगा।',
        'किसी भी तकनीकी सहायता या किसी अन्य सहायता के लिए, कृपया हमें it@ndmc.gov.in / director.welfare@ndmc.gov.in पर मेल करें या भूतल, नई दिल्ली नगरपालिका परिषद, पालिका केंद्र, नई दिल्ली- 110001 पर कल्याण विभाग के हेल्पडेस्क से संपर्क करें।',
        'स्वच्छ भारत मिशन के तहत सिंगल यूज प्लास्टिक पर प्रतिबंध लगाया जा रहा है। स्वच्छ भारत मिशन के दिशानिर्देशों का सख्ती से पालन करें।',
        'पार्टी अपने कार्यक्रम के दौरान वैले पार्किंग की व्यवस्था स्वयं करेगी, ऐसा न करने पर सुरक्षा जमा राशि से 5000/- रुपये की राशि वसूल की जाएगी, जो उक्त शर्त के उल्लंघन के लिए जुर्माना होगा।',
        'आगे संबंधित उपायुक्त (सीएस) बारात घर को बारात घर पार्टी को सौंपते समय वैले पार्किंग सुनिश्चित करने का निर्देश दिया गया है और यदि पार्किंग प्रबंधन प्रणाली विभाग द्वारा वैले पार्किंग की व्यवस्था नहीं की जाती है।',
        'बुकिंग न तो हस्तांतरणीय है और न ही परिवर्तन योग्य है।',
      ],
      disclaimerAgreeButton: 'सहमत',
      disclaimerCloseButton: 'बंद करें',
      newBookingButton: 'नई बुकिंग',
      previousBookingsHeading: 'सभी बुकिंग',
      tableHeaders: ['क्र.सं.', 'बुकिंग आईडी', 'बारात घर का नाम', 'मंजिल का नाम', 'समारोह', 'कुल राशि', 'स्थिति', 'ऐड-ऑन एसी/हीटिंग', 'बुकिंग तिथि', 'कार्रवाई'],
      deleteButton: 'हटाएँ',
      noBookingsMessage: 'कोई बुकिंग नहीं मिली।',
      bookingTypeHeading: 'बुकिंग प्रकार चुनें:',
        bookingTypeOptions: [
          { value: 'employee', label: 'एनडीएमसी का कर्मचारी' },
          { value: 'ex-employee', label: 'एनडीएमसी का पूर्व कर्मचारी' },
          { value: 'ndmc-resident', label: 'एनडीएमसी क्षेत्र निवासी' },
          { value: 'non-ndmc-resident', label: 'गैर एनडीएमसी क्षेत्र निवासी' },
      ],
      proceedButton: 'आगे बढ़ें',
      closeModalButton: 'बंद करें',
      confirmDeleteMessage: 'क्या आप वाकई इस बुकिंग को हटाना चाहते हैं?',
    },
  };

  const currentContent = content[languageType] || content.en;

  const handleAgreeDisclaimer = () => {
    setDisclaimerAccepted(true);
  };

  const handleCloseDisclaimer = () => {
    alert(languageType === 'hi' ? 'बुकिंग जारी रखने के लिए आपको अस्वीकरण स्वीकार करना होगा।' : 'You must accept the disclaimer to proceed with booking.');
  };

  const handleNewBookingClick = () => {
    setShowBookingTypeModal(true);
  };

  const handleCloseBookingTypeModal = () => {
    setShowBookingTypeModal(false);
  };

  const handleDeleteBooking = (bookingIdToDelete) => {
    if (window.confirm(currentContent.confirmDeleteMessage)) {
        setBookings(bookings.filter(booking => booking.id !== bookingIdToDelete));
    }
  };

  const handleProceedBookingType = () => {
    alert('Proceeding with booking type selection (placeholder)');
    setShowBookingTypeModal(false);
  };

  return (
    <section className="bn-section">

      {!disclaimerAccepted && (
        <div className="bn-disclaimer-overlay">
          <div className="bn-disclaimer-modal">
            <h3 className="bn-disclaimer-heading">{currentContent.disclaimerHeading}</h3>
            <div className="bn-disclaimer-content">
              {currentContent.disclaimerPoints.map((point, index) => (
                <p key={index}>{`(${index + 1}). ${point}`}</p>
              ))}
            </div>
            <div className="bn-disclaimer-buttons">
              <button className="bn-button bn-agree-button" onClick={handleAgreeDisclaimer}>
                {currentContent.disclaimerAgreeButton}
              </button>
              <button className="bn-button bn-close-button" onClick={handleCloseDisclaimer}>
                {currentContent.disclaimerCloseButton}
              </button>
            </div>
          </div>
        </div>
      )}

      {disclaimerAccepted && (
        <div className="bn-main-content-block">
            <div className="bn-main-header">
                <h2 className="bn-section-heading">{currentContent.sectionHeading}</h2>
                <button className="bn-button bn-new-booking-button" onClick={handleNewBookingClick}>
                    {currentContent.newBookingButton}
                </button>
            </div>

            <div className="bn-bookings-list-area">
                <h4>{currentContent.previousBookingsHeading}</h4>
                {bookings.length === 0 ? (
                    <p className="bn-message">{currentContent.noBookingsMessage}</p>
                ) : (
                    <div className="bn-table-container">
                        <table className="bn-bookings-table">
                            <thead>
                                <tr>
                                    {currentContent.tableHeaders.map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((booking, index) => (
                                    <tr key={booking.id}>
                                        <td>{index + 1}</td>
                                        <td>{booking.id}</td>
                                        <td>{booking.baratGhar}</td>
                                        <td>{booking.floor}</td>
                                        <td>{booking.function}</td>
                                        <td>{booking.amount}</td>
                                        <td>{booking.status}</td>
                                        <td>{booking.addOn}</td>
                                        <td>{booking.date}</td>
                                        <td>
                                            <button
                                                className="bn-delete-button"
                                                onClick={() => handleDeleteBooking(booking.id)}
                                                aria-label={`Delete booking ${booking.id}`}
                                            >
                                                {currentContent.deleteButton}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
      )}

      {showBookingTypeModal && (
          <div className="bn-modal-overlay">
            <div className="bn-modal-content">
                <div className="bn-modal-header">
                    <h3>{currentContent.bookingTypeHeading}</h3>
                    <button className="bn-modal-close-button" onClick={handleCloseBookingTypeModal} aria-label={currentContent.closeModalButton}>
                        &times;
                    </button>
                </div>
                <div className="bn-modal-body">
                  <div className="bn-booking-type-radios">
                      {currentContent.bookingTypeOptions.map((option) => (
                          <div className="bn-radio-group" key={option.value}>
                              <input
                                  type="radio"
                                  id={`booking-type-${option.value}`}
                                  name="bookingType"
                                  value={option.value}
                              />
                              <label htmlFor={`booking-type-${option.value}`}>{option.label}</label>
                          </div>
                      ))}
                  </div>
                </div>
                <div className="bn-modal-footer">
                    <button className="bn-button bn-proceed-button" onClick={handleProceedBookingType}>
                        {currentContent.proceedButton}
                    </button>
                </div>
            </div>
          </div>
      )}
    </section>
  );
};

export default BookNowSection;