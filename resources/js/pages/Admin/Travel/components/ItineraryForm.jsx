import React, { useState } from 'react';
import axios from 'axios';

const ItineraryForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        official_station: 'CHEDRO-IX, Z.C.',
        fund_cluster: '',
        itinerary_no: '',
        date_of_travel: '',
        purpose: ''
    });

    const [rows, setRows] = useState([
        { date: '', place: '', departure_time: '', arrival_time: '', transport_means: '', fare: 0, per_diem: 0, others: 0 }
    ]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleRowChange = (index, e) => {
        const { name, value } = e.target;
        const list = [...rows];
        list[index][name] = value;
        setRows(list);
    };

    const addRow = () => {
        setRows([...rows, { date: '', place: '', departure_time: '', arrival_time: '', transport_means: '', fare: 0, per_diem: 0, others: 0 }]);
    };

    const removeRow = (index) => {
        const list = [...rows];
        list.splice(index, 1);
        setRows(list);
    };

    const calculateTotal = (key) => {
        return rows.reduce((total, row) => total + parseFloat(row[key] || 0), 0).toFixed(2);
    };

     React.useEffect(() => {
        const fullPayload = {
            ...formData,
            items: rows,
            // ... calculations
        };
        onDataChange(fullPayload);
    }, [formData, rows, onDataChange]);
  


    return (
        <div style={{ fontFamily: 'Arial, sans-serif', margin: '2rem', padding: '2rem', border: '1px solid #ccc' }}>
            <h2 style={{ textAlign: 'center' }}>ITINERARY OF TRAVEL</h2>

            <form onSubmit={handleSubmit}>
                {/* Header Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
                    <div>
                        <p><strong>Entity Name:</strong> COMMISSION ON HIGHER EDUCATION</p>
                        <p><strong>Fund Cluster:</strong> <input type="text" name="fund_cluster" value={formData.fund_cluster} onChange={handleInputChange} style={{ width: '100%' }} /></p>
                    </div>
                     <div>
                        <p><strong>No.:</strong> <input type="text" name="itinerary_no" value={formData.itinerary_no} onChange={handleInputChange} style={{ width: '100%' }} /></p>
                    </div>
                </div>

                {/* Details Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' }}>
                    <div>
                         <label><strong>Name:</strong></label>
                         <input type="text" name="name" value={formData.name} onChange={handleInputChange} style={{ width: '100%' }} />
                         <label><strong>Position:</strong></label>
                         <input type="text" name="position" value={formData.position} onChange={handleInputChange} style={{ width: '100%' }} />
                         <label><strong>Official Station:</strong></label>
                         <input type="text" name="official_station" value={formData.official_station} onChange={handleInputChange} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label><strong>Date of Travel:</strong></label>
                        <input type="text" name="date_of_travel" placeholder="e.g., September 16-19, 2025" value={formData.date_of_travel} onChange={handleInputChange} style={{ width: '100%' }}/>
                        <label><strong>Purpose of Travel:</strong></label>
                        <textarea name="purpose" value={formData.purpose} onChange={handleInputChange} rows="4" style={{ width: '100%' }}></textarea>
                    </div>
                </div>

                {/* Itinerary Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Date</th>
                            <th style={tableHeaderStyle}>Places to be Visited</th>
                            <th colSpan="2" style={tableHeaderStyle}>Time</th>
                            <th style={tableHeaderStyle}>Means of Transport</th>
                            <th style={tableHeaderStyle}>Fare</th>
                            <th style={tableHeaderStyle}>Per Diem</th>
                            <th style={tableHeaderStyle}>Others</th>
                            <th style={tableHeaderStyle}>Action</th>
                        </tr>
                         <tr>
                            <th style={tableCellStyle}></th>
                            <th style={tableCellStyle}></th>
                            <th style={tableCellStyle}>Departure</th>
                            <th style={tableCellStyle}>Arrival</th>
                            <th style={tableCellStyle}></th>
                            <th style={tableCellStyle}></th>
                            <th style={tableCellStyle}></th>
                            <th style={tableCellStyle}></th>
                            <th style={tableCellStyle}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr key={index}>
                                <td style={tableCellStyle}><input type="date" name="date" value={row.date} onChange={e => handleRowChange(index, e)} style={inputStyle} /></td>
                                <td style={tableCellStyle}><input type="text" name="place" value={row.place} onChange={e => handleRowChange(index, e)} style={inputStyle} /></td>
                                <td style={tableCellStyle}><input type="time" name="departure_time" value={row.departure_time} onChange={e => handleRowChange(index, e)} style={inputStyle} /></td>
                                <td style={tableCellStyle}><input type="time" name="arrival_time" value={row.arrival_time} onChange={e => handleRowChange(index, e)} style={inputStyle} /></td>
                                <td style={tableCellStyle}><input type="text" name="transport_means" value={row.transport_means} onChange={e => handleRowChange(index, e)} style={inputStyle} /></td>
                                <td style={tableCellStyle}><input type="number" name="fare" value={row.fare} onChange={e => handleRowChange(index, e)} style={inputStyle} /></td>
                                <td style={tableCellStyle}><input type="number" name="per_diem" value={row.per_diem} onChange={e => handleRowChange(index, e)} style={inputStyle} /></td>
                                <td style={tableCellStyle}><input type="number" name="others" value={row.others} onChange={e => handleRowChange(index, e)} style={inputStyle} /></td>
                                <td style={tableCellStyle}><button type="button" onClick={() => removeRow(index)}>Remove</button></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="5" style={{...tableCellStyle, textAlign: 'right'}}><strong>Total</strong></td>
                            <td style={tableCellStyle}><strong>{calculateTotal('fare')}</strong></td>
                            <td style={tableCellStyle}><strong>{calculateTotal('per_diem')}</strong></td>
                            <td style={tableCellStyle}><strong>{calculateTotal('others')}</strong></td>
                            <td style={tableCellStyle}></td>
                        </tr>
                    </tfoot>
                </table>
                <button type="button" onClick={addRow}>Add Itinerary Row</button>
                <hr style={{ margin: '2rem 0' }} />

                {/* Signature Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <p><strong>Prepared by:</strong></p>
                        <p style={{marginTop: '3rem', borderTop: '1px solid black', paddingTop: '0.5rem'}}>Signature Over Printed Name</p>
                        <p>{formData.position}</p>
                    </div>
                     <div>
                        <p><strong>Approved by:</strong></p>
                        <p style={{marginTop: '3rem', borderTop: '1px solid black', paddingTop: '0.5rem'}}>MAJIDALYN M. ROLDAN</p>
                        <p>Chief Administrative Officer</p>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>Submit Itinerary</button>
                </div>
            </form>
        </div>
    );
};

// Simple inline styles for the table
const tableHeaderStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' };
const tableCellStyle = { border: '1px solid #ddd', padding: '8px', textAlign: 'center' };
const inputStyle = { width: '100%', boxSizing: 'border-box' };

export default ItineraryForm;