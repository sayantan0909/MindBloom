"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useSupabaseUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Prevent double sync on re-renders
    const hasSynced = useRef(false);

    useEffect(() => {
        const syncUser = async (authUser: User) => {
            const { error } = await supabase.from("profiles").upsert({
                id: authUser.id, // MUST match auth.users.id
                email: authUser.email,
                name: authUser.user_metadata?.name ?? null,
                avatar_url: authUser.user_metadata?.avatar_url ?? null,
                created_at: new Date().toISOString(),
            });

            if (error) {
                console.error("❌ User sync failed:", {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code,
                });
            } else {
                console.log("✅ User saved to database");
            }
        };

        // Initial session load
        supabase.auth.getUser().then(({ data, error }) => {
            if (error) {
                console.error("❌ Failed to get user:", error);
                setLoading(false);
                return;
            }

            setUser(data.user);
            setLoading(false);

            if (data.user && !hasSynced.current) {
                hasSynced.current = true;
                syncUser(data.user);
            }
        });

        // Auth state changes (login / logout)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);

            if (session?.user && !hasSynced.current) {
                hasSynced.current = true;
                syncUser(session.user);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}
