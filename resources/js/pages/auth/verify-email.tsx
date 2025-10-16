import EmailVerificationNotificationController from '@/actions/App/Http/Controllers/Auth/EmailVerificationNotificationController';
import { logout } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const [theme, toggleTheme] = useTheme();

    return (
        <AuthSplitLayout
            title="Verify your email"
            description="Please check your inbox and click on the link we just emailed to you to verify your account."
            logoSrc="/images/Logo.png"
            theme={theme}
            toggleTheme={toggleTheme}
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                    A new verification link has been sent to your email address.
                </div>
            )}

            <Form {...EmailVerificationNotificationController.store.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button disabled={processing} className="w-full">
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Resend verification email
                        </Button>

                        <TextLink href={logout()} className="mx-auto block text-sm">
                            Log out
                        </TextLink>
                    </>
                )}
            </Form>
        </AuthSplitLayout>
    );
}