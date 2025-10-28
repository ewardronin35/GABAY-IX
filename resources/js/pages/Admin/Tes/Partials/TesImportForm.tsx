import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { toast } from 'sonner';

// ✅ 1. Import the global Inertia router
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';

// Import FilePond and its styles
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Register the file type validation plugin
registerPlugin(FilePondPluginFileValidateType);

export function TesImportForm() {
    // We no longer need useForm for this component
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <OfficialHeader title="TES Data Import" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop your Excel file below or click to browse. The import will begin automatically after a successful upload.
                </p>

                <FilePond
                    name="file"
                    server={{
                        process: {
                            url: route('superadmin.tes.upload'),
                            headers: { 'X-CSRF-TOKEN': csrfToken || '' },
                        },
                        revert: null,
                    }}
                    acceptedFileTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
                    labelFileTypeNotAllowed="Invalid file type"
                    fileValidateTypeLabelExpectedTypes="Expected .xlsx or .xls"
                    onprocessfile={(error, file) => {
                        if (error) {
                            console.error('FilePond Upload Error:', error);
                            toast.error("Upload failed. Please try again.");
                            return;
                        }

                        // Get the file path from the server's response
                        const filePath = file.serverId;

                        // ✅ 2. Use router.post to send the data directly
                        router.post(route('superadmin.tes.import'), {
                            file: filePath, // Send the path directly
                        }, {
                            onSuccess: () => toast.success("File processed and data is being imported!"),
                            onError: (errs) => {
                                console.error('Inertia Import Error Response:', errs);
                                toast.error("An error occurred while importing. Check console for details.");
                            },
                        });
                    }}
                    maxFiles={1}
                    labelIdle='Drag & Drop your Excel file or <span class="filepond--label-action">Browse</span>'
                />
            </CardContent>
        </Card>
    );
}