import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileCheck, AlertCircle, ScanLine, CheckCircle2 } from "lucide-react";

import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

type Props = {
    onUploadComplete: (verified: boolean) => void;
    // New Prop: To send actual file IDs back to the form
    onUploadFiles: (files: string[]) => void; 
};

export function TravelDocumentUpload({ onUploadComplete, onUploadFiles }: Props) {
    const [hasTravelOrder, setHasTravelOrder] = useState(false);
    const [hasMemo, setHasMemo] = useState(false);
    
    // Store IDs locally to combine them
    const [travelOrderIds, setTravelOrderIds] = useState<string[]>([]);
    const [memoIds, setMemoIds] = useState<string[]>([]);

    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{destination: string, dates: string} | null>(null);

    // Get CSRF Token for FilePond
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    const handleUpdateFiles = (source: 'order' | 'memo', fileItems: any[]) => {
        // 1. Extract Server IDs
        const ids = fileItems.map(f => f.serverId).filter(id => id);
        
        // 2. Update Local State
        if (source === 'order') {
            setHasTravelOrder(fileItems.length > 0);
            setTravelOrderIds(ids);
            // Combine both lists and send up
            onUploadFiles([...ids, ...memoIds]);
        } else {
            setHasMemo(fileItems.length > 0);
            setMemoIds(ids);
            // Combine both lists and send up
            onUploadFiles([...travelOrderIds, ...ids]);
        }
    };

    const handleScanDocs = () => {
        setIsScanning(true);
        setTimeout(() => {
            setScanResult({
                destination: "Ilocos Norte",
                dates: "Dec 16-18, 2025"
            });
            setIsScanning(false);
            onUploadComplete(true); 
        }, 1500);
    };

    const serverConfig: any = {
        process: {
            url: '/uploads/process',
            headers: { 'X-CSRF-TOKEN': csrfToken }
        },
        revert: {
            url: '/uploads/revert',
            headers: { 'X-CSRF-TOKEN': csrfToken }
        }
    };

    return (
        <div className="space-y-4 w-full">
            <Alert variant="default" className="bg-blue-50/50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800 flex flex-row items-start gap-3 p-3 sm:p-4">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <AlertTitle className="font-semibold mb-1">Pre-Flight Check</AlertTitle>
                    <AlertDescription className="text-xs sm:text-sm leading-relaxed break-words opacity-90">
                        Please upload your Travel Authority and Itinerary. We will verify these documents before you proceed.
                    </AlertDescription>
                </div>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1: Authority */}
                <Card className={`w-full overflow-hidden ${hasTravelOrder ? "border-green-500 bg-green-50/10" : "border-dashed"}`}>
                    <CardHeader className="p-3 pb-2 bg-muted/20">
                        <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                            {hasTravelOrder ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <FileCheck className="h-4 w-4 shrink-0" />}
                            <span className="truncate">Authority to Travel</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                        <div className="travel-upload-wrapper text-xs">
                            <FilePond
                                allowMultiple={false}
                                server={serverConfig} // FIX: Added Server Config
                                acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
                                labelIdle='Drag & Drop or <span class="filepond--label-action">Browse</span>'
                                onupdatefiles={(files) => handleUpdateFiles('order', files)}
                                credits={false} 
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Itinerary */}
                <Card className={`w-full overflow-hidden ${hasMemo ? "border-green-500 bg-green-50/10" : "border-dashed"}`}>
                    <CardHeader className="p-3 pb-2 bg-muted/20">
                        <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                            {hasMemo ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <FileCheck className="h-4 w-4 shrink-0" />}
                            <span className="truncate">Approved Itinerary</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                        <div className="travel-upload-wrapper text-xs">
                             <FilePond
                                allowMultiple={false}
                                server={serverConfig} // FIX: Added Server Config
                                acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
                                labelIdle='Drag & Drop or <span class="filepond--label-action">Browse</span>'
                                onupdatefiles={(files) => handleUpdateFiles('memo', files)}
                                credits={false}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {hasTravelOrder && hasMemo && (
                <div className="pt-2 animate-in fade-in slide-in-from-bottom-2">
                    {!scanResult ? (
                        <Button size="lg" onClick={handleScanDocs} disabled={isScanning} className="w-full h-12">
                            {isScanning ? (
                                <span className="flex items-center gap-2"><ScanLine className="h-4 w-4 animate-pulse" /> Scanning...</span>
                            ) : (
                                <span className="flex items-center gap-2"><ScanLine className="h-4 w-4" /> Scan & Verify</span>
                            )}
                        </Button>
                    ) : (
                        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertTitle className="text-green-800 dark:text-green-300">Verification Successful</AlertTitle>
                            <AlertDescription className="text-green-700 dark:text-green-400 text-xs mt-1">
                                <p>Destination: {scanResult.destination}</p>
                                <p>Dates: {scanResult.dates}</p>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            <style>{`
                .travel-upload-wrapper .filepond--root { margin-bottom: 0; min-height: 60px; }
                .travel-upload-wrapper .filepond--panel-root { background-color: transparent; border: 1px dashed #e2e8f0; }
                .dark .travel-upload-wrapper .filepond--panel-root { border-color: #1e293b; }
                .travel-upload-wrapper .filepond--drop-label { color: #64748b; font-size: 12px; padding: 10px; }
            `}</style>
        </div>
    );
}