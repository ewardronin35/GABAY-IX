import { FullFinancialRequest, Attachment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
    SheetHeader, 
    SheetTitle, 
    SheetDescription 
} from "@/components/ui/sheet";
import { 
    Paperclip, 
    User as UserIcon, 
    CalendarDays, 
    Landmark, 
    Calculator, 
    Receipt, 
    Info,
    Check,
    X,
    FileText,
    AlertTriangle,
} from "lucide-react";
import { OfficialHeader } from "@/components/ui/OfficialHeader";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { route } from "ziggy-js";

// --- ✨ All helper functions from ViewRequestSheet ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};
const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
};
const getAttachmentUrl = (path: string) => {
    return `/storage/${path.replace('private/', 'public/')}`; // Adjust as needed
}

// --- Stepper Helper Components (Unchanged) ---
type StepStatus = "complete" | "active" | "pending";
function StepperStep({ 
    icon, 
    title, 
    status 
}: { 
    icon: React.ReactNode, 
    title: string, 
    status: StepStatus 
}) {
    const isComplete = status === "complete";
    const isActive = status === "active";
    
    return (
        <div className="flex flex-col items-center">
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                isComplete ? "bg-green-500 border-green-500 text-white" : "",
                isActive ? "bg-primary border-primary text-primary-foreground" : "",
                status === "pending" ? "bg-muted border-muted-foreground/30 text-muted-foreground/80" : ""
            )}>
                {isComplete ? <Check className="w-5 h-5" /> : icon}
            </div>
            <p className={cn(
                "text-xs mt-2 font-semibold text-center",
                isActive ? "text-primary" : "",
                status === "pending" ? "text-muted-foreground" : ""
            )}>
                {title}
            </p>
        </div>
    );
}

function RequestStepper({ request }: { request: FullFinancialRequest }) {
    const status = request.status;
    const isRejected = status === 'rejected';

    if (isRejected) {
        return (
            <div className="p-4 my-4 rounded-lg bg-destructive/10 text-destructive text-center">
                <X className="w-8 h-8 mx-auto mb-2" />
                <p className="font-bold text-lg">Request Rejected</p>
            </div>
        );
    }

    const userStatus: StepStatus = "complete";
    const budgetStatus: StepStatus = 
        status === 'pending_budget' ? 'active' :
        (request.budget_approved_at || status === 'pending_accounting' || status === 'pending_cashier' || status === 'completed') ? 'complete' :
        'pending';
    const accountingStatus: StepStatus =
        status === 'pending_accounting' ? 'active' :
        (request.accounting_approved_at || status === 'pending_cashier' || status === 'completed') ? 'complete' :
        'pending';
    const cashierStatus: StepStatus =
        status === 'pending_cashier' ? 'active' :
        status === 'completed' ? 'complete' :
        'pending';

    return (
        <div className="flex items-start p-4 my-4 bg-muted/50 rounded-lg">
            <StepperStep icon={<FileText className="w-5 h-5" />} title="Submitted" status={userStatus} />
            <div className={cn("flex-1 border-b-2 mt-5 mx-2", budgetStatus !== 'pending' ? "border-green-500" : "border-muted-foreground/30 border-dashed")} />
            <StepperStep icon={<Landmark className="w-5 h-5" />} title="Budget" status={budgetStatus} />
            <div className={cn("flex-1 border-b-2 mt-5 mx-2", accountingStatus !== 'pending' ? "border-green-500" : "border-muted-foreground/30 border-dashed")} />
            <StepperStep icon={<Calculator className="w-5 h-5" />} title="Accounting" status={accountingStatus} />
            <div className={cn("flex-1 border-b-2 mt-5 mx-2", cashierStatus !== 'pending' ? "border-green-500" : "border-muted-foreground/30 border-dashed")} />
            <StepperStep icon={<Receipt className="w-5 h-5" />} title="Cashier" status={cashierStatus} />
        </div>
    );
}
// --- END of Stepper Components ---


// --- ✨ NEW MAIN COMPONENT ---
export function CashierApprovalSheet({ request }: { request: FullFinancialRequest }) {
    
    // --- State for actions ---
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Action Handlers ---
    const handleApprove = () => {
        setIsSubmitting(true);
       router.post(route('cashier.pay', request.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleConfirmReject = () => {
        if (!remarks) return;
        setIsSubmitting(true);
     router.post(route('cashier.reject', request.id), { remarks }, {
            preserveScroll: true,
            onFinish: () => {
                setIsSubmitting(false);
                setIsRejectModalOpen(false);
                setRemarks("");
            },
        });
    };

const isActionable = request.status === 'pending_cashier';
    return (
        <>
            <OfficialHeader title="Financial Request Details" />

            <RequestStepper request={request} />

            <SheetHeader className="mt-4 text-left">
                <SheetTitle>{request.title}</SheetTitle>
                <SheetDescription>
                    {request.request_type} &bull; {formatCurrency(request.amount)}
                </SheetDescription>
            </SheetHeader>

            {/* --- ✨ NEW ACTIONS CARD --- */}
         {isActionable && (
                <Card className="my-4 bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center text-green-800">
                            <AlertTriangle className="mr-2 h-4 w-4" />Action Required
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <Button 
                            className="flex-1"
                            size="lg"
                            // ✨ FIX: Use green color for "Pay"
                            variant="success" 
                            onClick={handleApprove} 
                            disabled={isSubmitting}
                        >
                            <Check className="mr-2 h-4 w-4" /> 
                            {/* ✨ FIX: Change text */}
                            Mark as Paid
                        </Button>
                        <Button 
                            className="flex-1"
                            size="lg"
                            variant="destructive"
                            onClick={() => setIsRejectModalOpen(true)}
                            disabled={isSubmitting}
                        >
                            <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4 py-4">
                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Info className="mr-2 h-4 w-4" />Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Label>Current Status:</Label>
                            <Badge variant={request.status === 'rejected' ? 'destructive' : 'default'} className="text-base capitalize">
                                {request.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        {request.status === 'rejected' && request.remarks && (
                            <div>
                                <Label className="text-destructive">Rejection Remarks</Label>
                                <p className="p-3 bg-destructive/10 text-destructive rounded-md italic">
                                    "{request.remarks}"
                                </p>
                            </div>
                        )}
                        {request.description && (
                            <div>
                                <Label>Description / Purpose</Label>
                                <p className="p-3 bg-muted rounded-md">{request.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* History Card */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center"><CalendarDays className="mr-2 h-4 w-4" />Status History</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p className="flex items-center"><UserIcon className="mr-2 h-4 w-4" /><strong>Submitted:</strong> {formatDateTime(request.created_at)}</p>
                        <p className="flex items-center"><Landmark className="mr-2 h-4 w-4" /><strong>Budget Approved:</strong> {formatDateTime(request.budget_approved_at)}</p>
                        <p className="flex items-center"><Calculator className="mr-2 h-4 w-4" /><strong>Accounting Approved:</strong> {formatDateTime(request.accounting_approved_at)}</p>
                        <p className="flex items-center"><Receipt className="mr-2 h-4 w-4" /><strong>Paid by Cashier:</strong> {formatDateTime(request.cashier_paid_at)}</p>
                    </CardContent>
                </Card>

                {/* Attachments Card */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center"><Paperclip className="mr-2 h-4 w-4" />Attachments</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {request.attachments.length > 0 ? request.attachments.map(att => (
                                <li key={att.id}>
                                    <Button variant="outline" asChild>
                                        <a href={getAttachmentUrl(att.filepath)} target="_blank" rel="noopener noreferrer">
                                            <Paperclip className="h-4 w-4 mr-2" />
                                            {att.filename}
                                        </a>
                                    </Button>
                                </li>
                            )) : (
                                <li>
                                    <p>No attachments were submitted.</p>
                                </li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* --- ✨ REJECT MODAL --- */}
            <AlertDialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting this request. This remark
                            will be visible to the user.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="remarks">Rejection Remarks (Required)</Label>
                        <Textarea 
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="e.g., Exceeds department budget..."
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmReject} disabled={!remarks || isSubmitting}>
                            {isSubmitting ? "Submitting..." : "Confirm Rejection"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}