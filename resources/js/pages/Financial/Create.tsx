import AppLayout from "@/layouts/app-layout";
import { PageProps, User } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {route } from 'ziggy-js';
import InputError from "@/components/input-error";
import FilePondUploader from "@/components/FilePondUploader";
import { useState, useEffect, FormEventHandler } from "react";
import { FilePondFile } from 'filepond';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

// Define Request Types
const requestTypes = ["Reimbursement", "Cash Advance", "Liquidation"];

export default function Create({ auth }: PageProps<{ auth: { user: User } }>) {
    const [files, setFiles] = useState<FilePondFile[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    const { data, setData, post, processing, errors, reset } = useForm({
        title: "",
        request_type: "",
        amount: "",
        description: "",
        attachments: [] as string[], // This will be managed by our new events
    });

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

   const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        console.log('Submitting data:', data); // This will now be correct
        post(route('financial.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setFiles([]);
            },
            onError: (formErrors) => {
                console.error("Form submission errors:", formErrors);
            }
        });
    };
    
    // ✨ 1. ADD EVENT HANDLER FOR FILE PROCESS
    const handleProcessFile = (error: any, file: FilePondFile) => {
        if (!error) {
            console.log('handleProcessFile: SUCCESS. ServerId:', file.serverId);
            // Add the new serverId to our form data
            setData(currentData => ({
                ...currentData,
                attachments: [...currentData.attachments, file.serverId]
            }));
        } else {
            console.error('handleProcessFile: ERROR', error);
        }
    };

    // ✨ 2. ADD EVENT HANDLER FOR FILE REMOVE
    const handleRemoveFile = (error: any, file: FilePondFile) => {
        if (!error) {
            console.log('handleRemoveFile: REMOVED. ServerId:', file.serverId);
            // Remove the serverId from our form data
            setData(currentData => ({
                ...currentData,
                attachments: currentData.attachments.filter(id => id !== file.serverId)
            }));
        } else {
            console.error('handleRemoveFile: ERROR', error);
        }
    };

    const formattedDateTime = currentTime.toLocaleString('en-US', {
         weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
         hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true
    });

    const isUploading = files.some(file => [1, 2, 3, 7].includes(file.status));
    const userRoles = (auth.user.roles as string[]) || [];

    return (
        <AppLayout user={auth.user} page_title="Submit Financial Request">
            <Head title="Submit Financial Request" />
            <div className="py-12">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Submit Financial Request</CardTitle>
                                <CardDescription className="flex justify-between items-center">
                                    <span>Fill out the form below and attach supporting documents (PDF, PNG, JPG).</span>
                                    <span className="text-sm text-muted-foreground">{formattedDateTime}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* ... (All your form fields remain here) ... */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="user_name">Requested By</Label>
                                        <Input
                                            id="user_name"
                                            value={auth.user.name}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="user_role">User Role</Label>
                                        <Input
                                            id="user_role"
                                            value={userRoles.join(', ')}
                                            readOnly
                                            className="bg-muted"
                                        />
                                    </div>
                                </div>
                                <hr/>
                                <div>
                                    <Label htmlFor="request_type">Type of Request</Label>
                                    <Select
                                        required
                                        onValueChange={(value) => setData('request_type', value)}
                                        value={data.request_type}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select request type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {requestTypes.map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.request_type} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="title">Payee</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.title} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="amount">Proposed Amount (PHP)</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.amount} className="mt-2" />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description / Purpose (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <Label>Attachments (Required)</Label>
                                    <FilePondUploader
                                        files={files}
                                        
                                        // ✨ 3. UPDATE onUpdateFiles
                                        // This just updates the visual state
                                        onUpdateFiles={(fileItems: FilePondFile[]) => {
                                            setFiles(fileItems);
                                        }}
                                        
                                        // ✨ 4. PASS THE NEW HANDLERS
                                        onProcessFile={handleProcessFile}
                                        onRemoveFile={handleRemoveFile}
                                    />
                                    <InputError message={errors.attachments || (errors['attachments.0'] ? 'Please upload at least one valid file.' : '')} className="mt-2" />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                 <Link href={route('dashboard')} className="text-sm text-gray-600 hover:underline">
                                     Cancel
                                 </Link>

                               <Button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        isUploading ||
                                        data.attachments.length === 0 || // This check is now 100% reliable
                                        !data.request_type
                                    }
                                >
                                    {processing ? 'Submitting...' : (isUploading ? 'Uploading...' : 'Submit to Budget')}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}