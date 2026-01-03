import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginFileValidateType);

export function CoschoImportForm() {
    const [files, setFiles] = useState<any[]>([]);
    const { data, setData, post, processing, reset } = useForm({ file: null as File | null });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return toast.error("Please select a file.");

        post(route('admin.coscho.import'), {
            onSuccess: () => {
                toast.success("COSCHO Import started. It may take a while.");
                setFiles([]);
                reset();
            },
            onError: () => toast.error("Import failed."),
        });
    };

    return (
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50 dark:bg-zinc-900/50 dark:border-blue-900">
            <CardHeader>
                <CardTitle className="flex gap-2 text-blue-900 dark:text-blue-100">
                    <UploadCloud className="text-blue-600 dark:text-blue-400"/> 
                    Import COSCHO Masterlist
                </CardTitle>
                <CardDescription className="dark:text-zinc-400">
                    Upload the 'Fund Request' Excel file. The system automatically detects data starting from Row 11.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    {/* Dark Mode FilePond Styles */}
                    <style>{`
                        .filepond--root { font-family: inherit; }
                        .filepond--panel-root { background-color: #fff; }
                        .dark .filepond--panel-root { background-color: #18181b; border: 1px solid #27272a; }
                        .dark .filepond--drop-label { color: #a1a1aa; }
                        .dark .filepond--label-action { color: #3b82f6; text-decoration: underline; }
                        .dark .filepond--item-panel { background-color: #3b82f6; }
                    `}</style>

                    <div className="dark:bg-zinc-950 rounded-lg p-1">
                        <FilePond
                            files={files}
                            onupdatefiles={(items) => {
                                setFiles(items.map(x => x.file));
                                setData('file', items[0]?.file as File || null);
                            }}
                            acceptedFileTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']}
                            labelIdle='Drag & Drop COSCHO Excel File or <span class="filepond--label-action">Browse</span>'
                        />
                    </div>
                    <Button 
                        type="submit" 
                        disabled={processing || !data.file} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                        {processing ? 'Processing Import...' : 'Start Import Process'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}