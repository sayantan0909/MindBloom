"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

export function useSupabaseUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const hasSynced = useRef(false);

    useEffect(() => {
        const syncUser = async (authUser: User) => {
            const { error } = await supabase
                .from("users")
                .upsert(
                    {
                        auth_user_id: authUser.id,
                        email: authUser.email,
                        name: authUser.user_metadata?.name ?? null,
                        last_login: new Date().toISOString(),
                        is_active: true,
                    },
                    {
                        onConflict: "email", // ✅ THIS FIXES THE 409 ERROR
                    }
                );

            if (error) {
                console.error("❌ User sync failed:", error);
            } else {
                console.log("✅ User saved to database");
            }
        };

        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);

            if (data.user && !hasSynced.current) {
                hasSynced.current = true;
                syncUser(data.user);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);

            if (session?.user && !hasSynced.current) {
                hasSynced.current = true;
                syncUser(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return { user, loading };
}
