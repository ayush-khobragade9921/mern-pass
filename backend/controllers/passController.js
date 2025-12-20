import Pass from '../models/Pass.js';
import Visitor from '../models/Visitor.js';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generatePass = async (req, res) => {
  try {
    const { visitor, appointment, validFrom, validTo } = req.body;
    
    // Validate inputs
    if (!visitor || !validFrom || !validTo) {
      return res.status(400).json({ 
        error: 'visitor, validFrom, and validTo are required' 
      });
    }

    // Check if visitor exists
    const visitorData = await Visitor.findById(visitor);
    if (!visitorData) {
      return res.status(404).json({ error: 'Visitor not found' });
    }

    // Generate QR code
    const qrData = {
      passId: 'temp',
      visitorId: visitor,
      visitorName: visitorData.name,
      validFrom: validFrom,
      validTo: validTo,
      timestamp: Date.now()
    };
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    // Create pass with issuedBy field
    const pass = new Pass({ 
      visitor, 
      appointment, 
      qrCode, 
      validFrom, 
      validTo,
      issuedBy: req.user._id,  // Add issuedBy field
      status: 'active'
    });
    await pass.save();

    // Update QR code with actual pass ID
    qrData.passId = pass._id.toString();
    const finalQrCode = await QRCode.toDataURL(JSON.stringify(qrData));
    pass.qrCode = finalQrCode;

    // Generate PDF
    const uploadsDir = 'uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const doc = new PDFDocument();
    const pdfPath = path.join(uploadsDir, `pass-${pass._id}.pdf`);
    doc.pipe(fs.createWriteStream(pdfPath));

    // PDF Content
    doc.fontSize(20).text('Visitor Pass', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Pass ID: ${pass._id}`);
    doc.text(`Visitor: ${visitorData.name}`);
    doc.text(`Phone: ${visitorData.phone || 'N/A'}`);
    doc.text(`Valid From: ${new Date(validFrom).toLocaleDateString()}`);
    doc.text(`Valid To: ${new Date(validTo).toLocaleDateString()}`);
    doc.moveDown();
    doc.text('QR Code:', { align: 'center' });
    
    // Add QR code image to PDF
    const qrBuffer = Buffer.from(finalQrCode.split(',')[1], 'base64');
    doc.image(qrBuffer, { 
      fit: [200, 200], 
      align: 'center' 
    });
    
    doc.end();

    pass.pdfPath = pdfPath;
    await pass.save();

    // Populate for response
    await pass.populate('visitor', 'name email phone');
    await pass.populate('issuedBy', 'name role');
    if (appointment) {
      await pass.populate('appointment', 'scheduledDate purpose');
    }

    res.status(201).json({ 
      message: 'Pass generated successfully',
      pass, 
      pdfUrl: `/${pdfPath}`,
      qrCode: finalQrCode
    });
  } catch (err) {
    console.error('Generate pass error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const getPass = async (req, res) => {
  try {
    const pass = await Pass.findById(req.params.id)
      .populate('visitor', 'name email phone')
      .populate('appointment', 'scheduledDate status purpose')
      .populate('issuedBy', 'name role');
      
    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    res.json(pass);
  } catch (err) {
    console.error('Get pass error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const getAllPasses = async (req, res) => {
  try {
    const passes = await Pass.find()
      .populate('visitor', 'name email phone')
      .populate('appointment', 'scheduledDate purpose')
      .populate('issuedBy', 'name role')
      .sort({ createdAt: -1 });
      
    res.json(passes);
  } catch (err) {
    console.error('Get all passes error:', err);
    res.status(400).json({ error: err.message });
  }
};