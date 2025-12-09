import React, { useState, useEffect } from 'react';

const RerForm = ({ onDataChange }) => {
    const [formData, setFormData] = useState({
        payee: 'EDUARD ROLAND P. DONOR',
        official_station: 'CHEDRO-IX, Z.C.',
        rer_no: '',
        date: '',
        tin: '',
        explanation: 'To reimburse payment for hotel accommodation, terminal fees, taxi fares, and other incidental expenses incurred during the official travel to Manila to attend the “Workshop on the MARINA-CHED Transition Plan” on September 16-19, 2025.'
    });

    const [rows, setRows] = useState([
        { date: '', invoice_no: '', establishment: '', expense_nature: '', amount: 0 }
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
        setRows([...rows, { date: '', invoice_no: '', establishment: '', expense_nature: '', amount: 0 }]);
    };

    const removeRow = (index) => {
        const list = [...rows];
        list.splice(index, 1);
        setRows(list);
    };

    const calculateTotal = () => {
        return rows.reduce((total, row) => total + parseFloat(row.amount || 0), 0).toFixed(2);
    };

    // Pass all data (form and rows) to parent
    useEffect(() => {
        const totalAmount = calculateTotal();
        onDataChange({ ...formData, items: rows, total_amount: totalAmount });
    }, [formData, rows, onDataChange]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Reimbursement Expense Receipt</h2>
            
            <div style={styles.grid}>
                <div>
                    <p><strong>Entity Name:</strong> Commission on Higher Education, Regional Office IX</p>
                    <label>Payee:</label>
                    <input type="text" name="payee" value={formData.payee} onChange={handleInputChange} style={styles.input} />
                    <label>Official Station:</label>
                    <input type="text" name="official_station" value={formData.official_station} onChange={handleInputChange} style={styles.input} />
                </div>
                <div>
                    <label>RER No.:</label>
                    <input type="text" name="rer_no" value={formData.rer_no} onChange={handleInputChange} style={styles.input} />
                    <label>Date:</label>
                    <input type="date" name="date" value={formData.date} onChange={handleInputChange} style={styles.input} />
                    <label>TIN:</label>
                    <input type="text" name="tin" value={formData.tin} onChange={handleInputChange} style={styles.input} />
                </div>
            </div>

            <label><strong>Explanation:</strong></label>
            <textarea name="explanation" value={formData.explanation} onChange={handleInputChange} rows="4" style={styles.textarea}></textarea>
            
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>O.R./Invoice No.</th>
                        <th style={styles.th}>Name of Establishment</th>
                        <th style={styles.th}>Nature of Expense</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index}>
                            <td style={styles.td}><input type="date" name="date" value={row.date} onChange={e => handleRowChange(index, e)} style={styles.input} /></td>
                            <td style={styles.td}><input type="text" name="invoice_no" value={row.invoice_no} onChange={e => handleRowChange(index, e)} style={styles.input} /></td>
                            <td style={styles.td}><input type="text" name="establishment" value={row.establishment} onChange={e => handleRowChange(index, e)} style={styles.input} /></td>
                            <td style={styles.td}><input type="text" name="expense_nature" value={row.expense_nature} onChange={e => handleRowChange(index, e)} style={styles.input} /></td>
                            <td style={styles.td}><input type="number" name="amount" value={row.amount} onChange={e => handleRowChange(index, e)} style={styles.input} /></td>
                            <td style={styles.td}><button type="button" onClick={() => removeRow(index)}>Remove</button></td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="4" style={{...styles.td, textAlign: 'right'}}><strong>Total Amount</strong></td>
                        <td colSpan="2" style={styles.td}><strong>{calculateTotal()}</strong></td>
                    </tr>
                </tfoot>
            </table>
            <button type="button" onClick={addRow}>Add Expense Row</button>
        </div>
    );
};

// Re-using styles from Appendix B for consistency where possible
const styles = {
    container: { border: '1px solid #eee', padding: '2rem', borderRadius: '5px', marginTop: '2rem' },
    title: { textAlign: 'center', marginBottom: '2rem' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '80px', marginBottom: '1rem' },
    table: { width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' },
    th: { border: '1px solid #ddd', padding: '8px', textAlign: 'center', backgroundColor: '#f2f2f2' },
    td: { border: '1px solid #ddd', padding: '4px', textAlign: 'center' }
};

export default RerForm;