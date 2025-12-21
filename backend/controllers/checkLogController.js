import CheckLog from '../models/CheckLogs.js';
import Pass from '../models/Pass.js';
import Visitor from '../models/Visitor.js';

export const checkIn = async (req, res) => {
  try {
    const { passId, location = 'Main Entrance' } = req.body;

    console.log('=== CHECK-IN REQUEST ===');
    console.log('Pass ID:', passId);

    // Verify pass exists
    const pass = await Pass.findById(passId)
      .populate('visitor', 'name email phone photo');

    if (!pass) {
      console.log('❌ Pass not found');
      return res.status(404).json({ message: 'Pass not found' });
    }

    console.log('✅ Pass found:', pass._id);
    console.log('Valid From:', pass.validFrom);
    console.log('Valid To:', pass.validTo);
    console.log('Status:', pass.status);

    // DATE VALIDATION LOGIC
    const now = new Date();
    const validFrom = new Date(pass.validFrom);
    const validTo = new Date(pass.validTo);

    // Set time to start of day for comparison
    now.setHours(0, 0, 0, 0);
    validFrom.setHours(0, 0, 0, 0);
    validTo.setHours(0, 0, 0, 0);

    console.log('Today (normalized):', now);
    console.log('Valid From (normalized):', validFrom);
    console.log('Valid To (normalized):', validTo);

    // LOGIC: Pass valid agar
    // 1. validFrom aaj ya pehle ho (validFrom <= aaj)
    // 2. validTo aaj ya baad mein ho (aaj <= validTo)
    if (validFrom > now) {
      console.log('❌ Pass not yet valid');
      return res.status(400).json({ 
        message: `Pass not yet valid. Valid from: ${validFrom.toLocaleDateString()}`
      });
    }

    if (now > validTo) {
      console.log('❌ Pass has expired');
      return res.status(400).json({ 
        message: `Pass expired. Valid until: ${validTo.toLocaleDateString()}`
      });
    }

    console.log('✅ Date validation passed');

    // Check pass status
    if (pass.status !== 'active') {
      console.log('❌ Pass is', pass.status);
      return res.status(400).json({ message: `Pass is ${pass.status}` });
    }

    console.log('✅ Pass is active');

    // Check if already checked in
    const existingCheckIn = await CheckLog.findOne({
      pass: passId,
      checkOutTime: null
    });

    if (existingCheckIn) {
      console.log('❌ Already checked in');
      return res.status(400).json({ 
        message: 'Visitor already checked in',
        checkLog: existingCheckIn 
      });
    }

    console.log('✅ Creating check-in log');

    // Create check-in log
    const checkLog = new CheckLog({
      pass: passId,
      visitor: pass.visitor._id,
      checkInTime: new Date(), // Current time
      location,
      securityOfficer: req.user._id
    });

    await checkLog.save();

    // Populate for response
    await checkLog.populate('visitor', 'name email phone photo');
    await checkLog.populate('securityOfficer', 'name');

    console.log('✅ Check-in successful!');

    res.status(201).json({
      message: 'Check-in successful',
      checkLog,
      visitor: pass.visitor
    });
  } catch (err) {
    console.error('❌ Check-in error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { passId } = req.body;

    console.log('=== CHECK-OUT REQUEST ===');
    console.log('Pass ID:', passId);

    // Find active check-in log
    const checkLog = await CheckLog.findOne({
      pass: passId,
      checkOutTime: null
    }).populate('visitor', 'name email phone photo');

    if (!checkLog) {
      console.log('❌ No active check-in found');
      return res.status(404).json({ 
        message: 'No active check-in found for this pass' 
      });
    }

    console.log('✅ Active check-in found');

    // Update with checkout time
    checkLog.checkOutTime = new Date();
    
    // Calculate duration in minutes
    const duration = Math.round((checkLog.checkOutTime - checkLog.checkInTime) / 60000);
    checkLog.duration = duration;

    await checkLog.save();

    console.log('✅ Check-out successful, duration:', duration, 'minutes');

    res.json({
      message: 'Check-out successful',
      checkLog,
      visitor: checkLog.visitor,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`
    });
  } catch (err) {
    console.error('❌ Check-out error:', err);
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

    if (startDate || endDate) {
      filter.checkInTime = {};
      if (startDate) filter.checkInTime.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.checkInTime.$lte = end;
      }
    }

    if (visitor) filter.visitor = visitor;

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