import React from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'; 
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css';
import { FilePondFile } from 'filepond'; // Import the type

// Register the plugins
registerPlugin(
    FilePondPluginImagePreview, 
    FilePondPluginFileValidateType,
    FilePondPluginFileValidateSize 
);

// Define the expected props
interface FilePondUploaderProps {
    files: any[]; 
    onUpdateFiles: (fileItems: any[]) => void;
    
    // ✨ 1. ADD NEW PROPS FOR EVENTS
    onProcessFile: (error: any, file: FilePondFile) => void;
    onRemoveFile: (error: any, file: FilePondFile) => void;

    maxFiles?: number;
    allowMultiple?: boolean;
    labelIdle?: string;
    acceptedFileTypes?: string[];
    maxFileSize?: string; 
}

const FilePondUploader: React.FC<FilePondUploaderProps> = ({ 
    files, 
    onUpdateFiles, 
    onProcessFile, // ✨ 2. Get the new prop
    onRemoveFile,  // ✨ 3. Get the new prop
    maxFiles = 5, 
    allowMultiple = true, 
    labelIdle = 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
    acceptedFileTypes = ['image/png', 'image/jpeg', 'application/pdf'],
    maxFileSize = '3MB'
}) => {
    
    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfTokenMeta ? csrfTokenMeta.getAttribute('content') : null;

    if (!csrfToken) {
        console.error('CSRF token not found!');
        return <div>Error: CSRF token missing. File uploads will fail.</div>;
    }

    return (
        <FilePond
            files={files}
            onupdatefiles={onUpdateFiles} 
            allowMultiple={allowMultiple}
            maxFiles={maxFiles}
            
            // ✨ 4. PASS PROPS TO FILEPOND
            onprocessfile={onProcessFile}
            onremovefile={onRemoveFile}

            server={{
                process: {
                    url: '/uploads/process',
                    method: 'POST',
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    onload: (response) => {
                        console.log('FilePondUploader: server "onload" fired. Response:', response);
                        return response; 
                    },
                    onerror: (response) => {
                        console.error('FilePondUploader: server "onerror" fired. Response:', response);
                        return response;
                    },
                },
                revert: {
                    url: '/uploads/revert',
                    method: 'DELETE',
                    headers: { 'X-CSRF-TOKEN': csrfToken },
                    onerror: (response) => {
                         console.error('FilePond revert error:', response);
                    },
                },
            }}
            
            name="attachments" 
            labelIdle={labelIdle}
            acceptedFileTypes={acceptedFileTypes}
            maxFileSize={maxFileSize}
            labelMaxFileSizeExceeded="File is too large"
            labelMaxFileSize="Maximum file size is {filesize}"
        />
    );
};

export default FilePondUploader;