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

      // Laptop me ALWAYS front cam, mobile me back cam
      const defaultCamera = cameras.find(cam => cam.label.toLowerCase().includes("back"))
        || cameras[0];

      await scanner.start(
        { deviceId: { exact: defaultCamera.id } },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        handleQrCodeDetected,
        () => {}
      );
    } catch (err) {
      console.log(err);
      setError("Unable to start camera. Give camera permission.");
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
  };

  const handleQrCodeDetected = (text) => {
    stopScanning();
    processQrCode(text);
  };

  const processQrCode = async (qrText) => {
    if (!qrText || loading) return;

    setLoading(true);
    try {
      let parsed;
      try {
        parsed = JSON.parse(qrText);
      } catch {
        parsed = { passId: qrText };
      }

      const passId = parsed.passId || parsed._id || qrText;

      let response;
      if (mode === "checkin") {
        response = await api.post("/checklogs/checkin", {
          passId,
          location: "Main Entrance"
        });
      } else {
        response = await api.post("/checklogs/checkout", { passId });
      }

      setResult({
        success: true,
        message: response.data.message,
        visitor: response.data.visitor,
        checkLog: response.data.checkLog,
        duration: response.data.duration
      });

      onScanComplete && onScanComplete(response.data);
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || "Failed to process QR."
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
          <Typography variant="h5">
            {mode === "checkin" ? "Check-In" : "Check-Out"}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={startScanning}
            sx={{ mt: 2 }}
            startIcon={<QrCodeScannerIcon />}
          >
            Start QR Scanner
          </Button>
        </Box>
      )}

      {scanning && !result && (
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between">
            <Typography>🎥 Scanner Active</Typography>
            <Button color="error" variant="outlined" onClick={stopScanning}>
              Stop
            </Button>
          </Box>

          <div
            id="qr-reader"
            style={{
              width: "100%",
              maxWidth: 500,
              margin: "0 auto",
              marginTop: 20
            }}
          />

          {loading && (
            <Box textAlign="center" mt={2}>
              <CircularProgress />
            </Box>
          )}
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {result && (
        <Dialog open={true} maxWidth="sm" fullWidth>
          <DialogTitle>
            {result.success ? "Success" : "Failed"}
          </DialogTitle>
          <DialogContent>
            <Typography>{result.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => {
                setResult(null);
                startScanning();
              }}
              fullWidth
            >
              Scan Next
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setResult(null);
                setScanning(false);
              }}
              fullWidth
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