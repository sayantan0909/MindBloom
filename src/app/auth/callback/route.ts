import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Sync user to database (optional, but good for redundancy if trigger fails)
            // Note: The database trigger handles this in robust setups, but we can do a check here.
            // For now, rely on trigger or separate profile check.
        } else if (error) {
            console.error("Auth Exchange Error:", error);
            return NextResponse.redirect(`${origin}/auth/auth-code-error`)
        }
    }

    // URL to redirect to after sign in process completes
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'

    if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
        return NextResponse.redirect(`${origin}${next}`)
    }
}
