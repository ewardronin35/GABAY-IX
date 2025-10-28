import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { Button } from '@/components/ui/button';
import { Download, FileText, Pencil, Loader2 } from 'lucide-react';
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react'; // 1. Import useEffect

// 2. Import DataTable and related types
import DataTable, { type TableColumn } from 'react-data-table-component';
import { toast } from 'sonner';

// 3. Import Dialog components for the modal
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the shape of your data
interface DataRow {
    id: number;
    award_number: string;
    last_name: string;
    first_name: string;
    hei_name: string;
    program_name: string;
    region: string;
}

export function EstatMasterlistGrid({ records, filters }: any) {
    const [loading, setLoading] = useState(false);
    
    // 4. Add state for theme and modal
    const [theme, setTheme] = useState(
        document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRow, setEditingRow] = useState<DataRow | null>(null);

    // 5. Add useEffect to listen for theme changes on the <html> tag
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // 6. Make the "Edit" button open the modal
    const handleEditClick = (row: DataRow) => {
        setEditingRow({ ...row }); // Make a copy of the row to edit
        setIsModalOpen(true);
    };

    // 7. Handle saving changes from the modal
    const handleSaveEdit = (e: React.FormEvent) => {
         e.preventDefault();
         if (!editingRow) return;

         // We can reuse your existing bulkUpdate route!
         router.put(route('superadmin.estatskolar.bulkUpdate'), {
            data: [editingRow] // Send the single edited row as an array
         }, {
            onStart: () => setLoading(true),
            onSuccess: () => {
                toast.success("Scholar updated!");
                setIsModalOpen(false);
                setEditingRow(null);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error("Failed to update scholar.");
            },
            onFinish: () => setLoading(false),
            preserveScroll: true,
            only: ['beneficiaries'], // Only refresh the data
         });
    }
    
    // Handle form changes in the modal
    const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingRow) return;
        setEditingRow({ ...editingRow, [e.target.name]: e.target.value });
    }

    // 8. Define the columns for the data table
    const columns: TableColumn<DataRow>[] = [
        { name: 'Award No.', selector: row => row.award_number, sortable: true },
        { name: 'Last Name.', selector: row => row.last_name, sortable: true },
        { name: 'First Name', selector: row => row.first_name, sortable: true },
        { name: 'HEI Name', selector: row => row.hei_name, sortable: false },
        { name: 'Region', selector: row => row.region, sortable: true },
        {
            name: 'Actions',
            cell: (row: DataRow) => (
                <Button variant="outline" size="icon" onClick={() => handleEditClick(row)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            ),
            ignoreRowClick: true,
           
        },
    ];

    // 9. Handle pagination changes
    const handlePageChange = (page: number) => {
        setLoading(true);
        router.get(route('superadmin.estatskolar.index'), {
            page: page,
            search: filters?.search || '',
        }, {
            preserveState: true,
            replace: true,
            only: ['beneficiaries'],
            onFinish: () => setLoading(false),
        });
    };
    
    // 10. Add Export handlers
    const handleExportExcel = () => {
        window.location.href = route('superadmin.estatskolar.masterlist.excel');
    };

    const handleExportPdf = () => {
        window.location.href = route('superadmin.estatskolar.masterlist.pdf');
    };

    return (
        // 11. Wrap component in Dialog for the modal
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Card>
                <CardHeader><OfficialHeader title="E-STAT Skolar Official Masterlist" /></CardHeader>
                <CardContent className="space-y-4">
                    
                    {/* 12. Add Export buttons back */}
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={handleExportExcel}>
                            <Download className="w-4 h-4 mr-2" /> Excel
                        </Button>
                        <Button variant="outline" onClick={handleExportPdf}>
                            <FileText className="w-4 h-4 mr-2" /> PDF
                        </Button>
                    </div>
                    
                    <div className="border rounded-lg">
                        <DataTable
                            columns={columns}
                            data={records.data}
                            progressPending={loading}
                            progressComponent={<div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}
                            
                            pagination
                            paginationServer
                            paginationTotalRows={records.total}
                            paginationPerPage={records.per_page}
                            paginationDefaultPage={records.current_page}
                            onChangePage={handlePageChange}
                            
                            striped
                            highlightOnHover
                            
                            // 13. Add the theme prop
                            theme={theme}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 14. Add the DialogContent for the Edit Modal */}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Scholar</DialogTitle>
                    <DialogDescription>
                        Make changes to the scholar's details here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                {editingRow && (
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input id="last_name" name="last_name" value={editingRow.last_name} onChange={handleModalChange} />
                            </div>
                            <div>
                                <Label htmlFor="first_name">First Name</Label>
                                <Input id="first_name" name="first_name" value={editingRow.first_name} onChange={handleModalChange} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="award_number">Award Number</Label>
                            <Input id="award_number" name="award_number" value={editingRow.award_number} onChange={handleModalChange} />
                        </div>
                        <div>
                            <Label htmlFor="hei_name">HEI Name</Label>
                            <Input id="hei_name" name="hei_name" value={editingRow.hei_name} onChange={handleModalChange} />
                        </div>
                        <div>
                            <Label htmlFor="region">Region</Label>
                            <Input id="region" name="region" value={editingRow.region} onChange={handleModalChange} />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}