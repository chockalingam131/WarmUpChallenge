import { NextResponse } from 'next/server';
import { db, firebaseInitError } from '../../../../../lib/firebaseAdmin';

/**
 * GET /api/tasks/[id]/comments
 * Returns all comments for a task, ordered by creation time ascending.
 */
export async function GET(request, { params }) {
    if (!db) {
        return NextResponse.json({ error: firebaseInitError || 'Database not initialized' }, { status: 500 });
    }

    try {
        const { id } = params;
        const snapshot = await db
            .collection('tasks')
            .doc(id)
            .collection('comments')
            .orderBy('createdAt', 'asc')
            .get();

        const comments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt
                ? doc.data().createdAt.toDate().toISOString()
                : new Date().toISOString(),
        }));

        return NextResponse.json({ comments }, { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/tasks/[id]/comments
 * Adds a new comment to a task.
 * Body: { text: string, author: string }
 */
export async function POST(request, { params }) {
    if (!db) {
        return NextResponse.json({ error: firebaseInitError || 'Database not initialized' }, { status: 500 });
    }

    try {
        const { id } = params;
        const body = await request.json();
        const { text, author } = body;

        if (!text || !text.trim()) {
            return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
        }

        const newComment = {
            text: text.trim(),
            author: author || 'Anonymous',
            createdAt: new Date(),
        };

        const docRef = await db
            .collection('tasks')
            .doc(id)
            .collection('comments')
            .add(newComment);

        return NextResponse.json({
            success: true,
            comment: { id: docRef.id, ...newComment, createdAt: newComment.createdAt.toISOString() },
        }, { status: 201 });
    } catch (error) {
        console.error('Error posting comment:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
