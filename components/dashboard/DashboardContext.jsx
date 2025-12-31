"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { createClient } from '@/lib/supabase/client';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [supabase] = useState(() => createClient());
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error || !data.user) {
                    router.push('/auth/login');
                    return;
                }

                setUser(data.user);

                // Fetch profile data
                const { data: profileData } = await supabase
                    .from('customers')
                    .select('first_name, last_name, barcode_value, email') // Added email just in case
                    .eq('auth_id', data.user.id)
                    .single();

                if (profileData) {
                    setProfile(profileData);
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [router, supabase]);

    return (
        <DashboardContext.Provider value={{ user, profile, loading, supabase }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    return useContext(DashboardContext);
}
