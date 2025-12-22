import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Paper,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Pending as PendingIcon,
  Event as EventIcon
} from '@mui/icons-material';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', appointmentId: null });
  const [message, setMessage] = useState({ text: '', type: '' });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setMessage({ text: 'Failed to load appointments', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/appointments/${id}/approve`);
      setMessage({ text: 'Appointment approved successfully!', type: 'success' });
      fetchAppointments();
      setConfirmDialog({ open: false, type: '', appointmentId: null });
    } catch (err) {
      console.error('Error approving appointment:', err);
      setMessage({ text: 'Failed to approve appointment', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/appointments/${id}/reject`);
      setMessage({ text: 'Appointment rejected', type: 'info' });
      fetchAppointments();
      setConfirmDialog({ open: false, type: '', appointmentId: null });
    } catch (err) {
      console.error('Error rejecting appointment:', err);
      setMessage({ text: 'Failed to reject appointment', type: 'error' });
    }
  };

  const openConfirmDialog = (type, id) => {
    setConfirmDialog({ open: true, type, appointmentId: id });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, type: '', appointmentId: null });
  };

  const handleConfirm = () => {
    if (confirmDialog.type === 'approve') {
      handleApprove(confirmDialog.appointmentId);
    } else if (confirmDialog.type === 'reject') {
      handleReject(confirmDialog.appointmentId);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Approved"
            color="success"
            size="small"
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<CancelIcon />}
            label="Rejected"
            color="error"
            size="small"
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<PendingIcon />}
            label="Pending"
            color="warning"
            size="small"
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const canApproveReject = user.role === 'admin' || user.role === 'employee';

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" fontWeight="bold">
          {user.role === 'visitor' ? 'My Visit Requests' : 'Appointments'}
        </Typography>
      </Box>

      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ text: '', type: '' })}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      {appointments.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No appointments found
          </Typography>
          <Typography color="text.secondary">
            {user.role === 'visitor'
              ? 'Click "Request Visit" to create your first visit request'
              : 'Appointments will appear here once visitors submit requests'}
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell><strong>Visitor</strong></TableCell>
                <TableCell><strong>Contact</strong></TableCell>
                <TableCell><strong>Date & Time</strong></TableCell>
                <TableCell><strong>Notes</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                {canApproveReject && <TableCell><strong>Actions</strong></TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={appointment.visitor?.photo}
                        sx={{ width: 40, height: 40 }}
                      >
                        {appointment.visitor?.name?.charAt(0) || 'V'}
                      </Avatar>
                      <Typography variant="body1" fontWeight="medium">
                        {appointment.visitor?.name || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      📧 {appointment.visitor?.email || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      📞 {appointment.visitor?.phone || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {new Date(appointment.scheduledDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(appointment.scheduledDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 250,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {appointment.notes || 'No notes'}
                    </Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(appointment.status)}</TableCell>
                  {canApproveReject && (
                    <TableCell>
                      {appointment.status === 'pending' ? (
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => openConfirmDialog('approve', appointment._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={() => openConfirmDialog('reject', appointment._id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {appointment.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </Typography>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle>
          {confirmDialog.type === 'approve' ? '✅ Approve Appointment?' : '❌ Reject Appointment?'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'approve'
              ? 'Are you sure you want to approve this appointment? The visitor will be notified and a pass will be generated.'
              : 'Are you sure you want to reject this appointment? The visitor will be notified.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirmDialog.type === 'approve' ? 'success' : 'error'}
            autoFocus
          >
            {confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Appointments;