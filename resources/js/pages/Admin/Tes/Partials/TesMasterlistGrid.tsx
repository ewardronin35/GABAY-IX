import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Download, FileText, Info, Pencil, X, Check, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { toast } from 'sonner';

export function TesMasterlistGrid({ records, filters }: any) {
    const [searchQuery, setSearchQuery] = useState(filters?.search_ml || '');
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    // Debounced search effect for the masterlist
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search_ml || '')) {
                router.get(route('superadmin.tes.index'), { search_ml: searchQuery }, {
                    preserveState: true, replace: true, only: ['tesMasterlist', 'filters'],
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters?.search_ml]);

    // Handlers for inline editing functionality
    const handleEditClick = (record: any) => {
        setEditingRowId(record.id);
        // Flatten the data for easy use in form inputs
        setEditFormData({
            ...record, // Academic record data
            ...record.scholar, // Scholar's personal data
        });
    };

    const handleCancelClick = () => setEditingRowId(null);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };
const handleExportExcel = () => {
        window.location.href = route('superadmin.tes.masterlist.excel', { search_ml: searchQuery });
    };

    const handleExportPdf = () => {
        window.location.href = route('superadmin.tes.masterlist.pdf', { search_ml: searchQuery });
    };
    const handleSaveClick = (recordId: number) => {
        router.put(route('superadmin.tes.update', recordId), editFormData, {
            onStart: () => setIsSaving(true),
            onSuccess: () => {
                toast.success("Record updated!");
                setEditingRowId(null);
            },
            onError: (errors) => {
                console.error(errors);
                toast.error("Update failed. Check console for details.");
            },
            onFinish: () => setIsSaving(false),
            preserveScroll: true,
        });
    };

    const headers = [
        'SEQ', 'HEI Name', 'HEI Type', 'HEI City/Muni', 'HEI Province', 'HEI District', 'App No.', 'Award No.',
        'Last Name', 'First Name', 'Ext Name', 'Middle Name', 'Sex', 'Course', 'Year Level', 'Date Disbursed',
        'LDDAP', 'Semester', 'Year', 'Actions'
    ];

    return (
        <Card>
            <CardHeader><OfficialHeader title="TES Official Masterlist" /></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input placeholder="Search masterlist..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-sm" />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportExcel}><Download className="w-4 h-4 mr-2" /> Excel</Button>
                        <Button variant="outline" onClick={handleExportPdf}><FileText className="w-4 h-4 mr-2" /> PDF</Button>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                {headers.map(header => (
                                    <th key={header} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {records && records.data.length > 0 ? (
                                records.data.map((record: any) => (
                                    editingRowId === record.id ? (
                                        // --- EDITING ROW ---
                                        <tr key={`edit-${record.id}`} className="bg-blue-50 dark:bg-blue-900/20">
                                            {/* Non-editable fields shown as text */}
                                            <td className="px-4 py-2">{record.seq}</td>
                                            <td className="px-4 py-2">{record.hei?.hei_name}</td>
                                            <td colSpan={6}>...</td>
                                            {/* Editable fields as inputs */}
                                            <td className="px-2 py-1"><Input name="family_name" value={editFormData.family_name || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="given_name" value={editFormData.given_name || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td colSpan={7}>...</td>
                                            <td className="px-4 py-2">
                                                <div className="flex gap-2">
                                                    <Button size="icon" onClick={() => handleSaveClick(record.id)} disabled={isSaving}>
                                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    </Button>
                                                    <Button size="icon" variant="ghost" onClick={handleCancelClick}><X className="w-4 h-4" /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        // --- READ-ONLY ROW ---
                                        <tr key={record.id} className="dark:hover:bg-gray-800">
                                            <td className="px-4 py-2">{record.seq}</td>
                                            <td className="px-4 py-2">{record.hei?.hei_name}</td>
                                            <td className="px-4 py-2">{record.hei?.hei_type}</td>
                                            <td className="px-4 py-2">{record.hei?.city}</td>
                                            <td className="px-4 py-2">{record.hei?.province}</td>
                                            <td className="px-4 py-2">{record.hei?.district}</td>
                                            <td className="px-4 py-2">{record.app_no}</td>
                                            <td className="px-4 py-2">{record.award_no}</td>
                                            <td className="px-4 py-2">{record.scholar?.family_name}</td>
                                            <td className="px-4 py-2">{record.scholar?.given_name}</td>
                                            <td className="px-4 py-2">{record.scholar?.extension_name}</td>
                                            <td className="px-4 py-2">{record.scholar?.middle_name}</td>
                                            <td className="px-4 py-2">{record.scholar?.sex}</td>
                                            <td className="px-4 py-2">{record.course?.course_name}</td>
                                            <td className="px-4 py-2">{record.year_level}</td>
                                            <td className="px-4 py-2">{/* Date Disbursed - N/A */}</td>
                                            <td className="px-4 py-2">{/* LDDAP - N/A */}</td>
                                            <td className="px-4 py-2">{record.semester}</td>
                                            <td className="px-4 py-2">{record.academic_year}</td>
                                            <td className="px-4 py-2">
                                                <Button size="icon" variant="outline" onClick={() => handleEditClick(record)}><Pencil className="w-4 h-4" /></Button>
                                            </td>
                                        </tr>
                                    )
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={headers.length} className="text-center py-8 text-muted-foreground">
                                        <Info className="mx-auto h-8 w-8 mb-2" />
                                        No masterlist records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationLinks links={records.links} />
            </CardContent>
        </Card>
    );
}