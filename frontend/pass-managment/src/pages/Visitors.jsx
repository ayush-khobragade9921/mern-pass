import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Box } from '@mui/material';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    const res = await api.get('/visitors');
    setVisitors(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    if (photo) formData.append('profilePhoto', photo);

    await api.post('/visitors', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    fetchVisitors();
    setForm({ name: '', email: '', phone: '' });
    setPhoto(null);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Visitors</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />
        <Button type="submit" variant="contained">Add Visitor</Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visitors.map((v) => (
            <TableRow key={v._id}>
              <TableCell>{v.name}</TableCell>
              <TableCell>{v.email}</TableCell>
              <TableCell>{v.phone}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default Visitors;