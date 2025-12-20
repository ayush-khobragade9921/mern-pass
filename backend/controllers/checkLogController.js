import CheckLog from '../models/CheckLogs.js';
import Pass from '../models/Pass.js';
import Visitor from '../models/Visitor.js';

export const checkIn = async (req, res) => {
  try {
    const { passId, location = 'Main Entrance' } = req.body;

    // Verify pass exists and is valid
    const pass = await Pass.findById(passId)
      .populate('visitor', 'name email phone');

    if (!pass) {
      return res.status(404).json({ message: 'Pass not found' });
    }

    // Check if pass is valid
    const now = new Date();
    if (now < new Date(pass.validFrom) || now > new Date(pass.validTo)) {
      return res.status(400).json({ message: 'Pass is not valid for today' });
    }

    if (pass.status !== 'active') {
      return res.status(400).json({ message: `Pass is ${pass.status}` });
    }

    // Check if already checked in (no checkout yet)
    const existingCheckIn = await CheckLog.findOne({
      pass: passId,
      checkOutTime: null
    });

    if (existingCheckIn) {
      return res.status(400).json({ 
        message: 'Visitor already checked in',
        checkLog: existingCheckIn 
      });
    }

    // Create check-in log
    const checkLog = new CheckLog({
      pass: passId,
      visitor: pass.visitor._id,
      checkInTime: now,
      location,
      securityOfficer: req.user._id
    });

    await checkLog.save();

    // Populate for response
    await checkLog.populate('visitor', 'name email phone');
    await checkLog.populate('securityOfficer', 'name');

    res.status(201).json({
      message: 'Check-in successful',
      checkLog,
      visitor: pass.visitor
    });
  } catch (err) {
    console.error('Check-in error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { passId } = req.body;

    // Find active check-in log
    const checkLog = await CheckLog.findOne({
      pass: passId,
      checkOutTime: null
    }).populate('visitor', 'name email phone');

    if (!checkLog) {
      return res.status(404).json({ 
        message: 'No active check-in found for this pass' 
      });
    }

    // Update with checkout time
    checkLog.checkOutTime = new Date();
    
    // Calculate duration in minutes
    const duration = Math.round((checkLog.checkOutTime - checkLog.checkInTime) / 60000);
    checkLog.duration = duration;

    await checkLog.save();

    res.json({
      message: 'Check-out successful',
      checkLog,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`
    });
  } catch (err) {
    console.error('Check-out error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const getTodayCheckIns = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkLogs = await CheckLog.find({
      checkInTime: { $gte: today }
    })
      .populate('visitor', 'name email phone photo')
      .populate('pass', 'validFrom validTo')
      .populate('securityOfficer', 'name')
      .sort({ checkInTime: -1 });

    // Separate active (checked in) vs completed (checked out)
    const active = checkLogs.filter(log => !log.checkOutTime);
    const completed = checkLogs.filter(log => log.checkOutTime);

    res.json({
      total: checkLogs.length,
      active: active.length,
      completed: completed.length,
      checkLogs: {
        active,
        completed
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllCheckLogs = async (req, res) => {
  try {
    const { startDate, endDate, visitor, status } = req.query;
    
    const filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.checkInTime = {};
      if (startDate) filter.checkInTime.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.checkInTime.$lte = end;
      }
    }

    // Visitor filter
    if (visitor) filter.visitor = visitor;

    // Status filter (active = no checkout, completed = has checkout)
    if (status === 'active') {
      filter.checkOutTime = null;
    } else if (status === 'completed') {
      filter.checkOutTime = { $ne: null };
    }

    const checkLogs = await CheckLog.find(filter)
      .populate('visitor', 'name email phone photo')
      .populate('pass', 'validFrom validTo')
      .populate('securityOfficer', 'name')
      .sort({ checkInTime: -1 });

    res.json(checkLogs);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCheckLogById = async (req, res) => {
  try {
    const checkLog = await CheckLog.findById(req.params.id)
      .populate('visitor', 'name email phone photo')
      .populate('pass')
      .populate('securityOfficer', 'name role');

    if (!checkLog) {
      return res.status(404).json({ message: 'Check log not found' });
    }

    res.json(checkLog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getVisitorHistory = async (req, res) => {
  try {
    const { visitorId } = req.params;

    const history = await CheckLog.find({ visitor: visitorId })
      .populate('pass', 'validFrom validTo')
      .populate('securityOfficer', 'name')
      .sort({ checkInTime: -1 })
      .limit(20);

    const stats = {
      totalVisits: history.length,
      lastVisit: history[0]?.checkInTime,
      averageDuration: history
        .filter(log => log.duration)
        .reduce((sum, log) => sum + log.duration, 0) / history.filter(log => log.duration).length || 0
    };

    res.json({
      stats,
      history
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getCheckInStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const [todayCount, weekCount, monthCount, activeNow] = await Promise.all([
      CheckLog.countDocuments({ checkInTime: { $gte: today } }),
      CheckLog.countDocuments({ checkInTime: { $gte: thisWeek } }),
      CheckLog.countDocuments({ checkInTime: { $gte: thisMonth } }),
      CheckLog.countDocuments({ 
        checkInTime: { $gte: today },
        checkOutTime: null 
      })
    ]);

    // Get hourly distribution for today
    const hourlyData = await CheckLog.aggregate([
      {
        $match: { checkInTime: { $gte: today } }
      },
      {
        $group: {
          _id: { $hour: '$checkInTime' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      activeNow,
      hourlyDistribution: hourlyData.map(h => ({
        hour: h._id,
        count: h.count
      }))
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};