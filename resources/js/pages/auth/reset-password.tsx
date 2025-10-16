import NewPasswordController from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const [theme, toggleTheme] = useTheme();

    return (
        <AuthSplitLayout
            title="Reset password"
            description="Please enter your new password below"
            logoSrc="/images/Logo.png"
            theme={theme}
            toggleTheme={toggleTheme}
        >
            <Head title="Reset password" />

            <Form
                {...NewPasswordController.store.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="grid gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" name="email" autoComplete="email" value={email} readOnly />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" name="password" autoComplete="new-password" autoFocus placeholder="Password" />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <Input id="password_confirmation" type="password" name="password_confirmation" autoComplete="new-password" placeholder="Confirm password" />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button type="submit" className="mt-4 w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Reset password
                        </Button>
                    </>
                )}
            </Form>
        </AuthSplitLayout>
    );
}