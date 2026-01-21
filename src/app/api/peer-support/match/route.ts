import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        console.log('--- POST /api/peer-support/match ---');

        /* -------------------------------------------------
           AUTH
        -------------------------------------------------- */
        const supabase = await createClient();
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
            console.warn('Unauthorized request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = supabase as any;

        /* -------------------------------------------------
           REQUEST BODY
        -------------------------------------------------- */
        const body = await request.json();
        console.log('MATCH REQUEST BODY:', body);

        const {
            chat_id,
            room_id,
            first_message
        }: {
            chat_id?: string;
            room_id?: string;
            first_message?: string;
        } = body;

        /* =================================================
           1️⃣ LISTENER FLOW — JOIN SPECIFIC CHAT (PRIORITY)
           ================================================= */
        if (chat_id) {
            console.log('Listener attempting to join chat:', chat_id);

            const { data: claimedChat, error } = await db
                .from('peer_support_chats')
                .update({
                    recipient_id: user.id,
                    status: 'active'
                })
                .eq('id', chat_id)
                .eq('status', 'waiting')
                .select()
                .maybeSingle();

            if (error || !claimedChat) {
                console.warn('Join failed — chat taken or invalid:', chat_id);
                return NextResponse.json(
                    { error: 'Chat already taken or unavailable' },
                    { status: 409 }
                );
            }

            console.log('Chat successfully joined:', claimedChat.id);

            return NextResponse.json({
                matched: true,
                chat_id: claimedChat.id,
                role: 'recipient'
            });
        }

        /* =================================================
           2️⃣ SEEKER FLOW — REUSE EXISTING ACTIVE CHAT
           ================================================= */
        const { data: activeChat } = await db
            .from('peer_support_chats')
            .select('*')
            .eq('initiator_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

        if (activeChat) {
            return NextResponse.json({
                matched: true,
                chat_id: activeChat.id,
                role: 'initiator'
            });
        }

        /* =================================================
           3️⃣ SEEKER FLOW — FIND & CLAIM WAITING PEER
           ================================================= */
        if (room_id) {
            const { data: waitingChat } = await db
                .from('peer_support_chats')
                .select('*')
                .eq('room_id', room_id)
                .eq('status', 'waiting')
                .neq('initiator_id', user.id)
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle();

            if (waitingChat) {
                const { data: claimedChat } = await db
                    .from('peer_support_chats')
                    .update({
                        recipient_id: user.id,
                        status: 'active'
                    })
                    .eq('id', waitingChat.id)
                    .eq('status', 'waiting')
                    .select()
                    .maybeSingle();

                if (claimedChat) {
                    console.log('Auto-matched with waiting peer:', claimedChat.id);

                    return NextResponse.json({
                        matched: true,
                        chat_id: claimedChat.id,
                        role: 'recipient'
                    });
                }
            }
        }

        /* =================================================
           4️⃣ SEEKER FLOW — CREATE WAITING CHAT
           ================================================= */
        if (!room_id) {
            return NextResponse.json(
                { error: 'room_id is required' },
                { status: 400 }
            );
        }

        const { data: newChat, error: createError } = await db
            .from('peer_support_chats')
            .insert({
                room_id,
                initiator_id: user.id,
                status: 'waiting',
                first_message: first_message || null
            })
            .select()
            .single();

        if (createError || !newChat) {
            console.error('Failed to create waiting chat:', createError);
            return NextResponse.json(
                { error: 'Failed to create waiting chat' },
                { status: 500 }
            );
        }

        console.log('Waiting chat created:', newChat.id);

        return NextResponse.json({
            matched: false,
            chat_id: newChat.id,
            message: 'Waiting for a peer to connect...'
        });

    } catch (err) {
        console.error('Match route error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
