import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Select, MenuItem, Box } from '@mui/material';

const Passes = () => {
  const [passes, setPasses] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ visitor: '', appointment: '', validFrom: '', validTo: '' });

  useEffect(() => {
    fetchPasses();
    fetchVisitors();
    fetchAppointments();
  }, []);

  const fetchPasses = async () => {
    const res = await api.get('/passes');
    setPasses(res.data);
  };

  const fetchVisitors = async () => {
    const res = await api.get('/visitors');
    setVisitors(res.data);
  };

  const fetchAppointments = async () => {
    const res = await api.get('/appointments');
    setAppointments(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post('/passes/generate', form);
    alert('Pass generated! QR and PDF ready.');
    fetchPasses();
    setForm({ visitor: '', appointment: '', validFrom: '', validTo: '' });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Passes</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Select value={form.visitor} onChange={(e) => setForm({ ...form, visitor: e.target.value })} displayEmpty>
          <MenuItem value="">Select Visitor</MenuItem>
          {visitors.map((v) => (
            <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
          ))}
        </Select>
        <Select value={form.appointment} onChange={(e) => setForm({ ...form, appointment: e.target.value })} displayEmpty>
          <MenuItem value="">Select Appointment</MenuItem>
          {appointments.map((a) => (
            <MenuItem key={a._id} value={a._id}>{a.visitor?.name} - {a.status}</MenuItem>
          ))}
        </Select>
        <TextField label="Valid From" type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} required />
        <TextField label="Valid To" type="datetime-local" value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} required />
        <Button type="submit" variant="contained">Generate Pass</Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Visitor</TableCell>
            <TableCell>Appointment</TableCell>
            <TableCell>QR</TableCell>
            <TableCell>PDF</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {passes.map((p) => (
            <TableRow key={p._id}>
              <TableCell>{p.visitor?.name}</TableCell>
              <TableCell>{p.appointment?.scheduledDate}</TableCell>
              <TableCell><img src={p.qrCode} alt="QR" width="50" /></TableCell>
              <TableCell><Button href={`http://localhost:5000/${p.pdfPath}`} target="_blank">Download PDF</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default Passes;