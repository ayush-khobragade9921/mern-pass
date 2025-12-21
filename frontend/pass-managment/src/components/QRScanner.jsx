import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { Html5Qrcode } from "html5-qrcode";
import api from "../services/api";

const QRScanner = ({ onScanSuccess: onScanComplete, mode = "checkin" }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);

  useEffect(() => {
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
        html5QrCode.clear();
      }
    };
  }, [html5QrCode]);

  const startScanning = async () => {
    try {
      setError("");
      setScanning(true);

      // Wait for DOM element
      await new Promise(res => setTimeout(res, 300));

      const scanner = new Html5Qrcode("qr-reader");
      setHtml5QrCode(scanner);

      // GET AVAILABLE CAMERAS
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setError("No camera found on this device.");
        setScanning(false);
        return;
      }

      console.log("📷 Available cameras:", cameras);

      // Laptop me ALWAYS front cam, mobile me back cam
      const defaultCamera = cameras.find(cam => cam.label.toLowerCase().includes("back"))
        || cameras[0];

      console.log("✅ Using camera:", defaultCamera.label);

      await scanner.start(
        { deviceId: { exact: defaultCamera.id } },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleQrCodeDetected,
        () => {}
      );

      console.log("✅ Scanner started successfully");
    } catch (err) {
      console.error("❌ Scanner error:", err);
      setError("Unable to start camera. Give camera permission and use localhost.");
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCode) {
        await html5QrCode.stop();
        html5QrCode.clear();
        console.log("✅ Scanner stopped");
      }
    } catch (e) {
      console.error("Stop error:", e);
    }
    setScanning(false);
  };

  const handleQrCodeDetected = (text) => {
    console.log("📷 QR Code detected!");
    stopScanning();
    processQrCode(text);
  };

  const processQrCode = async (qrText) => {
    if (!qrText || loading) return;

    setLoading(true);
    setError("");

    try {
      console.log("=== QR SCAN DEBUG ===");
      console.log("📋 Raw QR Text:", qrText);

      // Parse QR data
      let parsed;
      try {
        parsed = JSON.parse(qrText);
        console.log("✅ Parsed JSON:", parsed);
      } catch (parseErr) {
        console.log("⚠️ Not JSON, treating as plain Pass ID");
        parsed = { passId: qrText };
      }

      // Extract Pass ID
      const passId = parsed.passId || parsed._id || qrText;
      console.log("🎫 Extracted Pass ID:", passId);

      // Validate Pass ID
      if (!passId || passId === 'temp' || passId.length < 10) {
        throw new Error("Invalid Pass ID extracted from QR code");
      }

      console.log("✅ Pass ID validated");
      console.log("===================");

      // Call backend
      let response;
      if (mode === "checkin") {
        console.log("📥 Calling check-in API...");
        response = await api.post("/checklogs/checkin", {
          passId,
          location: "Main Entrance"
        });
      } else {
        console.log("📤 Calling check-out API...");
        response = await api.post("/checklogs/checkout", { passId });
      }

      console.log("✅ Backend response:", response.data);

      setResult({
        success: true,
        message: response.data.message,
        visitor: response.data.visitor,
        checkLog: response.data.checkLog,
        duration: response.data.duration
      });

      if (onScanComplete) {
        onScanComplete(response.data);
      }

    } catch (err) {
      console.error("❌ QR processing error:", err);
      console.error("Error details:", err.response?.data);
      
      const errorMsg = err.response?.data?.message || err.message || "Failed to process QR.";
      setError(errorMsg);
      
      setResult({
        success: false,
        message: errorMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {!scanning && !result && (
        <Box textAlign="center" py={4}>
          <QrCodeScannerIcon sx={{ fontSize: 80, color: "#1976d2", mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {mode === "checkin" ? "📥 Check-In" : "📤 Check-Out"} Visitor
          </Typography>
          <Typography color="text.secondary" paragraph>
            Scan the QR code from visitor's pass
          </Typography>
          
          <Button
            variant="contained"
            size="large"
            onClick={startScanning}
            sx={{ mt: 2, px: 4 }}
            startIcon={<QrCodeScannerIcon />}
          >
            Start QR Scanner
          </Button>

          <Alert severity="info" sx={{ mt: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="body2">
              <strong>💡 Instructions:</strong>
              <br />
              • Click "Start QR Scanner"
              <br />
              • Allow camera permissions
              <br />
              • Hold QR code steady in front of camera
              <br />
              • Auto-detects in 3-5 seconds
              <br />
              <br />
              <strong>⚠️ Important:</strong> Use <strong>http://localhost:5173</strong>
            </Typography>
          </Alert>
        </Box>
      )}

      {scanning && !result && (
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              🎥 Scanner Active
            </Typography>
            <Button 
              color="error" 
              variant="outlined" 
              onClick={stopScanning}
              startIcon={<CloseIcon />}
            >
              Stop
            </Button>
          </Box>

          <div
            id="qr-reader"
            style={{
              width: "100%",
              maxWidth: 500,
              margin: "0 auto",
              border: "2px solid #1976d2",
              borderRadius: 8
            }}
          />

          {loading && (
            <Box textAlign="center" mt={2}>
              <CircularProgress />
              <Typography sx={{ mt: 1 }}>Processing QR Code...</Typography>
            </Box>
          )}

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              📸 Hold QR code steady | Distance: 15-20cm | Good lighting helps
            </Typography>
          </Alert>
        </Paper>
      )}

      {error && !result && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
          <Typography variant="body2">
            <strong>Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {result && (
        <Dialog open={true} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">
                {result.success ? "✅ Success!" : "❌ Failed"}
              </Typography>
              <Button
                onClick={() => {
                  setResult(null);
                  setScanning(false);
                }}
                size="small"
              >
                <CloseIcon />
              </Button>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Box textAlign="center" mb={3}>
              {result.success ? (
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              ) : (
                <CancelIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              )}
              
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {mode === "checkin" ? "Check-In" : "Check-Out"} {result.success ? "Successful!" : "Failed"}
              </Typography>
              <Typography color="text.secondary" variant="body1">
                {result.message}
              </Typography>
            </Box>

            {result.success && result.visitor && (
              <Box>
                <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        src={result.visitor.photo}
                        sx={{ width: 80, height: 80 }}
                      >
                        {result.visitor.name?.charAt(0)}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" fontWeight="bold">
                        {result.visitor.name}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        📞 {result.visitor.phone || 'N/A'}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        📧 {result.visitor.email || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {mode === "checkin" && result.checkLog && (
                  <Box bgcolor="success.light" p={2} borderRadius={1}>
                    <Typography variant="body2" color="success.dark" gutterBottom>
                      <strong>✅ Check-In Time:</strong> {new Date(result.checkLog.checkInTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="success.dark">
                      <strong>📍 Location:</strong> {result.checkLog.location || 'Main Entrance'}
                    </Typography>
                  </Box>
                )}

                {mode === "checkout" && result.duration && (
                  <Box bgcolor="info.light" p={2} borderRadius={1}>
                    <Typography variant="body2" color="info.dark" gutterBottom>
                      <strong>⏱️ Visit Duration:</strong> {result.duration}
                    </Typography>
                    <Typography variant="body2" color="info.dark">
                      <strong>🚪 Check-Out Time:</strong> {new Date().toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="contained"
              onClick={() => {
                setResult(null);
                startScanning();
              }}
              fullWidth
              size="large"
            >
              Scan Next Visitor
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setResult(null);
                setScanning(false);
              }}
              fullWidth
              size="large"
            >
              Done
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default QRScanner;