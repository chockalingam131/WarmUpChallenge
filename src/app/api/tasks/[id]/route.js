import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebaseAdmin';

export async function PATCH(request, { params }) {
    if (!db) {
        return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    try {
        const { id } = params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        await db.collection('tasks').doc(id).update({
            status: status
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error updating task', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
