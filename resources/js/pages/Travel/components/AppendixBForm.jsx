import React, { useState, useEffect } from 'react';

const AppendixBForm = ({ onDataChange }) => {
    const [formData, setFormData] = useState({
        name: 'EDUARD ROLAND P. DONOR',
        position: 'Project Technical Staff II',
        official_station: 'CHEDRO-IX, Z.C.',
        destination: '',
        travel_dates: '',
        purpose: '',
        supervisor_name: 'MARIVIC V. IRIBERRI',
        supervisor_designation: 'Officer In-Charge, Office of the Director IV',
        date_signed_claimant: '',
        date_signed_supervisor: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    // Pass data up to the parent component whenever it changes
    useEffect(() => {
        onDataChange(formData);
    }, [formData, onDataChange]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Appendix B: Certificate of Travel Completed</h2>
            
            <div style={styles.inputGroup}>
                <label>Name of Official/Employee:</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={styles.input} />
            </div>

            <div style={styles.inputGroup}>
                <label>Position:</label>
                <input type="text" name="position" value={formData.position} onChange={handleInputChange} style={styles.input} />
            </div>
             
             <div style={styles.inputGroup}>
                <label>Official Station:</label>
                <input type="text" name="official_station" value={formData.official_station} onChange={handleInputChange} style={styles.input} />
            </div>

            <hr style={styles.hr} />

            <p style={styles.certificationText}>
                <strong>THIS IS TO CERTIFY</strong> that I have completed the travel authorized in the Itinerary of Travel dated:
                <input type="text" name="travel_dates" placeholder="e.g., September 16-19, 2025" value={formData.travel_dates} onChange={handleInputChange} style={{...styles.input, width: '250px', marginLeft: '10px'}} />
                under Purpose of Travel:
            </p>
            <textarea 
                name="purpose" 
                value={formData.purpose} 
                onChange={handleInputChange} 
                rows="3" 
                style={styles.textarea}
                placeholder="Describe the purpose of the travel..."
            ></textarea>

            <div style={styles.signatureSection}>
                <div style={styles.signatureBox}>
                    <label>Date Signed:</label>
                    <input type="date" name="date_signed_claimant" value={formData.date_signed_claimant} onChange={handleInputChange} style={styles.input} />
                    <div style={styles.signatureLine}></div>
                    <p>(Signature of Claimant)</p>
                </div>
            </div>

            <hr style={styles.hr} />

            <p style={styles.certificationText}>
                <strong>I HEREBY CERTIFY</strong> that the official named above has completed the travel as stated.
            </p>

            <div style={styles.signatureSection}>
                 <div style={styles.signatureBox}>
                    <label>Date Signed:</label>
                    <input type="date" name="date_signed_supervisor" value={formData.date_signed_supervisor} onChange={handleInputChange} style={styles.input} />
                    <div style={styles.signatureLine}></div>
                    <p>(Signature of Immediate Supervisor)</p>
                     <input type="text" name="supervisor_name" placeholder="Supervisor's Name" value={formData.supervisor_name} onChange={handleInputChange} style={styles.input} />
                     <input type="text" name="supervisor_designation" placeholder="Supervisor's Designation" value={formData.supervisor_designation} onChange={handleInputChange} style={styles.input} />
                </div>
            </div>
        </div>
    );
};

// Basic Styling
const styles = {
    container: { border: '1px solid #eee', padding: '2rem', borderRadius: '5px', marginTop: '2rem' },
    title: { textAlign: 'center', marginBottom: '2rem' },
    inputGroup: { marginBottom: '1rem' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '80px' },
    hr: { margin: '2rem 0' },
    certificationText: { lineHeight: '1.6' },
    signatureSection: { marginTop: '2rem' },
    signatureBox: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    signatureLine: { borderTop: '1px solid black', width: '300px', marginTop: '3rem', marginBottom: '0.5rem' }
};

export default AppendixBForm;