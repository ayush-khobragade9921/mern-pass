import Visitor from '../models/Visitor.js';

export const createVisitor = async (req, res) => {
  try {
    const visitorData = { ...req.body, createdBy: req.user._id };
    if (req.file) {
      visitorData.profilePhoto = req.file.path; 
    }
    const visitor = new Visitor(visitorData);
    await visitor.save();
    res.status(201).json(visitor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find().populate('createdBy', 'name email');
    res.json(visitors);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
