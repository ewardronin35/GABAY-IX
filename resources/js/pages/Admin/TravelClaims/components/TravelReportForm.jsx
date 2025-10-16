// resources/js/pages/Admin/TravelClaims/components/TravelReportForm.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TravelReportForm = ({ itineraryData, appendixBData }) => {
    const [reportData, setReportData] = useState({
        name: '',
        activity_title: '',
        date_of_activity: '',
        venue: '',
        sponsoring_agency: '',
        background: '',
        summary: '',
        takeaways: '',
        recommendations: '',
        noted_by: 'MARIVIC V. IRIBERRI, DPA',
    });

    const reportRef = useRef();

    useEffect(() => {
        // Pre-fill form with data from other tabs
        setReportData(prev => ({
            ...prev,
            name: itineraryData?.name || '',
            activity_title: appendixBData?.purpose || '',
            date_of_activity: appendixBData?.travel_dates || '',
        }));
    }, [itineraryData, appendixBData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReportData(prev => ({ ...prev, [name]: value }));
    };

    const handleExportToPdf = () => {
        const input = reportRef.current;
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('post-travel-report.pdf');
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Post-Travel Report</CardTitle>
                <Button onClick={handleExportToPdf}>Export to PDF</Button>
            </CardHeader>
            <CardContent>
                <div ref={reportRef} className="p-4 bg-white text-black">
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold">POST-TRAVEL REPORT</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Name of Official/Employee</Label>
                                <Input id="name" name="name" value={reportData.name} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="activity_title">Activity/Program Title</Label>
                                <Input id="activity_title" name="activity_title" value={reportData.activity_title} onChange={handleInputChange} />
                            </div>
                        </div>
                        {/* ... Add other input fields for venue, agency etc. here ... */}
                        <div>
                            <Label htmlFor="background">Background/Rationale of the Activity</Label>
                            <Textarea id="background" name="background" value={reportData.background} onChange={handleInputChange} rows={5} />
                        </div>
                        <div>
                            <Label htmlFor="summary">Summary of Proceedings/Discussions</Label>
                            <Textarea id="summary" name="summary" value={reportData.summary} onChange={handleInputChange} rows={8} />
                        </div>
                        {/* ... Add other Textarea fields for takeaways and recommendations ... */}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default TravelReportForm;