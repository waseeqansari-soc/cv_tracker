import { MongoClient } from 'mongodb';
import axios from 'axios';
import FormData from 'form-data';

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';


import dbConnect from '../../../../lib/db';
import Candidate from '../../../../models/candidate';


import { Readable } from 'stream';
import { CollectionsOutlined } from '@mui/icons-material';

function bufferToStream(buffer) {
    const readable = new Readable();
    readable._read = () => { };
    readable.push(buffer);
    readable.push(null);
    return readable;
}

async function uploadToPinata(pdfFile) {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_API_SECRET;

    const uniqueFileName = `${uuidv4()}-${pdfFile.name}`;
    const buffer = Buffer.from(await pdfFile.arrayBuffer());
    const stream = bufferToStream(buffer);

    const formData = new FormData();
    formData.append('file', stream, uniqueFileName);

    const metadata = JSON.stringify({
        name: uniqueFileName,
        keyvalues: {
            uuid: uuidv4(),
        },
    });

    formData.append('pinataMetadata', metadata);
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    try {
        const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            maxBodyLength: 'Infinity',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey,
            },
        });

        return res.data.IpfsHash;
    } catch (error) {
        throw new Error('Failed to upload PDF to Pinata: ' + error.message);
    }
}

export async function POST(req) {
    try {
        await dbConnect();

        const id = uuidv4();

        const formData = await req.formData();
        const name = formData.get('name');
        const email = formData.get('email');
        const contact = formData.get('contact');
        const techstack = formData.get('techstack');
        const dateTime = new Date(formData.get('dateTime'));
        const status = formData.get('status');
        const selected = formData.get('selected');
        const remarks = formData.get('remarks');
        const pdfFile = formData.get('file');

        const pdfIpfsHash = await uploadToPinata(pdfFile);
        const data = {
            id,
            name,
            email,
            contact,
            techstack,
            dateTime,
            status,
            selected,
            remarks,
            pdfIpfsHash,
        };
        console.log(data)
        await Candidate.create(data);

        return new Response(JSON.stringify({
            success: true,
            message: "Successfully created record!",
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error in POST handler:', error);
        return new Response(JSON.stringify({
            success: false,
            message: "Failed to create record",
            error: error.message,
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}


async function isCidInUse(cid) {
    const count = await Candidate.countDocuments({ pdfIpfsHash: cid });
    return count > 0;
}
async function removeFromPinata(ipfsHash) {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_API_SECRET;

    try {
        const response = await axios.delete(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
            headers: {
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey,
            },
        });
        console.log('Successfully removed PDF from Pinata:', response.data);
    } catch (error) {
        console.error('Failed to remove PDF from Pinata:', error.response ? error.response.data : error.message);
        throw new Error('Failed to remove PDF from Pinata: ' + (error.response ? error.response.data : error.message));
    }
}
export async function PUT(req) {
    try {
        const formData = await req.formData();
        const id = formData.get('id');
        const email = formData.get('email');
        const contact = formData.get('contact');
        const dateTime = new Date(formData.get('dateTime'));
        const status = formData.get('status');
        const selected = formData.get('selected');
        const remarks = formData.get('remarks');
        const pdfFile = formData.get('file');

        if (!id) {
            return NextResponse.json({ message: 'ID is required!' }, { status: 400 });
        }

        // Fetch existing record
        const existingData = await Candidate.findOne({ id });

        if (!existingData) {
            return NextResponse.json({ message: 'Data not found!' }, { status: 404 });
        }

        // Update fields
        const updatedData = {
            email,
            contact,
            dateTime,
            status,
            selected,
            remarks,
        };

        // Handle PDF file update
        if (pdfFile && pdfFile.size > 0) {
            const newPdfIpfsHash = await uploadToPinata(pdfFile);
            updatedData.pdfIpfsHash = newPdfIpfsHash;

            // Check if old PDF hash is still in use
            if (existingData.pdfIpfsHash && !(await isCidInUse(existingData.pdfIpfsHash))) {
                await removeFromPinata(existingData.pdfIpfsHash);
            }
        }

        // Update record in MongoDB
        await Candidate.updateOne({ id }, { $set: updatedData });

        return NextResponse.json({ success: true, message: 'Data updated successfully!' });
    } catch (error) {
        console.error('Error updating data:', error);
        return NextResponse.json({ success: false, message: 'Error updating data!', error: error.message }, { status: 500 });
    }
}



export async function DELETE(req) {
    try {
        const body = await req.json(); // This is the key change here
        const { id } = body;
        console.log("id  =======>", id)
        if (!id) {
            return new Response(JSON.stringify({ message: 'ID is required!' }), { status: 400 });
        }

        const document = await Candidate.findOneAndDelete({ _id: id });

        if (!document) {
            return new Response(JSON.stringify({ message: 'Document not found!' }), { status: 404 });
        }

        if (document.pdfIpfsHash && !(await isCidInUse(document.pdfIpfsHash))) {
            await removeFromPinata(document.pdfIpfsHash);
        }

        return new Response(JSON.stringify({ success: true, message: 'Document deleted successfully!' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting document:', error);
        return new Response(JSON.stringify({ success: false, message: 'Error deleting document', error: error.message }), { status: 500 });
    }
}