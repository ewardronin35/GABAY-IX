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

export function EstatImportForm() {
    const [files, setFiles] = useState<any[]>([]);
    const { data, setData, post, processing, reset } = useForm({ file: null as File | null });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return toast.error("Please select a file.");

        post(route('admin.estatskolar.import'), {
            onSuccess: () => {
                toast.success("Import processing...");
                setFiles([]);
                reset();
            },
            onError: () => toast.error("Import failed."),
        });
    };

    return (
        <Card className="border-dashed border-2">
            <CardHeader>
                <CardTitle className="flex gap-2"><UploadCloud className="text-emerald-600"/> Import Annex E</CardTitle>
                <CardDescription>Upload 'Annex E-1 Beneficiaries' or 'E-2 Monitoring'. The system auto-detects sheets.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <FilePond
                        files={files}
                        onupdatefiles={(items) => {
                            setFiles(items.map(x => x.file));
                            setData('file', items[0]?.file as File || null);
                        }}
                        acceptedFileTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']}
                        labelIdle='Drag & Drop Annex E file here'
                    />
                    <Button type="submit" disabled={processing || !data.file} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        {processing ? 'Uploading...' : 'Start Import'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}