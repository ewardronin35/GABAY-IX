import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond/dist/filepond.min.css';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

registerPlugin(FilePondPluginFileValidateType);

export function EstatImportForm() {
    // ✅ Simplified server config
    const filepondServerConfig = {
        process: {
            url: route('superadmin.estatskolar.import'), // Sends to your simplified import route
            headers: { 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content },
            // ⛔️ No 'ondata' needed, we are not sending a 'type'
            onload: (response: any) => { 
                const res = JSON.parse(response);
                toast.success(res.message || "File uploaded! Processing has begun."); 
                return response; 
            },
            onerror: (response: any) => { 
                toast.error("Upload failed."); 
                return response; 
            },
        },
        revert: null,
    };

    return (
        // ✅ Simplified to one Card and one FilePond instance
        <Card>
            <CardHeader>
                <OfficialHeader title="E-STAT Import" />
                <CardDescription>
                    Upload a single Excel file containing the "E-1_Beneficiaries" 
                    and "E-2_Transaction and Monitoring" sheets.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FilePond
                    name="file"
                    server={filepondServerConfig}
                    acceptedFileTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv']}
                    labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                    credits={false}
                />
            </CardContent>
        </Card>
    );
}