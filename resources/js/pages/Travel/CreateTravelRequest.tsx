import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, MapPin, FileText, Send, AlertCircle, UploadCloud } from "lucide-react";
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { route } from 'ziggy-js';
// FilePond for Memo Upload
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
registerPlugin(FilePondPluginFileValidateType);

export default function CreateTravelRequest({ auth }: any) {
    const { data, setData, post, processing, errors } = useForm({
        destination: '',
        date_from: '',
        date_to: '',
        purpose: '',
        memo_file: null as File | null, // For the uploaded file
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.memo_file) {
            toast.error("Please upload the supporting memo.");
            return;
        }

        // Use post with forceFormData for file uploads
        post(route('travel.requests.store'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success("Travel Authority Request Submitted!");
                // Optional: Redirect to a "My Requests" page
            },
            onError: (err) => {
                console.error(err);
                toast.error("Please check the form for errors.");
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} page_title="Request Authority to Travel">
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Request Authority to Travel
                    </h1>
                    <p className="text-muted-foreground">
                        Submit your travel details and attach the required memo for approval.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Requirement</AlertTitle>
                        <AlertDescription>
                            A signed memo or approved itinerary must be uploaded to proceed.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-indigo-500" /> Travel Details & Memo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-6">
                            
                            {/* Destination */}
                            <div className="space-y-2">
                                <Label htmlFor="destination" className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> Destination
                                </Label>
                                <Input 
                                    id="destination"
                                    placeholder="e.g., CHED Regional Office X, Cagayan de Oro City" 
                                    value={data.destination}
                                    onChange={e => setData('destination', e.target.value)}
                                />
                                {errors.destination && <p className="text-xs text-red-500">{errors.destination}</p>}
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="date_from" className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Date From
                                    </Label>
                                    <Input 
                                        id="date_from"
                                        type="date" 
                                        value={data.date_from}
                                        onChange={e => setData('date_from', e.target.value)} 
                                    />
                                    {errors.date_from && <p className="text-xs text-red-500">{errors.date_from}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_to" className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> Date To
                                    </Label>
                                    <Input 
                                        id="date_to"
                                        type="date" 
                                        value={data.date_to}
                                        onChange={e => setData('date_to', e.target.value)} 
                                    />
                                    {errors.date_to && <p className="text-xs text-red-500">{errors.date_to}</p>}
                                </div>
                            </div>

                            {/* Purpose */}
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose of Travel</Label>
                                <Textarea 
                                    id="purpose"
                                    placeholder="State the specific purpose of your travel..." 
                                    className="min-h-[100px]"
                                    value={data.purpose}
                                    onChange={e => setData('purpose', e.target.value)}
                                />
                                {errors.purpose && <p className="text-xs text-red-500">{errors.purpose}</p>}
                            </div>

                            {/* Memo Upload */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-1">
                                    <UploadCloud className="h-3 w-3" /> Upload Approved Memo (PDF/Image)
                                </Label>
                                <div className="border-2 border-dashed rounded-md p-4 bg-gray-50 dark:bg-gray-900/50">
                                    <FilePond
                                        files={data.memo_file ? [data.memo_file] : []}
                                        onupdatefiles={(fileItems) => {
                                            const file = fileItems[0]?.file;
                                            setData('memo_file', file as File);
                                        }}
                                        allowMultiple={false}
                                        acceptedFileTypes={['application/pdf', 'image/png', 'image/jpeg']}
                                        labelIdle='Drag & Drop your Memo or <span class="filepond--label-action">Browse</span>'
                                        credits={false}
                                    />
                                </div>
                                {errors.memo_file && <p className="text-xs text-red-500">{errors.memo_file}</p>}
                            </div>

                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[150px]">
                            {processing ? 'Submitting...' : (
                                <><Send className="mr-2 h-4 w-4" /> Submit Request</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}