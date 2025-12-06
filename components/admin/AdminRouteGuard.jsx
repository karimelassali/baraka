"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientAuthService } from '../../lib/auth/client-auth';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminRouteGuard({ children, permission }) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        const checkPermission = async () => {
            try {
                const admin = await ClientAuthService.getAdminProfile();

                if (!admin) {
                    router.push('/auth/login');
                    return;
                }

                // Super admin has access to everything
                if (admin.role === 'super_admin') {
                    setIsAuthorized(true);
                    return;
                }

                // Check specific permission
                if (permission && admin.permissions && admin.permissions.includes(permission)) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error('Error checking permissions:', error);
                setIsAuthorized(false);
            }
        };

        checkPermission();
    }, [permission, router]);

    if (isAuthorized === null) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                    <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="max-w-md text-muted-foreground">
                    You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
