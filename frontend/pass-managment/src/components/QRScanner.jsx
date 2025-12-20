import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';
import api from '../services/api';

const QRScanner = ({ onScanSuccess, mode = 'checkin' }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (result) => {
    if (!result || loading) return;

    try {
      setLoading(true);
      setError('');

      // First verify the pass
      const verifyRes = await api.post('/passes/verify', {
        qrData: result.text
      });

      if (!verifyRes.data.valid) {
        setError(verifyRes.data.message);
        setResult({
          success: false,
          message: verifyRes.data.message,
          pass: verifyRes.data.pass
        });
        setLoading(false);
        return;
      }

      // If valid, proceed with check-in or check-out
      const passData = JSON.parse(result.text);
      
      let response;
      if (mode === 'checkin') {
        response = await api.post('/checklogs/checkin', {
          passId: passData.passId,
          location: 'Main Entrance'
        });
      } else {
        response = await api.post('/checklogs/checkout', {
          passId: passData.passId
        });
      }

      setResult({
        success: true,
        message: response.data.message,
        visitor: response.data.visitor,
        checkLog: response.data.checkLog,
        duration: response.data.duration
      });

      if (onScanSuccess) {
        onScanSuccess(response.data);
      }

      // Auto-hide success message and reset
      setTimeout(() => {
        setResult(null);
        setScanning(false);
      }, 5000);

    } catch (err) {
      console.error('Scan error:', err);
      setError(err.response?.data?.message || 'Scan failed');
      setResult({
        success: false,
        message: err.response?.data?.message || 'Scan failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    console.error('Camera error:', err);
    setError('Camera error. Please check permissions.');
  };

  return (
    <Box>
      {!scanning && !result && (
        <Box textAlign="center" py={4}>
          <QrCodeScannerIcon sx={{ fontSize: 80, color: '#1976d2', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {mode === 'checkin' ? 'Check-In' : 'Check-Out'} Visitor
          </Typography>
          <Typography color="text.secondary" paragraph>
            Click the button below to start scanning
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => setScanning(true)}
            startIcon={<QrCodeScannerIcon />}
          >
            Start Scanner
          </Button>
        </Box>
      )}

      {scanning && !result && (
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Scanning for QR Code...
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setScanning(false)}
            >
              Cancel
            </Button>
          </Box>

          <Box sx={{ 
            position: 'relative',
            maxWidth: 500,
            margin: '0 auto',
            '& video': {
              width: '100%',
              borderRadius: 2
            }
          }}>
            <QrReader
              onResult={handleScan}
              onError={handleError}
              constraints={{
                facingMode: 'environment'
              }}
              containerStyle={{
                width: '100%'
              }}
              videoContainerStyle={{
                paddingTop: '100%'
              }}
            />
            {loading && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="rgba(0,0,0,0.5)"
                borderRadius={2}
              >
                <CircularProgress size={60} />
              </Box>
            )}
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              💡 Hold the QR code steady within the camera frame
            </Typography>
          </Alert>
        </Paper>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {result && (
        <Card sx={{ mt: 2, maxWidth: 600, margin: '0 auto' }}>
          <CardContent>
            <Box textAlign="center" mb={3}>
              {result.success ? (
                <>
                  <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" color="success.main" gutterBottom>
                    {mode === 'checkin' ? 'Check-In' : 'Check-Out'} Successful!
                  </Typography>
                </>
              ) : (
                <>
                  <CancelIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                  <Typography variant="h5" color="error.main" gutterBottom>
                    {mode === 'checkin' ? 'Check-In' : 'Check-Out'} Failed
                  </Typography>
                </>
              )}
              <Typography color="text.secondary">
                {result.message}
              </Typography>
            </Box>

            {result.success && result.visitor && (
              <Box>
                <Grid container spacing={2} alignItems="center" mb={2}>
                  <Grid item>
                    <Avatar
                      src={result.visitor.photo}
                      sx={{ width: 80, height: 80 }}
                    >
                      {result.visitor.name?.charAt(0)}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6">{result.visitor.name}</Typography>
                    <Typography color="text.secondary" variant="body2">
                      {result.visitor.phone}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {result.visitor.email}
                    </Typography>
                  </Grid>
                </Grid>

                {mode === 'checkin' && result.checkLog && (
                  <Box bgcolor="success.light" p={2} borderRadius={1}>
                    <Typography variant="body2" color="success.dark">
                      <strong>Check-In Time:</strong> {new Date(result.checkLog.checkInTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="success.dark">
                      <strong>Location:</strong> {result.checkLog.location}
                    </Typography>
                  </Box>
                )}

                {mode === 'checkout' && result.duration && (
                  <Box bgcolor="info.light" p={2} borderRadius={1}>
                    <Typography variant="body2" color="info.dark">
                      <strong>Visit Duration:</strong> {result.duration}
                    </Typography>
                    <Typography variant="body2" color="info.dark">
                      <strong>Check-Out Time:</strong> {new Date().toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {!result.success && result.pass && (
              <Box bgcolor="error.light" p={2} borderRadius={1}>
                <Typography variant="body2" color="error.dark">
                  <strong>Pass Status:</strong> {result.pass.status}
                </Typography>
                <Typography variant="body2" color="error.dark">
                  <strong>Valid From:</strong> {new Date(result.pass.validFrom).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="error.dark">
                  <strong>Valid To:</strong> {new Date(result.pass.validTo).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            <Box mt={3} textAlign="center">
              <Button
                variant="contained"
                onClick={() => {
                  setResult(null);
                  setScanning(true);
                }}
              >
                Scan Next
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setResult(null);
                  setScanning(false);
                }}
                sx={{ ml: 2 }}
              >
                Done
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default QRScanner;