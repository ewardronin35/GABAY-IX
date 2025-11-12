// TdpImportForm.tsx

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
                        process: {
                            // --- ▼▼▼ FIX 1: URL goes INSIDE the process object ---
                            url: route('superadmin.tdp.import'), 
                            headers: {
                                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content
                            },
                            onload: (response) => {
                                // --- ▼▼▼ FIX 2: Safer JSON parsing ---
                                try {
                                    const res = JSON.parse(response as string);
                                    toast.success(res.message || "File uploaded successfully!");
                                } catch (e) {
                                    toast.error("Received an invalid response from server.");
                                    console.error("Failed to parse JSON:", response);
                                }
                                return response;
                            },
                            onerror: (response) => {
                                // --- ▼▼▼ FIX 3: Safer error handling ---
                                let message = "An unknown error occurred.";
                                try {
                                    // Try to parse it as JSON
                                    const res = JSON.parse(response as string);
                                    message = res.message || "An error occurred.";
                                } catch (e) {
                                    // It's not JSON (it's probably HTML), so don't show it.
                                    message = "File upload failed. Server returned an error.";
                                }
                                toast.error(message);
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