import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Grid,
  Avatar,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  PhotoCamera as PhotoCameraIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const Requestvisit = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    visitorName: user?.name || '',
    visitorEmail: user?.email || '',
    visitorPhone: '',
    purpose: '',
    appointmentDate: '',
    appointmentTime: '',
    hostName: '',
    notes: ''
  });
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('=== STARTING APPOINTMENT CREATION ===');
      
      // Step 1: Create Visitor first
      console.log('Step 1: Creating visitor...');
      const visitorData = new FormData();
      visitorData.append('name', formData.visitorName);
      visitorData.append('email', formData.visitorEmail);
      visitorData.append('phone', formData.visitorPhone);
      if (photo) {
        visitorData.append('profilePhoto', photo);
      }

      const visitorResponse = await api.post('/visitors', visitorData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Visitor created:', visitorResponse.data);
      console.log('📋 Visitor details:', {
        name: visitorResponse.data.name,
        email: visitorResponse.data.email,
        phone: visitorResponse.data.phone,
        company: visitorResponse.data.company,  // ← Check this!
        _id: visitorResponse.data._id
      });
      const visitorId = visitorResponse.data._id;

      // Step 2: Combine date and time into scheduledDate
      console.log('Step 2: Formatting date...');
      const dateTimeString = `${formData.appointmentDate}T${formData.appointmentTime}:00`;
      const scheduledDate = new Date(dateTimeString);
      
      console.log('Date Input:', formData.appointmentDate);
      console.log('Time Input:', formData.appointmentTime);
      console.log('Combined:', dateTimeString);
      console.log('Parsed Date:', scheduledDate.toISOString());

      // Step 3: Create Appointment with visitor ID
      console.log('Step 3: Creating appointment...');
      const appointmentData = {
        visitor: visitorId,
        scheduledDate: scheduledDate.toISOString(),
        notes: `Purpose: ${formData.purpose}\nHost: ${formData.hostName}${formData.notes ? '\nAdditional Notes: ' + formData.notes : ''}`
      };

      console.log('Appointment Data:', appointmentData);

      const appointmentResponse = await api.post('/appointments', appointmentData);

      console.log('✅ Appointment created:', appointmentResponse.data);
      console.log('=== SUCCESS ===');

      setSuccess('Visit request submitted successfully! Redirecting...');
      
      // Reset form
      setFormData({
        visitorName: user?.name || '',
        visitorEmail: user?.email || '',
        visitorPhone: '',
        purpose: '',
        appointmentDate: '',
        appointmentTime: '',
        hostName: '',
        notes: ''
      });
      setPhoto(null);
      setPhotoPreview(null);

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/appointments');
      }, 1500);

    } catch (err) {
      console.error('❌ ERROR:', err);
      console.error('Response:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to submit visit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📋 Request a Visit
          </Typography>
          <Typography color="text.secondary">
            Fill in your details to request an appointment
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* Visitor Information Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                👤 Your Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="visitorName"
                    value={formData.visitorName}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="visitorEmail"
                    type="email"
                    value={formData.visitorEmail}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="visitorPhone"
                    value={formData.visitorPhone}
                    onChange={handleChange}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Upload Photo (Optional)
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<PhotoCameraIcon />}
                      >
                        Choose Photo
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                      </Button>
                      {photoPreview && (
                        <Avatar
                          src={photoPreview}
                          sx={{ width: 60, height: 60 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Visit Details Section */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">
                📅 Visit Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Visit Date"
                    name="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Visit Time"
                    name="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Host/Person to Meet"
                    name="hostName"
                    value={formData.hostName}
                    onChange={handleChange}
                    required
                    placeholder="Enter the name of person you want to meet"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Purpose of Visit"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    multiline
                    rows={2}
                    placeholder="E.g., Business meeting, Interview, Delivery, etc."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes (Optional)"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    multiline
                    rows={2}
                    placeholder="Any additional information..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Box display="flex" gap={2} justifyContent="center">
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<SendIcon />}
              sx={{ px: 6, py: 1.5 }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
              sx={{ px: 4 }}
            >
              Cancel
            </Button>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Your visit request will be reviewed by the host or administrator. 
            You will receive a notification once it's approved. An approved pass will be available 
            in "My Passes" section.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
};

export default Requestvisit;