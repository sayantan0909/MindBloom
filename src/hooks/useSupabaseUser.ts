"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useSupabaseUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Prevent duplicate DB writes
    const hasSynced = useRef(false);

    useEffect(() => {
        const syncUser = async (authUser: User) => {
            const { error } = await supabase.from("users").upsert(
                {
                    auth_user_id: authUser.id, // 🔑 link to auth.users.id
                    email: authUser.email!,
                    name: authUser.user_metadata?.name ?? null,
                    profile_picture: authUser.user_metadata?.avatar_url ?? null,
                    last_login: new Date().toISOString(),
                    is_active: true,
                },
                {
                    onConflict: "auth_user_id",
                }
            );

            if (error) {
                console.error("❌ User sync failed:", error);

            } else {
                console.log("✅ User synced to public.users");
            }
        };

        // Initial session load
        supabase.auth
            .getUser()
            .then(({ data, error }) => {
                if (error) {
                    console.error("❌ Failed to get user:", error);
                    setLoading(false);
                    return;
                }

                setUser(data.user ?? null);
                setLoading(false);

                if (data.user && !hasSynced.current) {
                    hasSynced.current = true;
                    syncUser(data.user);
                }
            });

        // Auth state changes (login / logout / refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);

            if (session?.user && !hasSynced.current) {
                hasSynced.current = true;
                syncUser(session.user);
            }

            if (!session?.user) {
                hasSynced.current = false;
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}
