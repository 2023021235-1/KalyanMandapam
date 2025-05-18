import React, { useState, useEffect } from 'react';
import './styles/BookNow.css';
// No Lucide icons needed for this specific version

const BookNowSection = ({ languageType = 'en' }) => {
  // State to manage disclaimer acceptance
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  // State to manage showing the booking type modal
  const [showBookingTypeModal, setShowBookingTypeModal] = useState(false);
  // State for sample booking data (replace with actual data fetch)
  const [bookings, setBookings] = useState([
      // Sample booking data
      { id: 'BOOK101', baratGhar: 'BaratGhar Name 1', floor: 'Ground', function: 'Marriage', amount: 'Rs. 50,000', status: 'Confirmed', addOn: 'No', date: '2024-07-15' },
      { id: 'BOOK102', baratGhar: 'BaratGhar Name 2', floor: 'First', function: 'Engagement', amount: 'Rs. 30,000', status: 'Pending', addOn: 'Yes', date: '2024-08-20' },
      { id: 'BOOK103', baratGhar: 'BaratGhar Name 1', floor: 'Ground', function: 'Birthday Party', amount: 'Rs. 25,000', status: 'Cancelled', addOn: 'No', date: '2024-09-10' },
      // Add more sample bookings as needed
  ]);

  // Content for the section
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
      previousBookingsHeading: 'All Bookings', // Updated heading
      tableHeaders: ['S.No.', 'Booking Id', 'BaratGhar Name', 'Floor Name', 'Function', 'Total Amount', 'Status', 'Add-On AC/Heating', 'Booking Date', 'Action'], // Updated headers
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

  // Handler for agreeing to disclaimer
  const handleAgreeDisclaimer = () => {
    setDisclaimerAccepted(true);
    // Optionally save preference in local storage for persistence
    // localStorage.setItem('disclaimerAccepted', 'true');
  };

   // Handler for closing disclaimer without agreeing
   const handleCloseDisclaimer = () => {
        alert(languageType === 'hi' ? 'बुकिंग जारी रखने के लिए आपको अस्वीकरण स्वीकार करना होगा।' : 'You must accept the disclaimer to proceed with booking.');
   }

  // Handler for clicking "New Booking" button
  const handleNewBookingClick = () => {
    setShowBookingTypeModal(true); // Show the booking type modal
  };

  // Handler for closing the booking type modal
  const handleCloseBookingTypeModal = () => {
      setShowBookingTypeModal(false);
  };

  // Handler for deleting a booking
  const handleDeleteBooking = (bookingIdToDelete) => {
      if (window.confirm(currentContent.confirmDeleteMessage)) {
          setBookings(bookings.filter(booking => booking.id !== bookingIdToDelete));
      }
  };

  // Handler for proceeding after selecting booking type (placeholder)
  const handleProceedBookingType = () => {
      // In a real application, this would navigate to the next step of the booking form
      alert('Proceeding with booking type selection (placeholder)');
      setShowBookingTypeModal(false); // Close modal after proceeding
      // Implement navigation or next form step here
  };


  // Check local storage on component mount for disclaimer acceptance (optional persistence)
  // useEffect(() => {
  //   const accepted = localStorage.getItem('disclaimerAccepted');
  //   if (accepted === 'true') {
  //     setDisclaimerAccepted(true);
  //   }
  // }, []);

  return (
    <section className="bn-section"> {/* Main section container */}

      {/* Disclaimer Modal/Overlay */}
      {!disclaimerAccepted && (
        <div className="bn-disclaimer-overlay"> {/* Overlay background */}
          <div className="bn-disclaimer-modal"> {/* Modal content container */}
            <h3 className="bn-disclaimer-heading">{currentContent.disclaimerHeading}</h3>
            <div className="bn-disclaimer-content">
              {currentContent.disclaimerPoints.map((point, index) => (
                <p key={index}>{`(${index + 1}). ${point}`}</p>
              ))}
            </div>
            <div className="bn-disclaimer-buttons"> {/* Button container */}
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

      {/* Main Booking Content (after disclaimer is accepted) */}
      {disclaimerAccepted && (
        <div className="bn-main-content-block"> {/* White card wrapper for main content */}

             {/* Header area with heading and New Booking button */}
            <div className="bn-main-header"> {/* Container for heading and button */}
                 <h2 className="bn-section-heading">{currentContent.sectionHeading}</h2> {/* Section Heading */}
                 <button className="bn-button bn-new-booking-button" onClick={handleNewBookingClick}>
                     {currentContent.newBookingButton}
                 </button>
            </div>


             {/* Bookings List Area */}
             <div className="bn-bookings-list-area"> {/* Container for the bookings table */}
                 <h4>{currentContent.previousBookingsHeading}</h4> {/* Heading for the list */}

                 {bookings.length === 0 ? (
                     <p className="bn-message">{currentContent.noBookingsMessage}</p> /* Message if no bookings */
                 ) : (
                      <div className="bn-table-container"> {/* Wrapper for horizontal scrolling */}
                         <table className="bn-bookings-table"> {/* Table to display bookings */}
                             <thead>
                                 <tr>
                                     {currentContent.tableHeaders.map((header, index) => (
                                         <th key={index}>{header}</th>
                                     ))}
                                 </tr>
                             </thead>
                             <tbody>
                                 {bookings.map((booking, index) => (
                                     <tr key={booking.id}> {/* Table row for each booking */}
                                         <td>{index + 1}</td>
                                         <td>{booking.id}</td>
                                         <td>{booking.baratGhar}</td>
                                         <td>{booking.floor}</td>
                                         <td>{booking.function}</td>
                                         <td>{booking.amount}</td>
                                         <td>{booking.status}</td>
                                         <td>{booking.addOn}</td>
                                          <td>{booking.date}</td> {/* Display booking date */}
                                         <td>
                                             {/* Delete button/link */}
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
             </div> {/* End bn-bookings-list-area */}

        </div> 
      )}

      {/* Booking Type Selection Modal */}
      {showBookingTypeModal && (
          <div className="bn-modal-overlay"> {/* Overlay for the modal */}
            <div className="bn-modal-content"> {/* Modal content */}
                 <div className="bn-modal-header"> {/* Modal header */}
                     <h3>{currentContent.bookingTypeHeading}</h3>
                     <button className="bn-modal-close-button" onClick={handleCloseBookingTypeModal} aria-label={currentContent.closeModalButton}>
                         &times; {/* Close icon */}
                     </button>
                 </div>
                 <div className="bn-modal-body"> {/* Modal body */}
                    <div className="bn-booking-type-radios"> {/* Radio options */}
                        {currentContent.bookingTypeOptions.map((option) => (
                            <div className="bn-radio-group" key={option.value}>
                                <input
                                    type="radio"
                                    id={`booking-type-${option.value}`}
                                    name="bookingType"
                                    value={option.value}
                                    // Add state and onChange handler here to track selected type
                                />
                                <label htmlFor={`booking-type-${option.value}`}>{option.label}</label>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="bn-modal-footer"> {/* Modal footer */}
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