import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Select, MenuItem, Box } from '@mui/material';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({ visitor: '', scheduledDate: '', notes: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAppointments();
    fetchVisitors();
  }, []);

  const fetchAppointments = async () => {
    const res = await api.get('/appointments');
    setAppointments(res.data);
  };

  const fetchVisitors = async () => {
    const res = await api.get('/visitors');
    setVisitors(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/appointments', form);
    fetchAppointments();
    setForm({ visitor: '', scheduledDate: '', notes: '' });
  };

  const approveAppointment = async (id) => {
    await api.patch(`/appointments/${id}/approve`, { status: 'approved' });
    fetchAppointments();
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Appointments</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Select value={form.visitor} onChange={(e) => setForm({ ...form, visitor: e.target.value })} displayEmpty>
          <MenuItem value="">Select Visitor</MenuItem>
          {visitors.map((v) => (
            <MenuItem key={v._id} value={v._id}>{v.name}</MenuItem>
          ))}
        </Select>
        <TextField label="Date" type="datetime-local" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required />
        <TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button type="submit" variant="contained">Create Appointment</Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Visitor</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {appointments.map((a) => (
            <TableRow key={a._id}>
              <TableCell>{a.visitor?.name}</TableCell>
              <TableCell>{new Date(a.scheduledDate).toLocaleString()}</TableCell>
              <TableCell>{a.status}</TableCell>
              <TableCell>
                {a.status === 'pending' && (user.role === 'admin' || user.role === 'employee') && (
                  <Button onClick={() => approveAppointment(a._id)} variant="contained">Approve</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default Appointments;