import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Upload, FileText, AlertCircle, Eye } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import route from "ziggy-js";

// The 5 Requirements you specified
const REQUIRED_DOCUMENTS = [
    { id: 'application_form', label: 'TDP Application Form', description: 'Accomplished form from school office' },
    { id: 'coe', label: 'Proof of Enrollment', description: 'Certified True Copy of COE or COR' },
    { id: 'income_proof', label: 'Proof of Income', description: 'Cert. of Indigency or ITR' },
    { id: 'school_id', label: 'School I.D.', description: 'Back-to-back photocopy' },
    { id: 'id_picture', label: '2x2 ID Picture', description: 'Recent ID picture' },
];

type RequirementProps = {
    enrollmentId: number;
    existingFiles: Record<string, string | null>; // Map of doc_id -> file_url
    validationStatus: string;
};

export function ScholarRequirements({ enrollmentId, existingFiles, validationStatus }: RequirementProps) {
    const [uploading, setUploading] = useState<string | null>(null);

    const handleFileUpload = (docId: string, file: File) => {
        setUploading(docId);
        const formData = new FormData();
        formData.append('document_type', docId);
        formData.append('file', file);
        formData.append('enrollment_id', enrollmentId.toString());

        router.post(route('scholar.requirements.upload'), formData, {
            onSuccess: () => {
                toast.success(`${docId} uploaded successfully`);
                setUploading(null);
            },
            onError: () => {
                toast.error("Upload failed");
                setUploading(null);
            }
        });
    };

    const handleVerify = () => {
        // Logic to mark scholar as "Verified"
        router.post(route('scholar.validate', enrollmentId), {}, {
            onSuccess: () => toast.success("Scholar Verified! NOA can now be generated.")
        });
    };

    // Check if all docs are present
    const allUploaded = REQUIRED_DOCUMENTS.every(doc => existingFiles[doc.id]);
    const isVerified = validationStatus === 'Validated';

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Verification Requirements
                        </CardTitle>
                        <CardDescription>
                            Upload the 5 required documents to validate this scholar.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        {isVerified ? (
                            <Badge variant="success" className="bg-green-600 text-white hover:bg-green-700">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                <AlertCircle className="w-3 h-3 mr-1" /> Pending
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {REQUIRED_DOCUMENTS.map((doc) => {
                    const fileUrl = existingFiles[doc.id];
                    
                    return (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium">{doc.label}</p>
                                    {fileUrl && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                </div>
                                <p className="text-xs text-muted-foreground">{doc.description}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {fileUrl ? (
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                            <Eye className="h-4 w-4 mr-1" /> View
                                        </a>
                                    </Button>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id={`upload-${doc.id}`}
                                            className="hidden"
                                            accept="image/*,.pdf"
                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(doc.id, e.target.files[0])}
                                            disabled={!!uploading}
                                        />
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="h-8"
                                            disabled={!!uploading}
                                            onClick={() => document.getElementById(`upload-${doc.id}`)?.click()}
                                        >
                                            {uploading === doc.id ? '...' : <><Upload className="h-3 w-3 mr-1" /> Upload</>}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4 bg-slate-50 dark:bg-slate-950">
                <p className="text-xs text-muted-foreground">
                    * All documents must be verified before generating NOA.
                </p>
                <div className="flex gap-2">
                    <Button 
                        variant="default" 
                        disabled={!allUploaded || isVerified}
                        onClick={handleVerify}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {isVerified ? 'Scholar Verified' : 'Verify & Approve'}
                    </Button>
                    
                    {/* This button enables ONLY after verification */}
                    <Button 
                        variant="secondary"
                        disabled={!isVerified}
                        onClick={() => router.visit(route('noa.generate', enrollmentId))}
                    >
                        Generate NOA
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}