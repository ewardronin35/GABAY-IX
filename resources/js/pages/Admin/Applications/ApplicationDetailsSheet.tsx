import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { type ScholarshipApplication } from './Columns';
import { Badge } from '@/components/ui/badge';
import { File } from 'lucide-react';

// Helper component to avoid repetitive code
const DetailRow = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value || 'N/A'}</p>
    </div>
);

const DocumentLink = ({ label, path }: { label: string; path: string | null | undefined }) => (
    <a
        href={path ? `/storage/${path}` : '#'}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2 text-sm p-2 rounded-md ${path ? 'text-primary hover:bg-accent' : 'text-muted-foreground cursor-not-allowed'}`}
    >
        <File className="h-4 w-4" />
        <span>{label}</span>
        {!path && <Badge variant="outline">Not Submitted</Badge>}
    </a>
);

export function ApplicationDetailsSheet({
    isOpen,
    setIsOpen,
    application,
}: {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    application: ScholarshipApplication | null;
}) {
    if (!application) return null;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Application Details</SheetTitle>
                    <SheetDescription>Reviewing application for <span className="font-bold">{application.user.name}</span>.</SheetDescription>
                </SheetHeader>
                <div className="space-y-6 py-6">
                    {/* --- Personal Information --- */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailRow label="Full Name" value={`${application.first_name} ${application.last_name}`} />
                            <DetailRow label="Email" value={application.user.email} />
                            <DetailRow label="Birthdate" value={new Date(application.birthdate).toLocaleDateString()} />
                            <DetailRow label="Sex" value={application.sex} />
                        </div>
                    </div>

                    {/* --- Family Background --- */}
                    <div className="space-y-4 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Family Background</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <DetailRow label="Father's Name" value={application.father_name} />
                           <DetailRow label="Mother's Name" value={application.mother_name} />
                           <DetailRow label="Parents' Combined Income" value={`₱${Number(application.parents_combined_income).toLocaleString()}`} />
                        </div>
                    </div>
                    
                    {/* --- Submitted Documents --- */}
                    <div className="space-y-2 p-4 border rounded-lg">
                        <h3 className="font-semibold text-lg">Submitted Documents</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                           <DocumentLink label="Birth Certificate" path={application.doc_birth_certificate} />
                           <DocumentLink label="Certificate of Good Moral" path={application.doc_good_moral} />
                           <DocumentLink label="Report Card" path={application.doc_report_card} />
                           <DocumentLink label="Proof of Income" path={application.doc_proof_of_income} />
                           {/* ... add other DocumentLink components here */}
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}