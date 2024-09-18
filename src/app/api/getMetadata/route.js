import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Candidate from '../../../../models/candidate';

export async function GET() {
    try {
        await dbConnect();

        const records = await Candidate.find({});

        return new NextResponse(JSON.stringify(records), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
        });
    } catch (error) {
        console.error('Error fetching records:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to fetch records' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
        });
    }
}
