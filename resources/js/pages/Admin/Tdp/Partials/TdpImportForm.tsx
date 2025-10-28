import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

// Register the plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

export function TdpImportForm() {
    return (
        <Card>
            <CardHeader>
                <OfficialHeader title="TDP Import" />
                <CardDescription>
                    Upload an Excel file (.xlsx, .xls) to bulk-import TDP scholar records.
                    Ensure the columns match the required format.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FilePond
                    name="file" // This must match the key in your controller validation
                    server={{
                        url: route('superadmin.tdp.import'),
                        process: {
                            headers: {
                                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
                            },
                            onload: (response) => {
                                const res = JSON.parse(response);
                                toast.success(res.message || "File uploaded successfully!");
                                return response;
                            },
                            onerror: (response) => {
                                const res = JSON.parse(response);
                                toast.error(res.message || "An error occurred.");
                                return response;
                            },
                        },
                    }}
                    acceptedFileTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
                    labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                    credits={false}
                />
            </CardContent>
        </Card>
    );
}