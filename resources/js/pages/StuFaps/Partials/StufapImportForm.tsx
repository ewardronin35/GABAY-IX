import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

// ✅ FilePond Imports
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Register the validation plugin
registerPlugin(FilePondPluginFileValidateType);

export function StuFapsImport() {
    const [files, setFiles] = useState<any[]>([]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UploadCloud className="h-5 w-5" /> Import Data
                </CardTitle>
                <CardDescription>
                    Drag and drop your Excel file here. The import will <strong>start automatically</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <FilePond
                    files={files}
                    onupdatefiles={setFiles}
                    allowMultiple={false}
                    maxFiles={1}
                    // ✅ Validate file types
                    acceptedFileTypes={[
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                        'application/vnd.ms-excel', // .xls
                        'text/csv' // .csv
                    ]}
                    labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                    credits={false} // Hides the "Powered by FilePond" footer
                    
                    // ✅ AUTO-START LOGIC: Triggered immediately when file is dropped
                    onaddfile={(error, fileItem) => {
                        if (error) {
                            toast.error("Invalid file type.");
                            return;
                        }

                        // Prepare Data
                        const formData = new FormData();
                        formData.append('file', fileItem.file as Blob);

                        // Show Loading State
                        const toastId = toast.loading('Uploading and processing data...');

                        // Submit via Inertia
                        // NOTE: Ensure your route is named 'admin.stufaps.import' or update to '/stufaps/import'
                        router.post(route('admin.stufaps.import'), formData, {
                            forceFormData: true,
                            onSuccess: () => {
                                toast.dismiss(toastId);
                                toast.success('Import Successful!', {
                                    description: 'The masterlist has been updated.'
                                });
                                setFiles([]); // Clear the pond for the next file
                            },
                            onError: (err) => {
                                toast.dismiss(toastId);
                                toast.error('Import Failed', {
                                    description: Object.values(err)[0] || 'Check your file format and try again.'
                                });
                                setFiles([]); // Clear the failed file
                            }
                        });
                    }}
                />
            </CardContent>
        </Card>
    );
}