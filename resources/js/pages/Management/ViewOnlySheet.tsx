import { FullFinancialRequest, Attachment, FinancialRequestLog } from "@/types"; // ✨ Now this works!
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
    History, // ✨ Add History icon
} from "lucide-react";
import { OfficialHeader } from "@/components/ui/OfficialHeader";
import { cn } from "@/lib/utils";

// --- Helper functions ---
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
    return `/storage/${path.replace('private/', 'public/')}`;
}

// --- Stepper Helper Components ---
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

// --- MAIN VIEW ONLY COMPONENT ---
export function ViewOnlySheet({ request }: { request: FullFinancialRequest }) {
    
    // Make sure your controller is sending `logs.user`
    // In FinancialRequestController.php -> managementViewAll, make sure you have:
    // $financialRequest->load('user', 'attachments', 'logs.user');

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
                                {request.status.replace(/_/g, ' ')}
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

                {/* ✨ --- NEW AUDIT LOG CARD --- ✨ */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><History className="mr-2 h-4 w-4" />Audit Log</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {request.logs && request.logs.length > 0 ? request.logs.map((log: FinancialRequestLog) => (
                                <li key={log.id} className="text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-semibold capitalize">
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDateTime(log.created_at)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        by {log.user ? log.user.name : 'System'}
                                    </div>
                                    {log.remarks && (
                                        <p className="mt-1 p-2 text-xs bg-muted rounded italic">
                                            "{log.remarks}"
                                        </p>
                                    )}
                                </li>
                            )) : (
                                <li className="text-sm text-muted-foreground">No log history available.</li>
                            )}
                        </ul>
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
                            {request.attachments.length > 0 ? request.attachments.map((att: Attachment) => (
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
        </>
    );
}