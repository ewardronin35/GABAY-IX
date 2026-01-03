import { useEffect, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Loader2, ScanEye, AlertCircle, FileText, X, User, GraduationCap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner"; 
import { route } from "ziggy-js";
import { Badge } from "@/components/ui/badge";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginImagePreview);

type ChecklistItem = {
    id: number;
    name: string;
    code: string;
    is_required: boolean;
    status: 'Submitted' | 'Missing';
    file_url?: string;
    file_name?: string;
};

type ValidationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    enrollmentId: number;
};

export function ValidationModal({ isOpen, onClose, enrollmentId }: ValidationModalProps) {
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [student, setStudent] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
    const [hasOcrWarning, setHasOcrWarning] = useState(false);

    useEffect(() => {
        if (isOpen && enrollmentId) {
            fetchChecklist();
        } else {
            setChecklist([]);
            setHasOcrWarning(false);
            setIsLoading(true);
        }
    }, [isOpen, enrollmentId]);

    const fetchChecklist = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('admin.tdp.validation.checklist', enrollmentId));
            setChecklist(response.data.checklist || []);
            setStudent(response.data.student || {});
            setIsComplete(response.data.is_complete || false);
        } catch (error) {
            toast.error("Failed to load data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = () => {
        setIsSubmitting(true);
        router.post(route('admin.tdp.validation.approve', enrollmentId), {}, {
            onSuccess: () => {
                toast.success("Scholar validated successfully!");
                setIsSubmitting(false);
                onClose();
            },
            onError: (err) => {
                setIsSubmitting(false);
                toast.error(err?.props?.flash?.error || "Validation Failed");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Validate Scholar Documents</DialogTitle>
                    <DialogDescription>
                        Verify uploaded files against the student's official records.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-2 pr-2">
                    {/* 🔹 STUDENT INFO CARD */}
                    <div className="bg-slate-50 dark:bg-slate-900 border rounded-lg p-4 mb-4 text-sm">
                        <div className="flex items-center gap-2 mb-3 border-b pb-2">
                            <GraduationCap className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-foreground">Student Information</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            <div><span className="text-muted-foreground">Name:</span> <span className="font-medium block">{student.name}</span></div>
                            <div><span className="text-muted-foreground">School:</span> <span className="font-medium block">{student.school}</span></div>
                            <div><span className="text-muted-foreground">Course:</span> <span className="font-medium block">{student.course}</span></div>
                            <div><span className="text-muted-foreground">Term:</span> <span className="font-medium block">{student.semester}, {student.academic_year}</span></div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>
                    ) : (
                        <div className="space-y-4">
                            {/* 🚩 ERROR MESSAGE IF OCR FAILS */}
                            {hasOcrWarning && (
                                <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Verification Failed</AlertTitle>
                                    <AlertDescription className="text-xs mt-1 leading-relaxed">
                                        Please check the files and make sure it is legitimate with matching names, ID number (for school id), semester, and has signature.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {!isComplete && !hasOcrWarning && (
                                <Alert variant="destructive">
                                    <AlertTitle>Incomplete Requirements</AlertTitle>
                                    <AlertDescription>Please upload all mandatory documents.</AlertDescription>
                                </Alert>
                            )}

                            {isComplete && !hasOcrWarning && (
                                <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
                                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <AlertTitle>Ready for Validation</AlertTitle>
                                    <AlertDescription>All documents verified successfully.</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-3">
                                {checklist.map((item) => (
                                    <div key={item.id} className={`p-3 border rounded-lg bg-card ${item.status !== 'Submitted' ? 'opacity-90' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                {item.status === 'Submitted' ? (
                                                    <div className="relative">
                                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                                        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-950 rounded-full"><ScanEye className="h-3 w-3 text-blue-600" /></div>
                                                    </div>
                                                ) : <AlertCircle className="h-6 w-6 text-amber-500" />}
                                                
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm">{item.name}</p>
                                                        {item.is_required && <Badge variant="secondary" className="text-[10px]">Required</Badge>}
                                                    </div>
                                                    {item.status === 'Submitted' && item.file_url && (
                                                        <a href={item.file_url} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                                            <FileText className="h-3 w-3" /> View Document
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            {activeUploadId !== item.id && (
                                                <Button variant="outline" size="sm" onClick={() => setActiveUploadId(item.id)}>
                                                    {item.status === 'Submitted' ? 'Replace' : 'Upload'}
                                                </Button>
                                            )}
                                        </div>

                                        {activeUploadId === item.id && (
                                            <div className="mt-3 animate-in fade-in zoom-in-95">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs text-muted-foreground">Upload {item.name}</span>
                                                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setActiveUploadId(null)}><X className="h-3 w-3" /></Button>
                                                </div>
                                                <FilePond
                                                    name="file"
                                                    allowMultiple={false}
                                                    acceptedFileTypes={['application/pdf', 'image/jpeg', 'image/png']}
                                                    server={{
                                                        url: route('admin.tdp.validation.upload', enrollmentId),
                                                        process: {
                                                            headers: {
                                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                                                'Accept': 'application/json'
                                                            },
                                                            ondata: (fd) => {
                                                                fd.append('requirement_id', item.id.toString());
                                                                fd.append('requirement_code', item.code);
                                                                return fd;
                                                            },
                                                            onload: (res) => {
                                                                try {
                                                                    const r = JSON.parse(res);
                                                                    if(r.ocr_status === 'verified') {
                                                                        toast.success(r.ocr_message);
                                                                        setHasOcrWarning(false);
                                                                    } else if(r.ocr_status === 'warning') {
                                                                        toast.warning("Document Issue", { description: r.ocr_message, duration: 8000 });
                                                                        setHasOcrWarning(true); // 🚩 Blocks Approval
                                                                    } else {
                                                                        toast.success("Uploaded!");
                                                                        setHasOcrWarning(false);
                                                                    }
                                                                    fetchChecklist();
                                                                    setActiveUploadId(null);
                                                                } catch(e) {}
                                                                return res;
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 mt-2">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Close</Button>
                    <Button 
                        onClick={handleApprove} 
                        // 🚩 STRICT DISABLE: Cannot click if warning exists or incomplete
                        disabled={!isComplete || isSubmitting || hasOcrWarning} 
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Approve & Validate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}