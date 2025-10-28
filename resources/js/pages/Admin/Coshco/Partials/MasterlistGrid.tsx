// In MasterlistGrid.tsx

import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Download, FileText, Pencil, X, Check, ChevronLeft, ChevronRight } from 'lucide-react'; // Import icons
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

// A simple debounce hook
function useDebounce(value: string, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

// Header logos
const CHED_LOGO_URL = '/images/ched-logo.png';
const BP_LOGO_URL = '/images/bagong-pilipinas-logo.png';

export function MasterlistGrid() {
    // === STATE MANAGEMENT ===
    const [gridData, setGridData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    
    // ▼▼▼ NEW/MODIFIED STATE FOR PAGINATION & FILTERING ▼▼▼
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
    const [paginationData, setPaginationData] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    // ▲▲▲ END OF NEW/MODIFIED STATE ▲▲▲

    // === DATA FETCHING ===
    useEffect(() => {
        setLoading(true);
        // Build query parameters for the API request
        const params = {
            page: currentPage,
            search: debouncedSearchQuery,
        };
        
        axios.get(route('superadmin.reports.masterlistData', params))
            .then(response => {
                // The actual scholar data is now in response.data.data
                setGridData(response.data.data);
                // Store the whole pagination object
                setPaginationData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch masterlist data:", error);
                toast.error("Could not load masterlist data.");
                setLoading(false);
            });
    // Re-fetch data when debounced search query or current page changes
    }, [debouncedSearchQuery, currentPage]);

    // Go back to page 1 whenever a new search is performed
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    // === EVENT HANDLERS ===
    const handleEditClick = (row: any) => {
        setEditingRowId(row.id);
        setEditFormData({ ...row });
    };

    const handleCancelClick = () => {
        setEditingRowId(null);
    };

    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [event.target.name]: event.target.value });
    };

    const handleSaveClick = (scholarId: number) => {
        axios.put(route('superadmin.scholars.update', { scholar: scholarId }), editFormData)
            .then(response => {
                const updatedScholar = response.data;
                // We need to re-fetch the current page to ensure data consistency
                // as sorting might change. A simpler way is just to update the row locally.
                 const newData = gridData.map((row) =>
                    row.id === scholarId ? { ...row, ...updatedScholar } : row
                );
                setGridData(newData);
                setEditingRowId(null);
                toast.success("Scholar updated successfully!");
            })
            .catch(error => {
                console.error("Failed to update scholar:", error);
                toast.error("Failed to save. Check console for details.");
            });
    };
    
    const handleExportExcel = () => {
        // Use the live search query for immediate export
        const url = route('superadmin.reports.masterlist.excel', { search: searchQuery });
        window.location.href = url;
    };

    const handleExportPdf = () => {
        // Use the live search query for immediate export
        const url = route('superadmin.reports.masterlist.pdf', { search: searchQuery });
        window.location.href = url;
    };
    
    // ❌ REMOVE THE CLIENT-SIDE FILTERING - The server handles it now
    // const filteredData = gridData.filter(...);

    return (
        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-md text-gray-900 dark:text-gray-100">
            <header className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <img src={CHED_LOGO_URL} alt="CHED Logo" className="h-20" />
                <div className="text-center">
                    <p className="font-fira-sans text-sm text-gray-700 dark:text-gray-300">Republic of the Philippines</p>
                    <p className="font-georgia text-xl font-bold tracking-wider">COMMISSION ON HIGHER EDUCATION</p>
                    <p className="font-georgia text-xl font-bold tracking-wider">COSCHO Scholarship MASTERLIST</p>
                </div>
                <img src={BP_LOGO_URL} alt="Bagong Pilipinas Logo" className="h-20" />
            </header>

           <div className="flex justify-between items-center my-4">
                <Input
                    placeholder="Search by name, award #, HEI..." // Updated placeholder
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="w-4 h-4 mr-2" /> Export to Excel
                    </Button>
                    <Button variant="outline" onClick={handleExportPdf}>
                        <FileText className="w-4 h-4 mr-2" /> Export to PDF
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            {['No.', 'Award No.', 'Last Name', 'First Name', 'HEI', 'Course', 'Region', 'Status', 'Actions'].map(header => (
                                <th key={header} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={9} className="text-center py-4">Loading data...</td></tr>
                        ) : gridData.length > 0 ? ( // ✅ Check if gridData has items
                            gridData.map((row: any) => ( // ✅ Render gridData directly
                                <tr key={row.id} className="dark:hover:bg-gray-800">
                                    <td className="px-4 py-2">{row.no}</td>
                                    <td className="px-4 py-2">{row.award_no}</td>
                                    <td className="px-4 py-2">{editingRowId === row.id ? <Input name="last_name" value={editFormData.last_name} onChange={handleFormChange} /> : row.last_name}</td>
                                    <td className="px-4 py-2">{editingRowId === row.id ? <Input name="first_name" value={editFormData.first_name} onChange={handleFormChange} /> : row.first_name}</td>
                                    <td className="px-4 py-2">{editingRowId === row.id ? <Input name="hei" value={editFormData.hei} onChange={handleFormChange} /> : row.hei}</td>
                                    <td className="px-4 py-2">{editingRowId === row.id ? <Input name="course" value={editFormData.course} onChange={handleFormChange} /> : row.course}</td>
                                    <td className="px-4 py-2">{row.region}</td>
                                    <td className="px-4 py-2">{row.status}</td>
                                    <td className="px-4 py-2">
                                        {editingRowId === row.id ? (
                                            <div className="flex gap-2"><Button size="icon" onClick={() => handleSaveClick(row.id)}><Check className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={handleCancelClick}><X className="w-4 h-4" /></Button></div>
                                        ) : ( <Button size="icon" variant="outline" onClick={() => handleEditClick(row)}><Pencil className="w-4 h-4" /></Button> )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={9} className="text-center py-4">No results found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* ▼▼▼ NEW PAGINATION CONTROLS ▼▼▼ */}
            {paginationData && paginationData.total > 0 && (
                <div className="flex items-center justify-between mt-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        Showing {paginationData.from} to {paginationData.to} of {paginationData.total} results
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                        </Button>
                        <span className="text-gray-700 dark:text-gray-300">
                           Page {paginationData.current_page} of {paginationData.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === paginationData.last_page}
                        >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
            {/* ▲▲▲ END OF PAGINATION CONTROLS ▲▲▲ */}
        </div>
    );
}