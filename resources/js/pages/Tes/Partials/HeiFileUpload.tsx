import { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, CheckCircle2, Cloud, ExternalLink } from "lucide-react"; // Added ExternalLink
import { toast } from "sonner";
import { route } from "ziggy-js";

// FilePond Imports
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

type HeiFileUploadProps = {
    heiId: number;
    documents: any[]; 
};

export function HeiFileUpload({ heiId, documents }: HeiFileUploadProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as any,
        label: "",
    });

    const [files, setFiles] = useState<any[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!files.length) {
            toast.error("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('label', data.label);
        formData.append('file', files[0].file);
        
        post(route("admin.tes.hei.upload", heiId), {
            forceFormData: true,
            onSuccess: () => {
                toast.success("File uploaded to Google Drive!");
                reset();
                setFiles([]); 
            },
            onError: () => toast.error("Failed to upload file."),
        });
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Upload Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Cloud className="w-5 h-5 text-blue-600" />
                        Upload HEI Document (Drive)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="label">Document Label</Label>
                            <Input 
                                id="label"
                                placeholder="e.g., Validation Report Batch 1"
                                value={data.label}
                                onChange={e => setData('label', e.target.value)}
                                disabled={processing}
                            />
                            {errors.label && <span className="text-red-500 text-xs">{errors.label}</span>}
                        </div>

                        <div className="filepond-wrapper">
                            <Label className="mb-2 block">File (PDF/Excel)</Label>
                            <FilePond
                                files={files}
                                onupdatefiles={setFiles}
                                allowMultiple={false}
                                maxFiles={1}
                                name="file"
                                labelIdle='Drag & Drop or <span class="filepond--label-action">Browse</span>'
                                acceptedFileTypes={['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
                                maxFileSize="10MB"
                                onaddfile={(error, file) => {
                                    if (!error) setData("file", file.file);
                                }}
                                onremovefile={() => setData("file", null)}
                            />
                            {errors.file && <span className="text-red-500 text-xs">{errors.file}</span>}
                        </div>

                        <Button type="submit" disabled={processing || files.length === 0} className="w-full">
                            {processing ? "Uploading to Drive..." : "Upload Document"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Document List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    {documents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No documents uploaded yet.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {documents.map((doc) => (
                                <li key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <File className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="truncate">
                                            {/* ✅ FIX: Changed doc.file_name to doc.filename */}
                                            <p className="text-sm font-medium truncate">{doc.filename || doc.file_name}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-2 items-center">
                                        {/* Status Icon */}
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        
                                        {/* Google Drive Link */}
                                        {/* This assumes your file_path is the GDrive File ID */}
                                        {doc.file_path && (
                                            <a 
                                                href={`https://drive.google.com/file/d/${doc.file_path.split('/').pop()}/view`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}