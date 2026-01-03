import { useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner"; 
import { route } from "ziggy-js";

type ValidationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    enrollmentId: number;
};

export function ValidationModal({ isOpen, onClose, enrollmentId }: ValidationModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async () => {
        setIsSubmitting(true);
        try {
            await axios.post(route('superadmin.validation.approve', enrollmentId));
            toast.success("Scholar record validated successfully");
            
            // Refresh the page data
            router.reload({ only: ['scholars'] });
            onClose();
        } catch (error: any) {
            toast.error("Failed to validate record");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Confirm Validation
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to validate this scholar's record? 
                        <br />
                        This will mark them as eligible for NOA generation.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="rounded-md bg-blue-50 p-4 border border-blue-100 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-600 shrink-0" />
                        <div className="text-sm text-blue-700">
                            <p className="font-semibold">Automatic Validation</p>
                            <p>By clicking approve, you confirm that you have manually verified the scholar's details. No document upload is required.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-end">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleApprove} 
                        disabled={isSubmitting} 
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Validating...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Approve & Validate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}