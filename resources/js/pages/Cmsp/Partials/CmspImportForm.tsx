import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

// --- FilePond Imports ---
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

// Register plugins
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

export function CmspImportForm() {
    // Local state for FilePond visual representation
    const [files, setFiles] = useState<any[]>([]);
    
    // Inertia Form Hook
    const { data, setData, post, processing, progress, reset } = useForm({
        file: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return toast.error("Please select a file.");

        post(route('admin.cmsp.import'), {
            onSuccess: () => {
                toast.success("Import queued successfully.");
                setFiles([]); // Clear FilePond UI
                reset();      // Clear Form Data
            },
            onError: () => toast.error("Import failed. Check file format."),
        });
    };

    return (
        <Card className="border-dashed border-2 shadow-none">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UploadCloud className="h-5 w-5 text-amber-600" /> Import CMSP Ranking
                </CardTitle>
                <CardDescription>
                    Upload the 'Ranking Consolidated' <strong>.xlsx</strong> or <strong>.csv</strong> file.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    
                    {/* FilePond Component */}
                    <div className="filepond-wrapper">
                        <FilePond
                            files={files}
                            onupdatefiles={(fileItems) => {
                                // Update local state for FilePond
                                setFiles(fileItems.map((fileItem) => fileItem.file));
                                // Update Inertia form data with the raw file object
                                setData('file', fileItems[0]?.file as File || null);
                            }}
                            allowMultiple={false}
                            maxFiles={1}
                            name="file"
                            labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                            acceptedFileTypes={[
                                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                                'application/vnd.ms-excel', 
                                'text/csv', 
                                'application/csv'
                            ]}
                            credits={false}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Progress Bar (Inertia) */}
                    {progress && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Uploading...</span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                                <div 
                                    className="h-full bg-amber-600 transition-all duration-300 ease-out" 
                                    style={{ width: `${progress.percentage}%` }} 
                                />
                            </div>
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={processing || !data.file} 
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        {processing ? 'Uploading...' : 'Start Import'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}