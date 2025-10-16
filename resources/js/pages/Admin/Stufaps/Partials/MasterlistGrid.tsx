import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Download, FileText, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

const CHED_LOGO_URL = '/images/ched-logo.png';
const BP_LOGO_URL = '/images/bagong-pilipinas-logo.png';

export function MasterlistGrid() {
    // === STATE MANAGEMENT ===
    const [gridData, setGridData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});

    // === DATA FETCHING ===
    useEffect(() => {
        axios.get(route('superadmin.reports.masterlistData'))
            .then(response => {
                setGridData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch masterlist data:", error);
                setLoading(false);
            });
    }, []);

    // === EVENT HANDLERS ===
    const handleEditClick = (row: any) => {
        setEditingRowId(row.no);
        setEditFormData({ ...row }); // Copy row data to editable form state
    };

    const handleCancelClick = () => {
        setEditingRowId(null); // Exit edit mode
    };

    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [event.target.name]: event.target.value });
    };

    const handleSaveClick = (scholarId: number) => {
        axios.put(route('superadmin.scholars.update', { scholar: scholarId }), editFormData)
            .then(response => {
                // Update the main grid data with the new data from the server
                const newData = gridData.map((row) =>
                    row.id === scholarId ? response.data : row
                );
                setGridData(newData);
                setEditingRowId(null); // Exit edit mode
                toast.success("Scholar updated successfully!");
            })
            .catch(error => {
                console.error("Failed to update scholar:", error);
                toast.error("Failed to save changes. Check console for details.");
            });
    };
    
    const handleExportPdf = () => window.location.href = route('superadmin.reports.masterlist.pdf');
    const handleExportExcel = () => window.location.href = route('superadmin.reports.masterlist');

    // === RENDER ===
    return (
   <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-gray-900 dark:text-gray-100">
            {/* Add dark mode border and text colors to the header */}
            <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <img src={CHED_LOGO_URL} alt="CHED Logo" className="h-20" />
                <div className="text-center">
                    <p className="font-fira-sans text-sm text-gray-700 dark:text-gray-300">Republic of the Philippines</p>
                    <p className="font-fira-sans text-sm text-gray-700 dark:text-gray-300">OFFICE OF THE PRESIDENT</p>
                    <p className="font-georgia text-xl font-bold tracking-wider">COMMISSION ON HIGHER EDUCATION</p>
                                        <p className="font-georgia text-xl font-bold tracking-wider">Scholarship MASTERLIST</p>

                </div>
                <img src={BP_LOGO_URL} alt="Bagong Pilipinas Logo" className="h-20" />
            </header>

            {/* Action Buttons (from shadcn/ui) should handle dark mode automatically */}
            <div className="flex justify-end gap-2 my-4">
                <Button variant="outline" onClick={handleExportExcel}>
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                </Button>
                <Button variant="outline" onClick={handleExportPdf}>
                    <FileText className="w-4 h-4 mr-2" />
                    Export to PDF
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">No.</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Award No.</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Last Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">First Name</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">HEI</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Course</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-4">Loading data...</td></tr>
                        ) : (
                            gridData.map((row: any) => (
                                <tr key={row.no} className="dark:hover:bg-gray-800">
                                    <td className="px-4 py-2">{row.no}</td>
                                    <td className="px-4 py-2">{row.award_no}</td>
                                    <td className="px-4 py-2">
                                        {editingRowId === row.no ? (
                                            <Input name="last_name" value={editFormData.last_name} onChange={handleFormChange} />
                                        ) : ( row.last_name )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {editingRowId === row.no ? (
                                            <Input name="first_name" value={editFormData.first_name} onChange={handleFormChange} />
                                        ) : ( row.first_name )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {editingRowId === row.no ? (
                                            <Input name="hei" value={editFormData.hei} onChange={handleFormChange} />
                                        ) : ( row.hei )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {editingRowId === row.no ? (
                                            <Input name="course" value={editFormData.course} onChange={handleFormChange} />
                                        ) : ( row.course )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {editingRowId === row.no ? (
                                            <div className="flex gap-2">
                                                <Button size="icon" onClick={() => handleSaveClick(row.id)}><Check className="w-4 h-4" /></Button>
                                                <Button size="icon" variant="ghost" onClick={handleCancelClick}><X className="w-4 h-4" /></Button>
                                            </div>
                                        ) : (
                                            <Button size="icon" variant="outline" onClick={() => handleEditClick(row)}><Pencil className="w-4 h-4" /></Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}