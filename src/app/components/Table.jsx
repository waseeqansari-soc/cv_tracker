'use client';

import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import FormModal from './FormModal';
import { Modal, Box, Button } from '@mui/material';

// Modal styling
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default function BasicTable({ shouldRerenderTable }) {
    const [rows, setRows] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [RerenderTable, setRerenderTable] = React.useState(false);
    const [selectedPdf, setSelectedPdf] = React.useState('');

    React.useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('/api/getMetadata');
            const data = await response.json();
            console.log(data)
            setRows(data);
        };
        fetchData();
    }, [shouldRerenderTable, RerenderTable]);

    const handleOpen = (pdfFileName) => {
        setSelectedPdf(pdfFileName);
        setOpen(true);
    };

    const handleApiResponse = () => {
        setRerenderTable(prev => !prev);
    };

    const handleClose = () => setOpen(false);

    const handleDelete = async (id) => {
        try {
            const response = await fetch('/api/upload', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            });
            const result = await response.json();
            if (response.ok) {
                setRerenderTable(prev => !prev);
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Error deleting record:', error);
        }
    };

    return (
        <>
            {/* Table */}
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="right">Name</TableCell>
                            <TableCell align="right">Contact</TableCell>
                            <TableCell align="right">Email</TableCell>
                            <TableCell align="right">Tech Stack</TableCell>
                            <TableCell align="right">Interview Date and Time</TableCell>
                            <TableCell align="right">Interview Status</TableCell>
                            <TableCell align="right">Selected</TableCell>
                            <TableCell align="right">Remarks</TableCell>
                            <TableCell>Candidate CV</TableCell>
                            <TableCell>Edit</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows?.map((row) => (
                            <TableRow
                                key={row.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >

                                <TableCell align="right">{row.name}</TableCell>
                                <TableCell align="right">{row.contact}</TableCell>
                                <TableCell align="right">{row.email}</TableCell>
                                <TableCell align="right">{row.techstack}</TableCell>
                                <TableCell align="right">{formatDateTime(row.dateTime)}</TableCell>
                                <TableCell align="right">{row.status}</TableCell>
                                <TableCell align="right">{row.selected}</TableCell>
                                <TableCell align="right">{row.remarks}</TableCell>
                                <TableCell component="th" scope="row">
                                    <Box display="flex" gap={1}>
                                        <Button
                                            variant="contained"
                                            onClick={() => handleOpen(row.pdfIpfsHash)}
                                            size="small"
                                        >
                                            Preview
                                        </Button>
                                        <Button
                                            variant="contained"
                                            component="a"
                                            href={`https://gateway.pinata.cloud/ipfs/${row.pdfIpfsHash}`}
                                            download
                                            size="small"
                                        >
                                            Download
                                        </Button>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Box display="flex" gap={1}>
                                        <FormModal data={row} name="Edit" onApiResponse={handleApiResponse} />
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleDelete(row._id)}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="pdf-preview-modal"
                aria-describedby="pdf-preview-description"
            >
                <Box sx={modalStyle}>
                    <iframe
                        src={`https://gateway.pinata.cloud/ipfs/${selectedPdf}`}
                        style={{ width: '100%', height: '100%' }}
                        frameBorder="0"
                        title="PDF Preview"
                    ></iframe>
                </Box>
            </Modal>
        </>
    );
}


function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    const dateFormatter = new Intl.DateTimeFormat('en-GB', options);

    return dateFormatter.format(date);
}
