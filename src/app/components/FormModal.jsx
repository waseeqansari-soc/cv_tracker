import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { Grid } from '@mui/material';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    maxHeight: '80vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
export default function FormModal(props) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [formData, setFormData] = React.useState({
        name: '',
        contact: '',
        email: '',
        techstack: '',
        dateTime: '',
        status: '',
        selected: '',
        remarks: '',
        file: null
    });

    const [fileName, setFileName] = React.useState('');
    const [uploadStatus, setUploadStatus] = React.useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, file });
        setFileName(file ? file.name : '');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpload = async () => {
        const file = formData.file;
        if (!file) return;

        setUploadStatus('Uploading...');

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('name', formData.name);
        uploadData.append('contact', formData.contact);
        uploadData.append('email', formData.email);
        uploadData.append('techstack', formData.techstack);
        uploadData.append('dateTime', formData.dateTime);
        uploadData.append('status', formData.status);
        uploadData.append('selected', formData.selected);
        uploadData.append('remarks', formData.remarks);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData
            });
            const result = await response.json();
            if (response.ok) {
                setUploadStatus('Upload successful');
                setFormData({
                    name: '',
                    contact: '',
                    email: '',
                    techstack: '',
                    dateTime: '',
                    status: '',
                    selected: '',
                    remarks: '',
                    file: null
                });
                setFileName('');
                props.onApiResponse();
                handleClose()
            } else {
                setUploadStatus('Upload failed');
            }
        } catch (error) {
            setUploadStatus('Upload error');
        }
    };
    const handleUploadUpdate = async () => {
        const file = formData.file;
        const hasFile = file !== null;

        setUploadStatus('Uploading...');

        const uploadData = new FormData();
        if (hasFile) {
            uploadData.append('file', file);
        }
        uploadData.append('id', props?.data?.id);
        uploadData.append('name', formData.name);
        uploadData.append('contact', formData.contact);
        uploadData.append('email', formData.email);
        uploadData.append('techstack', formData.techstack);
        uploadData.append('dateTime', formData.dateTime);
        uploadData.append('status', formData.status);
        uploadData.append('selected', formData.selected);
        uploadData.append('remarks', formData.remarks);

        try {
            const response = await fetch('/api/upload', {
                method: 'PUT',
                body: uploadData
            });
            const result = await response.json();
            if (response.ok) {
                setUploadStatus('Update successful');
                setFormData({
                    name: '',
                    contact: '',
                    email: '',
                    techstack: '',
                    dateTime: '',
                    status: '',
                    selected: '',
                    remarks: '',
                    file: null
                });
                setFileName('');
                props.onApiResponse();
                handleClose()
            } else {
                setUploadStatus('Update failed');
            }
        } catch (error) {
            console.log(error)
            setUploadStatus('Update error');
        }
    };

    React.useEffect(() => {
        if (props?.data?.id) {
            setFormData({
                name: props.data.name || '',
                contact: props.data.contact || '',
                email: props.data.email || '',
                techstack: props.data.techstack || '',
                dateTime: props.data.dateTime || '',
                status: props.data.status || '',
                selected: props.data.selected || '',
                remarks: props.data.remarks || '',
                file: props.data.file || null
            });
        }
    }, [props]);

    return (
        <div>
            <Button variant="contained" onClick={handleOpen}>{props.name}</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" mb={2}>
                        {props?.data?.id ? 'Update Data' : 'Add Data'}
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Button variant="contained" component="label">
                                Upload File
                                <input type="file" hidden onChange={handleFileChange} />
                            </Button>
                            {fileName && (
                                <Typography variant="body2" color="textSecondary" mt={1}>
                                    Selected file: {fileName}
                                </Typography>
                            )}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Candidate Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contact"
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tech stack"
                                name="techstack"
                                type="text"
                                value={formData.techstack}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Interview Date and Time"
                                name="dateTime"
                                type="datetime-local"
                                InputLabelProps={{ shrink: true }}
                                value={formData.dateTime}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    label="Status"
                                >
                                    <MenuItem value=""><em>Select...</em></MenuItem>
                                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                                    <MenuItem value="On-Hold">On-Hold</MenuItem>
                                    <MenuItem value="Done">Done</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Selected</InputLabel>
                                <Select
                                    name="selected"
                                    value={formData.selected}
                                    onChange={handleInputChange}
                                    label="Selected"
                                >
                                    <MenuItem value=""><em>Select...</em></MenuItem>
                                    <MenuItem value="Yes">Yes</MenuItem>
                                    <MenuItem value="No">No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Remarks"
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} mt={2}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={props?.data?.id ? handleUploadUpdate : handleUpload}
                            >
                                {props?.data?.id ? 'Update' : 'Upload'}
                            </Button>
                            {uploadStatus && (
                                <Typography variant="body2" color={uploadStatus.includes('failed') || uploadStatus.includes('error') ? 'error' : 'success'} mt={2}>
                                    {uploadStatus}
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        </div>
    );
};