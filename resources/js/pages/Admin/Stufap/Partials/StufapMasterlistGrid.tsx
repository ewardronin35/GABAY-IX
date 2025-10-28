
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

export function StufapMasterlistGrid({ records, filters }: any) {
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== (filters?.search || '')) {
                router.get(route('superadmin.stufaps.index'), { search: searchQuery }, {
                    preserveState: true, replace: true, only: ['stufapRecords', 'filters'],
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, filters?.search]);

    // Handlers for inline editing
    const handleEditClick = (record: any) => {
        setEditingRowId(record.id);
        setEditFormData({
            ...record,
            ...record.scholar,
            priority_program_cluster: record.course?.priority_program_cluster || record.priority_program_cluster || '',
        });
    };

    const handleCancelClick = () => setEditingRowId(null);
const handleExportExcel = () => {
        window.location.href = route('superadmin.stufap.masterlist.excel', { search: searchQuery });
    };
    const handleExportPdf = () => {
        window.location.href = route('superadmin.stufap.masterlist.pdf', { search: searchQuery });
    };
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleSaveClick = (recordId: number) => {
        // This will require a new 'update' method in your StufapController
        router.put(route('superadmin.stufaps.update', recordId), editFormData, {
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

    return (
        <Card>
            <CardHeader><OfficialHeader title="StuFAPs Official Masterlist" /></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input placeholder="Search masterlist..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-sm" />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportExcel}><Download /> Excel</Button>
                        <Button variant="outline" onClick={handleExportPdf}><FileText /> PDF</Button>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">NOS.</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">AWARD NO.</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">PROGRAM</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">LAST NAME</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">FIRST NAME</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">M.I.</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Extension name</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">SEX (M/F)</th>
                                <th colSpan={4} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">PERMANENT HOME ADDRESS</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Type of HEI</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">HEI</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">SUC/LUC/PHEI</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">COURSE</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">PRIORITY PROGRAM CLUSTER</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">YEAR LEVEL (1,2,3...)</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Financial BENEFITS</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">REMARKS</th>
                                <th rowSpan={2} className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Actions</th>
                            </tr>
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">BRGY/STREET</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">TOWN/CITY</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">PROVINCE</th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">DISTRICT (1st-2nd..)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            {records && records.data.length > 0 ? (
                                records.data.map((record: any) => (
                                    editingRowId === record.id ? (
                                        // --- EDITING ROW ---
                                        <tr key={`edit-${record.id}`} className="bg-blue-50 dark:bg-blue-900/20">
                                            <td className="px-4 py-2">{record.seq}</td>
                                            <td className="px-2 py-1"><Input name="award_number" value={editFormData.award_number || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="program" value={editFormData.program || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="family_name" value={editFormData.family_name || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="given_name" value={editFormData.given_name || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="middle_name" value={editFormData.middle_name || ''} onChange={handleFormChange} className="h-8 w-24" /></td>
                                            <td className="px-2 py-1"><Input name="extension_name" value={editFormData.extension_name || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="sex" value={editFormData.sex || ''} onChange={handleFormChange} className="h-8 w-24" /></td>
                                            <td className="px-2 py-1"><Input name="brgy_street" value={editFormData.brgy_street || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="town_city" value={editFormData.town_city || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="province" value={editFormData.province || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="district" value={editFormData.district || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-4 py-2">{record.hei?.type_of_hei}</td>
                                            <td className="px-4 py-2">{record.hei?.hei_name}</td>
                                            <td className="px-4 py-2">{record.hei?.suc_luc_phei}</td>
                                            <td className="px-4 py-2">{record.course?.course_name}</td>
                                            <td className="px-2 py-1"><Input name="priority_program_cluster" value={editFormData.priority_program_cluster || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="year_level" value={editFormData.year_level || ''} onChange={handleFormChange} className="h-8 w-24" /></td>
                                            <td className="px-2 py-1"><Input name="financial_benefits" value={editFormData.financial_benefits || ''} onChange={handleFormChange} className="h-8" /></td>
                                            <td className="px-2 py-1"><Input name="remarks" value={editFormData.remarks || ''} onChange={handleFormChange} className="h-8" /></td>
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
                                            <td className="px-4 py-2">{record.award_number}</td>
                                            <td className="px-4 py-2">{record.program}</td>
                                            <td className="px-4 py-2">{record.scholar?.family_name}</td>
                                            <td className="px-4 py-2">{record.scholar?.given_name}</td>
                                            <td className="px-4 py-2">{record.scholar?.middle_name ? record.scholar.middle_name.charAt(0) + '.' : ''}</td>
                                            <td className="px-4 py-2">{record.scholar?.extension_name}</td>
                                            <td className="px-4 py-2">{record.scholar?.sex}</td>
                                            <td className="px-4 py-2">{record.scholar?.brgy_street}</td>
                                            <td className="px-4 py-2">{record.scholar?.town_city}</td>
                                            <td className="px-4 py-2">{record.scholar?.province}</td>
                                            <td className="px-4 py-2">{record.scholar?.district}</td>
                                            <td className="px-4 py-2">{record.hei?.type_of_hei}</td>
                                            <td className="px-4 py-2">{record.hei?.hei_name}</td>
                                            <td className="px-4 py-2">{record.hei?.suc_luc_phei}</td>
                                            <td className="px-4 py-2">{record.course?.course_name}</td>
                                            <td className="px-4 py-2">{record.course?.priority_program_cluster || record.priority_program_cluster}</td>
                                            <td className="px-4 py-2">{record.year_level}</td>
                                            <td className="px-4 py-2">{record.financial_benefits}</td>
                                            <td className="px-4 py-2">{record.remarks}</td>
                                            <td className="px-4 py-2">
                                                <Button size="icon" variant="outline" onClick={() => handleEditClick(record)}><Pencil className="w-4 h-4" /></Button>
                                            </td>
                                        </tr>
                                    )
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={21} className="text-center py-8 text-muted-foreground">
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
