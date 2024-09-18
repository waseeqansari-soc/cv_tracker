import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');
    if (!fileName) {
        return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = fs.readFileSync(filePath);
    return new NextResponse(file, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'inline',
        },
    });
}
