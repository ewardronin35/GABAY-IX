import React, { useState, useEffect } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType);

const Attachments = ({ onUpdateFiles, existingFiles = [] }) => {
    // Correctly get the CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // Initialize files state based on what the Parent passed down
    // We map the IDs to the format FilePond expects for pre-loaded files
    const [files, setFiles] = useState(
        existingFiles.map(id => ({
            source: id,
            options: {
                type: 'local', // Tells FilePond this file is already on the server
            },
        }))
    );

    return (
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 shadow-md">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Attachments</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 mb-4">
                Upload supporting documents like certificates of appearance, receipts, etc. (Max 10 files)
            </p>
            <FilePond
                files={files} // <--- BIND STATE HERE
                allowMultiple={true}
                maxFiles={10}
                name="attachments"
                onupdatefiles={fileItems => {
                    // 1. Update local visual state
                    setFiles(fileItems.map(fileItem => fileItem.file));

                    // 2. Extract IDs for the parent form data
                    const fileIds = fileItems
                        .map(fileItem => fileItem.serverId)
                        .filter(id => id !== null);
                    
                    onUpdateFiles(fileIds);
                }}
                server={{
                    process: {
                        url: '/uploads/process',
                        headers: { 'X-CSRF-TOKEN': csrfToken }
                    },
                    revert: {
                        url: '/uploads/revert',
                        headers: { 'X-CSRF-TOKEN': csrfToken }
                    },
                    // OPTIONAL: If you want to show the actual images for pre-loaded files, 
                    // you need a 'load' endpoint in your controller.
                    // load: '/uploads/load/', 
                }}
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            />
        </div>
    );
};

export default Attachments;