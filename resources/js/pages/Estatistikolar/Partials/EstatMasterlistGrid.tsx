import React, { useState } from 'react';
import { route } from 'ziggy-js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, FileText, List } from 'lucide-react';
import { PaginationLinks } from '@/components/ui/PaginationLinks';

export function EstatMasterlistGrid({ records, filters }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="flex gap-2"><List className="text-blue-600"/> Masterlist View</CardTitle>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.open(route('admin.estatskolar.export.excel', filters))}>
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600"/> Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(route('admin.estatskolar.export.pdf', filters))}>
                        <FileText className="h-4 w-4 mr-2 text-red-600"/> PDF
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Award No.</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>HEI</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Groups</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.data.map((rec: any) => {
                            const scholar = rec.enrollment?.scholar || {};
                            return (
                                <TableRow key={rec.id}>
                                    <TableCell className="font-mono">{rec.enrollment?.award_number || '-'}</TableCell>
                                    <TableCell className="font-medium uppercase">{scholar.family_name}, {scholar.given_name}</TableCell>
                                    <TableCell className="truncate max-w-[200px]">{rec.hei?.hei_name || '-'}</TableCell>
                                    <TableCell className="truncate max-w-[150px]">{rec.course?.course_name || '-'}</TableCell>
                                    <TableCell><Badge variant="outline">{rec.enrollment?.status}</Badge></TableCell>
                                    <TableCell className="flex gap-1">
                                        {scholar.is_pwd === 1 && <Badge className="bg-orange-100 text-orange-800">PWD</Badge>}
                                        {scholar.is_solo_parent === 1 && <Badge className="bg-purple-100 text-purple-800">Solo</Badge>}
                                        {scholar.is_ip === 'Yes' && <Badge className="bg-green-100 text-green-800">IP</Badge>}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {records.links && <div className="p-4 border-t"><PaginationLinks links={records.links} /></div>}
            </CardContent>
        </Card>
    );
}