import React from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond/dist/filepond.min.css';

// It's a good idea to import plugins for file validation, image previews, etc.
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType);

// Our component
const Attachments = ({ onUpdateFiles }) => {

    return (
        <div className="attachments-section" style={{marginTop: '2rem'}}>
            <h3>Attachments</h3>
            <p>Upload supporting documents like certificates of appearance, receipts, etc.</p>
            <FilePond
                allowMultiple={true}
                maxFiles={10}
                name="attachments" // This MUST match the name in the Laravel controller
                onupdatefiles={fileItems => {
                    // Pass the server-generated file IDs up to the parent component
                    const fileIds = fileItems.map(fileItem => fileItem.serverId);
                    onUpdateFiles(fileIds);
                }}
                server={{
                    url: '/api', // Your base API URL
                    process: '/uploads/process',
                    revert: '/uploads/revert',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}' // For Laravel Sanctum or web routes
                    }
                }}
                labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
            />
        </div>
    );
};

export default Attachments;