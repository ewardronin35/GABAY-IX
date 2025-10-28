import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { OfficialHeader } from '@/components/ui/OfficialHeader';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

// Import FilePond and its styles
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

// Register the necessary plugin
registerPlugin(FilePondPluginFileValidateType);

export function StufapImportForm() {
    // Get the CSRF token from the meta tag to securely upload files
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <OfficialHeader title="StuFAPs Data Import" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                    Drag & drop your "Annex E" Excel file below. The import will be processed in the background after the upload completes.
                </p>
                <FilePond
                    name="file" // This must match the key in your controller's upload() validation
                    server={{
                        process: {
                            url: route('superadmin.stufap.upload'),
                            headers: { 'X-CSRF-TOKEN': csrfToken || '' },
                        },
                        revert: null, // We handle file cleanup on the server side
                    }}
                    acceptedFileTypes={['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
                    labelFileTypeNotAllowed="Invalid file type"
                    fileValidateTypeLabelExpectedTypes="Expected .xlsx or .xls"
                    onprocessfile={(error, file) => {
                        if (error) {
                            toast.error("Upload failed. Please try again.");
                            return;
                        }

                        // The server response (the file path) is the file.serverId
                        const filePath = file.serverId;

                        // Use Inertia router to send the file path to the import endpoint
                        router.post(route('superadmin.stufap.import'), { file: filePath }, {
                            onSuccess: () => toast.success("File received! Processing in the background."),
                            onError: (errs) => {
                                console.error(errs);
                                toast.error("Import failed. Check console for details.");
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