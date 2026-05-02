import { NextResponse } from 'next/server';
import { db, firebaseInitError } from '../../../lib/firebaseAdmin';

// GET all tasks
export async function GET() {
    if (!db) {
        return NextResponse.json(
            { error: firebaseInitError || 'Database not initialized' },
            { status: 500 }
        );
    }

    try {
        const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt
                ? doc.data().createdAt.toDate().toISOString()
                : new Date().toISOString(),
        }));

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST new task
export async function POST(request) {
    if (!db) {
        return NextResponse.json(
            { error: firebaseInitError || 'Database not initialized' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { title, assignee, assignedTo } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const newTask = {
            title,
            assignee: assignee || 'Anonymous',
            assignedTo: assignedTo || assignee || 'Anonymous',
            status: 'Todo',
            createdAt: new Date(),
        };

        const docRef = await db.collection('tasks').add(newTask);

        return NextResponse.json(
            {
                success: true,
                task: { id: docRef.id, ...newTask, createdAt: newTask.createdAt.toISOString() },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
