// resources/js/Pages/Admin/Users/UserSheet.tsx
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useForm } from "@inertiajs/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import 'filepond-plugin-image-crop/dist/filepond-plugin-image-crop.css';
import { type User, type Permission } from "./Columns";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import{ route } from "ziggy-js";

registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType, FilePondPluginImageCrop);

export function UserSheet({
    isOpen,
    setIsOpen,
    user,
    roles,
    allPermissions = []
}: {
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void,
    user?: User | null,
    roles: string[],
    allPermissions?: Permission[]
}) {
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
         _method: 'POST',
        name: '',
        email: '',
        role: '',
        permissions: [] as string[],
        password: '',
        password_confirmation: '',
        avatar: null as File | null,
    });

    const [avatarFiles, setAvatarFiles] = useState<any[]>([]);
    const isEditing = !!user;

    useEffect(() => {
        if (wasSuccessful && !isOpen) {
            reset();
        }
    }, [wasSuccessful, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEditing ? route('superadmin.users.update', user!.id) : route('superadmin.users.store');
        post(url, {
            onSuccess: () => setIsOpen(false),
            onFinish: () => reset('password', 'password_confirmation'),
            preserveScroll: true,
        });
    }

    // ✨ FIX: This useEffect hook now properly handles both creating and editing states.
    useEffect(() => {
        if (isOpen) {
            if (user) { // Logic for EDITING a user
                setData({
                    name: user.name || '',
                    email: user.email || '',
                    role: user.role || '',
                    permissions: user.permissions?.map(p => p.name) || [],
                    password: '',
                    password_confirmation: '',
                    avatar: null,
                    _method: 'POST'
                });
                // ✨ FIX: Simpler method to load the avatar preview directly from the URL.
                if (user.avatar_url) {
                    setAvatarFiles([user.avatar_url]);
                } else {
                    setAvatarFiles([]);
                }
            } else { // Logic for CREATING a new user
                // ✨ FIX: Explicitly clear the form to prevent showing stale data.
                setData({
                    _method: 'POST',
                    name: '',
                    email: '',
                    role: '',
                    permissions: [],
                    password: '',
                    password_confirmation: '',
                    avatar: null,
                });
                setAvatarFiles([]);
            }
        }
    }, [user, isOpen]);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            {/* ... your JSX form ... */}
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditing ? 'Edit User' : 'Add New User'}</SheetTitle>
                    <SheetDescription>
                        {isEditing ? `Update details for ${user?.name}.` : 'Fill out the form to add a new user.'}
                    </SheetDescription>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    {/* --- Top Section: Avatar + User Details --- */}
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <div className="flex-shrink-0 w-32 h-32 mx-auto sm:mx-0">
                            <FilePond
                                files={avatarFiles}
                                onupdatefiles={(fileItems) => {
                                    setAvatarFiles(fileItems);
                                    setData('avatar', fileItems.length ? fileItems[0].file as File : null);
                                }}
                                name="avatar"
                                labelIdle='<span class="filepond--label-action">Upload</span>'
                                allowMultiple={false}
                                stylePanelLayout="compact circle"
                                imagePreviewHeight={128}
                                imageCropAspectRatio={'1:1'}
                                acceptedFileTypes={['image/png', 'image/jpeg']}
                            />
                            {errors.avatar && <p className="text-xs text-red-500 mt-1 text-center">{errors.avatar}</p>}
                        </div>
                        <div className="space-y-4 flex-grow w-full">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select value={data.role || ''} onValueChange={value => setData('role', value)}>
                                    <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
                            </div>
                        </div>
                    </div>

                    {/* --- Permissions Section --- */}
                    <div className="space-y-2">
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 rounded-md border p-4 max-h-48 overflow-y-auto">
                            {allPermissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`perm-${permission.id}`}
                                        checked={data.permissions.includes(permission.name)}
                                        onCheckedChange={(checked) => {
                                            if (checked) setData('permissions', [...data.permissions, permission.name]);
                                            else setData('permissions', data.permissions.filter((p) => p !== permission.name));
                                        }}
                                    />
                                    <label htmlFor={`perm-${permission.id}`} className="text-sm font-medium leading-none">{permission.name}</label>
                                </div>
                            ))}
                        </div>
                        {errors.permissions && <p className="text-sm text-red-500 mt-1">{errors.permissions}</p>}
                    </div>

                    {/* --- Password Section --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} required={!isEditing} />
                            {isEditing && <p className="text-xs text-muted-foreground mt-1">Leave blank to keep current password.</p>}
                            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required={!isEditing} />
                            {errors.password_confirmation && <p className="text-sm text-red-500 mt-1">{errors.password_confirmation}</p>}
                        </div>
                    </div>

                    <Button type="submit" disabled={processing} className="w-full !mt-8">{processing ? 'Saving...' : 'Save User'}</Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}