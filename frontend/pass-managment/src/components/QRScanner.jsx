import React, { useState, useEffect, useRef } from 'react';
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
  Close as CloseIcon,
  Info as InfoIcon
} from '@mui/icons-material';

import { Html5Qrcode } from "html5-qrcode";
import api from "../services/api";

const QRScanner = ({ onScanSuccess: onScanComplete, mode = "checkin" }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  
  const processingRef = useRef(false);
  const lastProcessedQR = useRef(null);

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
      setResult(null);
      setScanning(true);
      processingRef.current = false;
      lastProcessedQR.current = null;

      await new Promise(res => setTimeout(res, 300));

      const scanner = new Html5Qrcode("qr-reader");
      setHtml5QrCode(scanner);

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setError("No camera found");
        setScanning(false);
        return;
      }

      const defaultCamera = cameras.find(cam => cam.label.toLowerCase().includes("back")) || cameras[0];

      await scanner.start(
        { deviceId: { exact: defaultCamera.id } },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleQrCodeDetected,
        () => {}
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setError("Unable to start camera");
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCode) {
        await html5QrCode.stop();
        html5QrCode.clear();
      }
    } catch (e) {}
    setScanning(false);
    processingRef.current = false;
  };

  const handleQrCodeDetected = (text) => {
    if (processingRef.current || lastProcessedQR.current === text) {
      console.log("⚠️ Ignoring duplicate QR detection");
      return;
    }

    console.log("📷 QR Code detected!");
    lastProcessedQR.current = text;
    processingRef.current = true;
    
    stopScanning();
    processQrCode(text);
  };

  const processQrCode = async (qrText) => {
    if (!qrText) {
      processingRef.current = false;
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("=== QR PROCESSING START ===");
      console.log("Mode:", mode);
      console.log("Raw QR:", qrText);

      let parsed;
      try {
        parsed = JSON.parse(qrText);
      } catch {
        parsed = { passId: qrText };
      }

      const passId = parsed.passId || parsed._id || qrText;
      console.log("Pass ID:", passId);

      if (!passId || passId === 'temp') {
        throw new Error("Invalid Pass ID");
      }

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

      console.log("=== API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("StatusText:", response.statusText);
      console.log("Full response.data:", JSON.stringify(response.data, null, 2));

      // Extract visitor data - CHECK ALL POSSIBLE LOCATIONS
      let visitor = null;
      
      console.log("=== EXTRACTING VISITOR ===");
      console.log("response.data.visitor:", response.data.visitor);
      console.log("response.data.checkLog:", response.data.checkLog);
      console.log("response.data.checkLog?.visitor:", response.data.checkLog?.visitor);
      
      if (response.data.visitor) {
        visitor = response.data.visitor;
        console.log("✅ Visitor from response.data.visitor");
      } else if (response.data.checkLog && response.data.checkLog.visitor) {
        visitor = response.data.checkLog.visitor;
        console.log("✅ Visitor from response.data.checkLog.visitor");
      } else {
        console.log("⚠️ NO VISITOR DATA FOUND!");
        console.log("Setting visitor to null - will show generic success");
      }

      console.log("Final visitor:", visitor);

      const checkLog = response.data.checkLog;
      const duration = response.data.duration;
      const alreadyCheckedIn = response.data.alreadyCheckedIn || false;

      console.log("Final checkLog:", checkLog);
      console.log("Final duration:", duration);
      console.log("Final alreadyCheckedIn:", alreadyCheckedIn);

      // SET RESULT AS SUCCESS
      setResult({
        success: true,
        message: response.data.message || "Operation successful",
        visitor: visitor,
        checkLog: checkLog,
        duration: duration,
        alreadyCheckedIn: alreadyCheckedIn
      });

      console.log("✅ Result set as SUCCESS");
      console.log("===================");

      // Callback for dashboard refresh
      if (onScanComplete) {
        setTimeout(() => {
          onScanComplete(response.data);
        }, 100);
      }

    } catch (err) {
      console.error("=== ERROR OCCURRED ===");
      console.error("Error:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Error response.data:", err.response?.data);
      console.error("Error response.status:", err.response?.status);
      console.error("===================");
      
      const errorMsg = err.response?.data?.message || err.message || "Failed to process QR";
      
      setError(errorMsg);
      setResult({
        success: false,
        message: errorMsg
      });
    } finally {
      setLoading(false);
      processingRef.current = false;
      console.log("=== PROCESSING COMPLETE ===");
    }
  };

  const handleClose = () => {
    setResult(null);
    setError("");
    setScanning(false);
    processingRef.current = false;
    lastProcessedQR.current = null;
  };

  const handleScanNext = () => {
    setResult(null);
    setError("");
    processingRef.current = false;
    lastProcessedQR.current = null;
    startScanning();
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
        </Paper>
      )}

      {error && !result && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {result && (
        <Dialog 
          open={true} 
          maxWidth="sm" 
          fullWidth
          onClose={(event, reason) => {
            if (reason !== 'backdropClick') {
              handleClose();
            }
          }}
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">
                {result.success ? (result.alreadyCheckedIn ? "ℹ️ Info" : "✅ Success!") : "❌ Failed"}
              </Typography>
              <Button onClick={handleClose} size="small">
                <CloseIcon />
              </Button>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <Box textAlign="center" mb={3}>
              {result.success ? (
                result.alreadyCheckedIn ? (
                  <InfoIcon sx={{ fontSize: 80, color: 'info.main', mb: 2 }} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                )
              ) : (
                <CancelIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              )}
              
              <Typography variant="h5" gutterBottom fontWeight="bold">
                {result.alreadyCheckedIn 
                  ? "Already Checked In" 
                  : mode === "checkin" ? "Check-In" : "Check-Out"
                } {result.success ? (result.alreadyCheckedIn ? "" : "Successful!") : "Failed"}
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
                        {result.visitor.name?.charAt(0) || 'V'}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="h6" fontWeight="bold">
                        {result.visitor.name || 'Visitor'}
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
                  <Box bgcolor={result.alreadyCheckedIn ? "info.light" : "success.light"} p={2} borderRadius={1}>
                    <Typography variant="body2" color={result.alreadyCheckedIn ? "info.dark" : "success.dark"} gutterBottom>
                      <strong>{result.alreadyCheckedIn ? "ℹ️" : "✅"} Check-In:</strong> {new Date(result.checkLog.checkInTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color={result.alreadyCheckedIn ? "info.dark" : "success.dark"}>
                      <strong>📍 Location:</strong> {result.checkLog.location || 'Main Entrance'}
                    </Typography>
                    {result.alreadyCheckedIn && (
                      <Typography variant="body2" color="info.dark" sx={{ mt: 1 }}>
                        💡 <strong>Tip:</strong> Use Check-Out Scanner to check out first
                      </Typography>
                    )}
                  </Box>
                )}

                {mode === "checkout" && result.duration && (
                  <Box bgcolor="info.light" p={2} borderRadius={1}>
                    <Typography variant="body2" color="info.dark" gutterBottom>
                      <strong>⏱️ Duration:</strong> {result.duration}
                    </Typography>
                    {result.checkLog?.checkOutTime && (
                      <Typography variant="body2" color="info.dark">
                        <strong>🚪 Check-Out:</strong> {new Date(result.checkLog.checkOutTime).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* Show success message even without visitor details */}
            {result.success && !result.visitor && (
              <Alert severity="success">
                ✅ {mode === "checkin" ? "Check-in" : "Check-out"} completed successfully! Dashboard updated.
              </Alert>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleScanNext}
              fullWidth
              size="large"
            >
              Scan Next Visitor
            </Button>
            <Button
              variant="outlined"
              onClick={handleClose}
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