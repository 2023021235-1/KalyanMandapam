import React, { useState } from 'react';
import './styles/CheckRent.css';

const CheckRentSection = ({ languageType = 'en' }) => {
  const baratGharNames = [
    { value: '', label: languageType === 'hi' ? 'बारात घर चुनें' : 'Select BaratGhar' },
    { value: 'baratghar1', label: languageType === 'hi' ? 'बारात घर नंबर १' : 'BaratGhar Name 1' },
    { value: 'baratghar2', label: languageType === 'hi' ? 'बारात घर नंबर २' : 'BaratGhar Name 2' },
    { value: 'baratghar3', label: languageType === 'hi' ? 'बाराt घर नंबर ३' : 'BaratGhar Name 3' },
    { value: 'baratghar4', label: languageType === 'hi' ? 'बारात घर नंबर ४' : 'BaratGhar Name 4' },
  ];

  // Sample rent data (replace with actual data source)
  const sampleRentData = {
    baratghar1: {
      commercial: 'Rs. 25,000',
      social: 'Rs. 10,000',
      nonCommercial: 'Rs. 5,000',
    },
    baratghar2: {
      commercial: 'Rs. 30,000',
      social: 'Rs. 12,000',
      nonCommercial: 'Rs. 6,000',
    },
     baratghar3: {
      commercial: 'Rs. 22,000',
      social: 'Rs. 9,000',
      nonCommercial: 'Rs. 4,500',
    },
      baratghar4: {
      commercial: 'Rs. 28,000',
      social: 'Rs. 11,000',
      nonCommercial: 'Rs. 5,500',
    },
  };

  const [selectedBaratGhar, setSelectedBaratGhar] = useState('');
  const [rentChartData, setRentChartData] = useState(null); // State to display rent chart

  // Content for the section
  const content = {
    en: {
      sectionHeading: 'Check Rent Details',
      dropdownLabel: 'BaratGhar Name',
      notesHeading: 'NOTES : Terms & Condition are also apply.',
      note1: '(1). Commercial : 2.5 time multiple Extra charges on baratghar rent applied in Commercial Category.',
      note2: '(2). Social : Normal Charges',
      note3: '(3). Non-Commercial : Get 50% Extra Discount on Commercial baratghar rent charges.',
      rentTableCategoryHeader: 'Category',
      rentTableRentHeader: 'Rent (Per Day)',
      categoryCommercial: 'Commercial',
      categorySocial: 'Social',
      categoryNonCommercial: 'Non-Commercial',
    },
    hi: {
      sectionHeading: 'किराया विवरण जांचें',
      dropdownLabel: 'बारात घर का नाम',
      notesHeading: 'नोट्स : नियम और शर्तें भी लागू होती हैं।',
      note1: '(१). वाणिज्यिक : वाणिज्यिक श्रेणी में लागू बारात घर किराए पर २.५ गुना अतिरिक्त शुल्क।',
      note2: '(२). सामाजिक : सामान्य शुल्क',
      note3: '(३). गैर-वाणिज्यिक : वाणिज्यिक बारात घर किराए पर ५०% अतिरिक्त छूट प्राप्त करें।',
      rentTableCategoryHeader: 'श्रेणी',
      rentTableRentHeader: 'किराया (प्रति दिन)',
      categoryCommercial: 'वाणिज्यिक',
      categorySocial: 'सामाजिक',
      categoryNonCommercial: 'गैर-वाणिज्यिक',
    },
  };

  const currentContent = content[languageType] || content.en;

  // Modified handler to show chart on change
  const handleDropdownChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedBaratGhar(selectedValue);

    if (selectedValue && sampleRentData[selectedValue]) {
      // Display rent data if a valid Barat Ghar is selected
      setRentChartData(sampleRentData[selectedValue]);
    } else {
      // Clear rent data if the placeholder is selected or value is invalid
      setRentChartData(null);
    }
  };

  // Removed handleSubmit function

  return (
    <section className="check-rent-section">
      <div className="container">
        <h2 className="check-rent-section-heading">{currentContent.sectionHeading}</h2>

        <div className="check-rent-content">
            <div className="check-rent-form-block"> {/* The white card */}
                {/* Removed <form> tag */}
                <div className="form-group"> {/* Reuse form-group styling for label+select */}
                    <label htmlFor="baratghar-select">{currentContent.dropdownLabel}</label>
                    <select
                        id="baratghar-select"
                        value={selectedBaratGhar}
                        onChange={handleDropdownChange}
                        required
                    >
                        {baratGharNames.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rent Details Table (Conditional Rendering) */}
                {rentChartData && (
                    <div className="rent-details-chart">
                        <h4>{currentContent.sectionHeading}</h4> {/* Using section heading for table title */}
                        <table>
                            <thead>
                                <tr>
                                    <th>{currentContent.rentTableCategoryHeader}</th>
                                    <th>{currentContent.rentTableRentHeader}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{currentContent.categoryCommercial}</td>
                                    <td>{rentChartData.commercial}</td>
                                </tr>
                                <tr>
                                    <td>{currentContent.categorySocial}</td>
                                    <td>{rentChartData.social}</td>
                                </tr>
                                <tr>
                                    <td>{currentContent.categoryNonCommercial}</td>
                                    <td>{rentChartData.nonCommercial}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                 {/* Notes Section (Inside the card) */}
                 <div className="check-rent-notes-card">
                     <h3 className="notes-heading">{currentContent.notesHeading}</h3>
                     <ul>
                         <li>{currentContent.note1}</li>
                         <li>{currentContent.note2}</li>
                         <li>{currentContent.note3}</li>
                     </ul>
                 </div>

            </div>
        </div>
      </div>
    </section>
  );
};

export default CheckRentSection;