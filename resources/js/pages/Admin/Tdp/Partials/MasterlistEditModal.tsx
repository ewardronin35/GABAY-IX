import * as React from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PenLine, Save, User, GraduationCap, Building2, Hash } from "lucide-react";
import { route } from "ziggy-js";
import { Separator } from "@/components/ui/separator";

// Type definition to match the grid data
type TdpRowData = {
    id: number;
    enrollment?: {
        id: number;
        status?: string;
        award_number?: string;
        scholar?: {
            id: number;
            family_name?: string;
            given_name?: string;
            middle_name?: string;
        };
    };
    hei?: {
        id?: number;
        hei_name?: string;
    };
    course?: {
        id?: number;
        course_name?: string;
    };
};

type MasterlistEditModalProps = {
    record: TdpRowData;
};

export function MasterlistEditModal({ record }: MasterlistEditModalProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    
    // Determine which ID to update (Enrollment or AcademicRecord)
    // Usually, we update the AcademicRecord which links everything
    const recordId = record.id;

    const { data, setData, patch, processing, errors, reset } = useForm({
        award_number: record.enrollment?.award_number || '',
        status: record.enrollment?.status || 'Enrolled',
        course_name: record.course?.course_name || '',
        hei_name: record.hei?.hei_name || '',
        // Add other editable fields here
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Assuming you have a route to update the academic record
        // You might need to create this route in web.php: Route::patch('/academic-records/{id}', ...)
        patch(route('academic-records.update', recordId), {
            onSuccess: () => {
                setIsOpen(false);
                reset(); 
            },
            preserveScroll: true,
        });
    };

    // Helper to construct full name
    const scholarName = [
        record.enrollment?.scholar?.family_name,
        record.enrollment?.scholar?.given_name
    ].filter(Boolean).join(", ") || "Unknown Student";

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                    <PenLine className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                </Button>
            </DialogTrigger>
            
            {/* Use bg-background/text-foreground for Dark Mode support */}
            <DialogContent className="sm:max-w-[500px] bg-background text-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        Edit Scholar Details
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Update basic enrollment information for this scholar.
                    </DialogDescription>
                </DialogHeader>

                {/* READ-ONLY SUMMARY HEADER */}
                <div className="bg-muted/50 p-4 rounded-lg border border-border space-y-3 mb-4">
                    <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
                        <User className="h-4 w-4 text-primary" />
                        {scholarName}
                    </div>
                    <Separator className="bg-border" />
                    <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5" />
                            <span className="truncate">{record.hei?.hei_name || "No HEI Assigned"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span className="truncate">{record.course?.course_name || "No Course Assigned"}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Award Number */}
                    <div className="space-y-2">
                        <Label htmlFor="award_number" className="text-foreground">Award Number</Label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="award_number"
                                className="pl-9 bg-background border-input text-foreground"
                                placeholder="e.g. NOA-2025-001"
                                value={data.award_number}
                                onChange={(e) => setData('award_number', e.target.value)}
                            />
                        </div>
                        {errors.award_number && <p className="text-xs text-destructive">{errors.award_number}</p>}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-foreground">Enrollment Status</Label>
                        <Select onValueChange={(value) => setData('status', value)} defaultValue={data.status}>
                            <SelectTrigger id="status" className="bg-background border-input text-foreground">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover text-popover-foreground border-border">
                                <SelectItem value="Enrolled">Enrolled</SelectItem>
                                <SelectItem value="Dropped">Dropped</SelectItem>
                                <SelectItem value="Graduated">Graduated</SelectItem>
                                <SelectItem value="LOA">Leave of Absence</SelectItem>
                                <SelectItem value="Deceased">Deceased</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="text-xs text-destructive">{errors.status}</p>}
                    </div>

                    {/* Add more fields like Course/HEI dropdowns here if you pass the lists */}

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="border-input text-foreground hover:bg-muted">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {processing ? (
                                <span className="flex items-center gap-2">Saving...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Save className="h-4 w-4" /> Save Changes</span>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}