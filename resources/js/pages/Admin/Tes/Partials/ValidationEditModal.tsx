import * as React from "react";
import { useForm } from "@inertiajs/react";
import type { AcademicRecord, Course, Major, AcademicYear, Semester, BillingRecord, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
    Avatar, AvatarFallback, AvatarImage,
} from "@/components/ui/avatar";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
    Popover, PopoverContent, PopoverTrigger
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label"; // NEW: Import Label
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Eye, CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns"; // Make sure date-fns is installed
import { route } from "ziggy-js";

// Define the full type for the Academic Record
type AcademicRecordWithRelations = AcademicRecord & {
    course: Course | null;
    major: Major | null;
    academic_year: AcademicYear | null;
    semester: Semester | null;
    billing_record: (BillingRecord & {
        validated_by: User | null;
    }) | null;
};

// Define the component's props
type ValidationEditModalProps = {
    record: AcademicRecordWithRelations;
};

// Helper to format currency
const formatCurrency = (amount: number | string | null | undefined) => {
    const num = parseFloat(String(amount || "0"));
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(num);
};

// Main component
export function ValidationEditModal({ record }: ValidationEditModalProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const billingData = record.billing_record;
    
    // This 'useForm' is from '@inertiajs/react' and is correct
    const { data, setData, patch, processing, errors, reset } = useForm({
        status: billingData?.status || 'Pending',
        remarks: billingData?.remarks || '',
        billing_amount: billingData?.billing_amount || '0.00',
        date_fund_request: billingData?.date_fund_request || null,
        date_sub_aro: billingData?.date_sub_aro || null,
        date_nta: billingData?.date_nta || null,
        date_disbursed_hei: billingData?.date_disbursed_hei || null,
        date_disbursed_grantee: billingData?.date_disbursed_grantee || null,
    });

    // Handle the form submission
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!billingData) return;

        patch(route('billing-records.update', billingData.id), {
            onSuccess: () => {
                setIsOpen(false);
                reset(); // Reset form on success
            },
            preserveScroll: true,
        });
    };

    // Handle user profile avatar
    const validatedBy = billingData?.validated_by;
    const initials = validatedBy?.name.split(' ').map(n => n[0]).join('') || 'NA';
    const avatarUrl = validatedBy
        ? `https://ui-avatars.com/api/?name=${validatedBy.name.split(' ').join('+')}&background=random`
        : '';
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Edit Validation: {record.academic_year?.name} - {record.semester?.name}
                    </DialogTitle>
                    <DialogDescription>
                        Update the billing and validation details for this semester.
                    </DialogDescription>
                </DialogHeader>

                {/* Profile/User Section */}
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Avatar>
                        <AvatarImage src={avatarUrl} alt={validatedBy?.name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {billingData?.status === 'Validated' ? "Validated By" : "Status"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {billingData?.status === 'Validated' ? validatedBy?.name : (billingData?.status || 'Pending')}
                        </p>
                    </div>
                </div>

                {/* The Edit Form (MANUAL, no shadcn/Form) */}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Status Select */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status (FOR VALIDATION)</Label>
                            <Select onValueChange={(value) => setData('status', value)} defaultValue={data.status}>
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="On-going">On-going</SelectItem>
                                    <SelectItem value="Validated">Validated</SelectItem>
                                    <SelectItem value="Delisted">Delisted</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-sm text-red-600">{errors.status}</p>}
                        </div>
                        
                        {/* Billing Amount Input */}
                        <div className="space-y-2">
                            <Label htmlFor="billing_amount">Billing Amount</Label>
                            <Input 
                                id="billing_amount"
                                type="number" 
                                step="0.01" 
                                placeholder="10000.00" 
                                value={data.billing_amount}
                                onChange={(e) => setData('billing_amount', e.target.value)}
                            />
                            {errors.billing_amount && <p className="text-sm text-red-600">{errors.billing_amount}</p>}
                        </div>
                    </div>

                    {/* Date Pickers */}
                    <div className="grid grid-cols-2 gap-4">
                        <DatePickerField 
                            label="Date of Fund Request"
                            value={data.date_fund_request ? new Date(data.date_fund_request) : undefined}
                            onChange={(date) => setData('date_fund_request', date ? format(date, 'yyyy-MM-dd') : null)}
                            error={errors.date_fund_request}
                        />
                        <DatePickerField 
                            label="Date of Sub-ARO"
                            value={data.date_sub_aro ? new Date(data.date_sub_aro) : undefined}
                            onChange={(date) => setData('date_sub_aro', date ? format(date, 'yyyy-MM-dd') : null)}
                            error={errors.date_sub_aro}
                        />
                        <DatePickerField 
                            label="Date of NTA"
                            value={data.date_nta ? new Date(data.date_nta) : undefined}
                            onChange={(date) => setData('date_nta', date ? format(date, 'yyyy-MM-dd') : null)}
                            error={errors.date_nta}
                        />
                        <DatePickerField 
                            label="Disbursed to HEI"
                            value={data.date_disbursed_hei ? new Date(data.date_disbursed_hei) : undefined}
                            onChange={(date) => setData('date_disbursed_hei', date ? format(date, 'yyyy-MM-dd') : null)}
                            error={errors.date_disbursed_hei}
                        />
                        <DatePickerField 
                            label="Disbursed to Grantee"
                            value={data.date_disbursed_grantee ? new Date(data.date_disbursed_grantee) : undefined}
                            onChange={(date) => setData('date_disbursed_grantee', date ? format(date, 'yyyy-MM-dd') : null)}
                            error={errors.date_disbursed_grantee}
                        />
                    </div>
                    
                    {/* Remarks Textarea */}
                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks</Label>
                        <Textarea 
                            id="remarks"
                            placeholder="Add remarks (e.g., for Delisted status)" 
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                        />
                        {errors.remarks && <p className="text-sm text-red-600">{errors.remarks}</p>}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Helper component for date fields (MODIFIED)
function DatePickerField({ label, value, onChange, error }: { label: string, value?: Date, onChange: (date?: Date) => void, error?: string }) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full pl-3 text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        {value ? (
                            format(value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onChange}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}