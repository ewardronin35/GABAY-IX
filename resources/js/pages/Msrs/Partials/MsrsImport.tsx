import React, { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { FileUp, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Register the validation plugin
registerPlugin(FilePondPluginFileValidateType);

export function MsrsImport() {
    const [files, setFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    const handleImport = () => {
        if (files.length === 0) {
            toast.error("Please select a file first.");
            return;
        }

        const formData = new FormData();
        // FilePond stores the actual file object in the .file property
        formData.append('file', files[0].file);

        setUploading(true);
        
        router.post(route('admin.msrs.import'), formData, {
            onSuccess: () => {
                setUploading(false);
                setFiles([]); // Clear filepond
                toast.success("MSRS Masterlist imported successfully!");
            },
            onError: (errors) => {
                setUploading(false);
                toast.error("Import failed. Please check the file format.");
                console.error(errors);
            },
            forceFormData: true,
        });
    };

    return (
        <Card className="max-w-2xl mx-auto mt-6 border shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-5 w-5 text-blue-600" />
                    Import MSRS Masterlist
                </CardTitle>
                <CardDescription>
                    Upload the consolidated Excel file to update scholar records, grades, and financial history.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Instructions / Warning */}
                <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Format Requirement</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                        Ensure the file follows the standard MSRS wide-format template. 
                        Data should start at <strong>Row 11</strong>. 
                        Historical columns (2021-2026) will be parsed automatically.
                    </AlertDescription>
                </Alert>

                {/* FilePond Uploader */}
                <div className="filepond-wrapper">
                    <FilePond
                        files={files}
                        onupdatefiles={setFiles}
                        allowMultiple={false}
                        maxFiles={1}
                        name="file"
                        labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                        acceptedFileTypes={[
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                            'application/vnd.ms-excel', // .xls
                            'text/csv' // .csv
                        ]}
                        credits={false} 
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <Button 
                        variant="outline" 
                        onClick={() => setFiles([])} 
                        disabled={files.length === 0 || uploading}
                    >
                        Clear
                    </Button>
                    <Button 
                        onClick={handleImport} 
                        disabled={files.length === 0 || uploading}
                        className="min-w-[120px]"
                    >
                        {uploading ? (
                            <>Processing...</>
                        ) : (
                            <>
                                <FileUp className="mr-2 h-4 w-4" /> Start Import
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
            
            {/* Optional: Add custom styles for FilePond within this component if needed */}
            <style>{`
                .filepond--panel-root {
                    background-color: #f8fafc;
                    border: 1px dashed #cbd5e1;
                }
                .dark .filepond--panel-root {
                    background-color: #18181b;
                    border-color: #27272a;
                }
                .filepond--drop-label {
                    color: #64748b;
                }
                .dark .filepond--drop-label {
                    color: #a1a1aa;
                }
            `}</style>
        </Card>
    );
}