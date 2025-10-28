import React from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType);

// Our component
const Attachments = ({ onUpdateFiles }) => {
    // Correctly get the CSRF token from the meta tag in the document's <head>
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    return (
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Attachments</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-4">
                Upload supporting documents like certificates of appearance, receipts, etc. (Max 10 files)
            </p>
            <FilePond
                allowMultiple={true}
                maxFiles={10}
                name="attachments" // This MUST match the name expected by the Laravel controller
                onupdatefiles={fileItems => {
                    // Filter out null/undefined server IDs before passing them up
                    const fileIds = fileItems
                        .map(fileItem => fileItem.serverId)
                        .filter(id => id !== null);
                    onUpdateFiles(fileIds);
                }}
              server={{
                    // By not providing a 'url' property, FilePond will
                    // use the paths below as the full URL.

                    process: {
                        url: '/uploads/process',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken
                        }
                    },
                    revert: {
                        url: '/uploads/revert',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken
                        }
                    }
                }}
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            />
        </div>
    );
};

export default Attachments;