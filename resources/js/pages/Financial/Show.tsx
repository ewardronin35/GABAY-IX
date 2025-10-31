import AppLayout from "@/layouts/app-layout";
import { PageProps, User, Attachment } from "@/types"; // Make sure to export Attachment type from @/types
import { Head, Link } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { route } from "ziggy-js";
import { Label } from "@/components/ui/label";
import { Paperclip } from "lucide-react";

// Define the shape of the full request
interface FinancialRequest {
    id: number;
    title: string;
    request_type: string;
    amount: number;
    description: string;
    status: string;
    remarks: string | null;
    created_at: string;
    budget_approved_at: string | null;
    accounting_approved_at: string | null;
    cashier_paid_at: string | null;
    user: User;
    attachments: Attachment[];
}

interface ShowPageProps extends PageProps {
    request: FinancialRequest;
    auth: { user: User };
}

// Helper to format currency and dates
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};
const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
};

export default function Show({ auth, request }: ShowPageProps) {
    
    // We need a route to download attachments
    // For now, let's assume a route 'attachments.download'
    // This is just a placeholder path!
    const getAttachmentUrl = (path: string) => {
        // In a real app, you'd have a secure download route
        return `/storage/${path}`; 
    }

    return (
        <AppLayout user={auth.user} page_title="Request Details">
            <Head title={`Request: ${request.title}`} />
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Back Button */}
                    <Button variant="outline" asChild>
                        <Link href={route('financial.index')}>&larr; Back to All Requests</Link>
                    </Button>

                    {/* Main Details Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{request.title}</CardTitle>
                            <CardDescription>
                                Submitted by {request.user.name} on {formatDate(request.created_at)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Status</Label>
                                    <Badge variant={request.status === 'rejected' ? 'destructive' : 'default'} className="text-base">
                                        {request.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <Label>Type</Label>
                                    <p>{request.request_type}</p>
                                </div>
                                <div>
                                    <Label>Amount</Label>
                                    <p className="font-semibold">{formatCurrency(request.amount)}</p>
                                </div>
                            </div>
                            
                            {request.description && (
                                <div>
                                    <Label>Description / Purpose</Label>
                                    <p className="p-3 bg-muted rounded-md">{request.description}</p>
                                </div>
                            )}

                            {request.status === 'rejected' && request.remarks && (
                                <div>
                                    <Label className="text-destructive">Rejection Remarks</Label>
                                    <p className="p-3 bg-destructive/10 text-destructive rounded-md italic">
                                        "{request.remarks}"
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card>
                        <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Submitted:</strong> {formatDate(request.created_at)}</p>
                            <p><strong>Budget Approved:</strong> {formatDate(request.budget_approved_at)}</p>
                            <p><strong>Accounting Approved:</strong> {formatDate(request.accounting_approved_at)}</p>
                            <p><strong>Paid by Cashier:</strong> {formatDate(request.cashier_paid_at)}</p>
                        </CardContent>
                    </Card>

                    {/* Attachments Card */}
                    <Card>
                        <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
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
                                    <p>No attachments were submitted.</p>
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}