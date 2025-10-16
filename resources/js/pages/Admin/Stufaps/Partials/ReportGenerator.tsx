import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { route } from 'ziggy-js';

export function ReportGenerator() {

    const handleGenerate = () => {
        // This constructs the URL to our Laravel endpoint
        const reportUrl = route('superadmin.reports.masterlist');
        
        // Trigger the file download by navigating to the URL
        window.location.href = reportUrl;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Masterlist Report Generator</CardTitle>
                <CardDescription>
                    Generate an official, formatted Masterlist of all scholars in the database.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Generate Official Masterlist</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        This will generate an Excel file (.xlsx) containing all scholars, formatted for submission.
                    </p>
                    <Button onClick={handleGenerate}>
                        <Download className="w-4 h-4 mr-2" />
                        Generate and Download
                    </Button>
                </div>
                {/* Future filtering options will go here */}
            </CardContent>
        </Card>
    );
}