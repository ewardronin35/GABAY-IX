import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

// FilePond
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginFileValidateType);

export function TesImportForm() {
    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <OfficialHeader title="TES Data Import" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop your Excel file below (.xlsx, .csv). 
                    <br />
                    <span className="text-xs italic opacity-70">
                        Note: Students with "TDP-" Award Numbers will be automatically detected and saved to the TDP program.
                    </span>
                </p>

                <FilePond
                    name="file"
                    server={{
                        process: {
                            url: route('superadmin.tes.upload'),
                            headers: {
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                            },
                            // ✅ FIX: Handle the response properly
                            onload: (response) => {
                                // The server returns the PLAIN TEXT path (e.g., "imports/abc.xlsx").
                                // We return it here so FilePond passes it to 'onprocessfile'
                                return response; 
                            },
                            onerror: (response) => {
                                console.error('Upload Error:', response);
                                // Attempt to parse JSON error if possible, else show generic
                                try {
                                    const err = JSON.parse(response);
                                    toast.error(err.message || "Upload failed.");
                                } catch (e) {
                                    toast.error("Upload failed. Server returned an invalid response.");
                                }
                                return response;
                            },
                        },
                    }}
                    allowMultiple={false}
                    acceptedFileTypes={[
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                        'application/vnd.ms-excel',
                        'text/csv'
                    ]}
                    labelFileTypeNotAllowed="Invalid file type"
                    fileValidateTypeLabelExpectedTypes="Expected .xlsx or .csv"
                    maxFiles={1}
                    labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                    credits={false}
                    
                    // ✅ TRIGGER IMPORT AFTER UPLOAD
                    onprocessfile={(error, file) => {
                        if (error) return;

                        // The 'serverId' contains the path returned by 'onload' above
                        const filePath = file.serverId; 

                        if (!filePath) {
                            toast.error("Error: No file path received from server.");
                            return;
                        }

                        toast.info("Processing import...", { duration: 2000 });

                        router.post(route('superadmin.tes.import'), {
                            file: filePath,
                        }, {
                            onSuccess: () => toast.success("Import started! You will be notified when done."),
                            onError: () => toast.error("Import failed to start."),
                        });
                    }}
                />
            </CardContent>
        </Card>
    );
}