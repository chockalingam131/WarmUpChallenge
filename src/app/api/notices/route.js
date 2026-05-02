import { NextResponse } from 'next/server';
import { db, firebaseInitError } from '../../../lib/firebaseAdmin';

/**
 * GET /api/notices
 * Returns all notices ordered by creation time descending.
 */
export async function GET() {
    if (!db) {
        return NextResponse.json({ error: firebaseInitError || 'Database not initialized' }, { status: 500 });
    }

    try {
        const snapshot = await db.collection('notices').orderBy('createdAt', 'desc').get();
        const notices = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt
                ? doc.data().createdAt.toDate().toISOString()
                : new Date().toISOString(),
        }));
        return NextResponse.json({ notices }, { status: 200 });
    } catch (error) {
        console.error('Error fetching notices:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/notices
 * Publishes a new notice to the board.
 * Body: { title: string, message: string, author: string }
 */
export async function POST(request) {
    if (!db) {
        return NextResponse.json({ error: firebaseInitError || 'Database not initialized' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const { title, message, author } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ error: 'Notice title is required' }, { status: 400 });
        }
        if (!message || !message.trim()) {
            return NextResponse.json({ error: 'Notice message is required' }, { status: 400 });
        }

        const newNotice = {
            title: title.trim(),
            message: message.trim(),
            author: author || 'Anonymous',
            createdAt: new Date(),
        };

        const docRef = await db.collection('notices').add(newNotice);

        return NextResponse.json({
            success: true,
            notice: { id: docRef.id, ...newNotice, createdAt: newNotice.createdAt.toISOString() },
        }, { status: 201 });
    } catch (error) {
        console.error('Error posting notice:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
