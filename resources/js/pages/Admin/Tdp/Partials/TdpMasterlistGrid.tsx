import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { Button } from '@/components/ui/button';
import { Download, FileText, Info, Loader2 } from 'lucide-react'; // ✅ ADD Loader2
import { PaginationLinks } from '@/components/ui/PaginationLinks';
import { route } from 'ziggy-js'; // ✅ ADD ziggy-js
import { useState } from 'react'; // ✅ ADD useState
interface TdpMasterlistGridProps {
    records: any;
    filters?: {
        search_ml?: string;
    }
}

export function TdpMasterlistGrid({ records, filters }: TdpMasterlistGridProps) { // ✅ UPDATE PROPS
    const [isDownloading, setIsDownloading] = useState<null | 'excel' | 'pdf'>(null);

    // ✅ ADD HANDLER FOR EXCEL
    const handleExportExcel = () => {
        setIsDownloading('excel');
        
        // Build the URL with the filter parameters
        const params = new URLSearchParams();
        if (filters?.search_ml) {
            params.append('search_ml', filters.search_ml);
        }
        
        // We use window.location.href for a simple GET request download.
        // The browser will handle the file download prompt.
        window.location.href = `${route('superadmin.tdp.masterlistExcel')}?${params.toString()}`;

        // We can't know when the download finishes, so just reset after a short delay
        setTimeout(() => setIsDownloading(null), 2000);
    };

    // ✅ ADD HANDLER FOR PDF
    const handleExportPdf = () => {
        setIsDownloading('pdf');
        
        const params = new URLSearchParams();
        if (filters?.search_ml) {
            params.append('search_ml', filters.search_ml);
        }

        window.location.href = `${route('superadmin.tdp.masterlistPdf')}?${params.toString()}`;
        
        setTimeout(() => setIsDownloading(null), 2000);
    };
    return (
        <Card>
            <CardHeader><OfficialHeader title="TDP Official Masterlist" /></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button 
                        variant="outline"
                        onClick={handleExportExcel}
                        disabled={isDownloading === 'excel'}
                    >
                        {isDownloading === 'excel' 
                            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                            : <Download className="w-4 h-4 mr-2" />
                        }
                        Excel
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={handleExportPdf}
                        disabled={isDownloading === 'pdf'}
                    >
                        {isDownloading === 'pdf'
                            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            : <FileText className="w-4 h-4 mr-2" />
                        }
                        PDF
                    </Button>
                </div>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                {['Award No.', 'Last Name', 'First Name', 'HEI', 'Course', 'Status'].map(header => (
                                    <th key={header} className="px-4 py-2 text-left font-semibold">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {records && records.data.length > 0 ? (
                                records.data.map((record: any) => (
                                    <tr key={record.id}>
                                        <td className="px-4 py-2">{record.award_no}</td>
                                        <td className="px-4 py-2">{record.scholar?.family_name}</td>
                                        <td className="px-4 py-2">{record.scholar?.given_name}</td>
                                        <td className="px-4 py-2">{record.hei?.hei_name}</td>
                                        <td className="px-4 py-2">{record.course?.course_name}</td>
                                        <td className="px-4 py-2">{record.validation_status}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground"><Info className="mx-auto h-8 w-8 mb-2" />No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <PaginationLinks links={records.links} />
            </CardContent>
        </Card>
    );
}