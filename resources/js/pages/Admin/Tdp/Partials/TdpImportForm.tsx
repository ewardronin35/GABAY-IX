// TdpImportForm.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond/dist/filepond.min.css';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

// Register the plugins
registerPlugin(FilePondPluginFileValidateType);

export function TdpImportForm() {
    return (
        <Card>
            <CardHeader>
                <OfficialHeader title="TDP Import" />
                <CardDescription>
                    Upload an Excel file (.xlsx, .xls, .csv) to bulk-import TDP scholar records.
                    Ensure the columns match the required format.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FilePond
                    name="masterlist" // This must match the key in your controller
                    server={{
                        process: {
                            url: route('superadmin.tdp.import'), // The route to post to
                            headers: {
                                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content,
                            },
                            onload: (response) => {
                                try {
                                    const res = JSON.parse(response as string);
                                    if (res.success) {
                                        toast.success("Import Started", {
                                            description: res.success || "Your file is being processed in the background.",
                                        });
                                    } else {
                                        toast.error("Import Failed", {
                                            description: res.error || "The server reported an issue.",
                                        });
                                    }
                                } catch (e) {
                                    toast.error("Import failed to start", {
                                        description: "Received an unexpected response from the server.",
                                    });
                                    console.error("Failed to parse JSON response:", response);
                                }
                                return response;
                            },
                            onerror: (response) => {
                                // --- THIS IS THE FIX ---
                                // The 'response' is likely an HTML error page.
                                // Don't try to parse it. Show a generic error.
                                
                                toast.error("File Upload Failed", {
                                    description: "The server returned an error. Please check the file or contact support.",
                                });

                                // Log the full HTML error to the console for debugging
                                console.error("Server Error Response:", response);
                                
                                return response;
                            },
                        },
                    }}
                    acceptedFileTypes={[
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                        'application/vnd.ms-excel',
                        'text/csv'
                    ]}
                    labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                    credits={false}
                />
            </CardContent>
        </Card>
    );
}