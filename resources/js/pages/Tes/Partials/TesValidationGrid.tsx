import { useState } from "react";
import { router } from "@inertiajs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationLinks } from "@/components/ui/PaginationLinks"; 
import { Search, FileCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { ValidationModal } from "./ValidationModal"; 
import { PaginatedResponse } from "@/types";
import { FileDown } from "lucide-react"; // Import Icon
// This component receives data from the parent Index.tsx
type Props = {
    scholars: PaginatedResponse<any>; // Use your generic type
    filters: { search?: string; status?: string };
};

export default function TdpValidationGrid({ scholars, filters }: Props) {
    const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Reuse the search hook, but pointing to the INDEX route now
    const { search, handleSearch } = useSearch(
        "admin.tdp.index", 
        filters.search || "",
        "search_validation" // Use a unique param name to avoid conflict with other tabs
    );

    const openValidationModal = (enrollment: any) => {
        setSelectedEnrollment(enrollment);
        setIsModalOpen(true);
    };

    return (
        <Card className="border-none shadow-none">
            <CardContent className="p-0">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        {/* Optional: Add sub-filters for the grid here if needed */}
                    </div>
                    <div className="relative w-72">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search pending scholars..."
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)} 
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Scholar Name</TableHead>
                                <TableHead>Award No.</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!scholars.data || scholars.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No pending validations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                scholars.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">
                                            {item.scholar?.family_name}, {item.scholar?.given_name}
                                        </TableCell>
                                        <TableCell>{item.award_number || 'N/A'}</TableCell>
                                        <TableCell>
                                            {item.payment_status === 'Validated' ? (
                                                <Badge className="bg-green-600 hover:bg-green-700">Validated</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="flex w-fit items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Pending Review
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => openValidationModal(item)}
                                                className="gap-2"
                                            >
                                                <FileCheck className="h-4 w-4" />
                                                Validate
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
    {/* 1. Validation Button (Hidden if already validated) */}
    {item.payment_status !== 'Validated' && (
        <Button 
            size="sm" 
            onClick={() => openValidationModal(item)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
            <FileCheck className="h-4 w-4" />
            Validate
        </Button>
    )}

    {/* 2. ✅ NOA Button (Only shows if Validated) */}
    {item.payment_status === 'Validated' && (
        <a href={route('admin.tdp.generate-noa', item.id)} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="gap-2 border-green-600 text-green-600 hover:bg-green-50">
                <FileDown className="h-4 w-4" />
                NOA
            </Button>
        </a>
    )}
</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="mt-4">
                    <PaginationLinks links={scholars.meta?.links || scholars.links || []} />
                </div>

                {selectedEnrollment && (
                    <ValidationModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        enrollmentId={selectedEnrollment.id}
                    />
                )}
            </CardContent>
        </Card>
    );
} 