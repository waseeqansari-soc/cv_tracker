import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    contact: {
        type: String,
        required: true
    },
    techstack: {
        type: String,
    },
    dateTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['On-Hold', 'Scheduled', 'Done'],
        required: true
    },
    selected: {
        type: String,
        enum: ['Yes', 'No'],
        required: true
    },
    remarks: {
        type: String,
        required: true
    },
    pdfIpfsHash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);

export default Candidate;
