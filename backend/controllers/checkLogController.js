import CheckLog from '../models/CheckLogs.js';
import Pass from '../models/Pass.js';
import Visitor from '../models/Visitor.js';

export const checkIn = async (req, res) => {
  try {
    const { passId, location = 'Main Entrance' } = req.body;

    console.log('=== CHECK-IN REQUEST ===');
    console.log('Pass ID:', passId);
    console.log('Location:', location);

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

    // SIMPLE DATE VALIDATION
    const now = new Date();
    const validFrom = new Date(pass.validFrom);
    const validTo = new Date(pass.validTo);

    console.log('Current Time:', now.toLocaleString());
    console.log('Pass Valid From:', validFrom.toLocaleString());
    console.log('Pass Valid To:', validTo.toLocaleString());

    if (now < validFrom) {
      console.log('❌ Pass not yet valid');
      return res.status(400).json({ 
        message: `Pass not yet valid. Valid from: ${validFrom.toLocaleString()}`
      });
    }

    if (now > validTo) {
      console.log('❌ Pass has expired');
      return res.status(400).json({ 
        message: `Pass expired. Valid until: ${validTo.toLocaleString()}`
      });
    }

    console.log('✅ Date validation passed - Pass is currently valid');

    // Check pass status
    if (pass.status !== 'active') {
      console.log('❌ Pass status is', pass.status);
      return res.status(400).json({ message: `Pass is ${pass.status}` });
    }

    console.log('✅ Pass is active');

    // Check if already checked in - POPULATE VISITOR DATA
    const existingCheckIn = await CheckLog.findOne({
      pass: passId,
      checkOutTime: null
    }).populate('visitor', 'name email phone photo');

    if (existingCheckIn) {
      console.log('⚠️ Visitor already checked in at:', existingCheckIn.checkInTime);
      
      // RETURN SUCCESS (200) WITH VISITOR DATA - NOT ERROR!
      return res.status(200).json({ 
        message: 'Visitor is already checked in',
        alreadyCheckedIn: true,
        checkLog: existingCheckIn,
        visitor: pass.visitor
      });
    }

    console.log('✅ No existing check-in found, creating new log');

    // Create check-in log
    const checkLog = new CheckLog({
      pass: passId,
      visitor: pass.visitor._id,
      checkInTime: new Date(),
      location,
      scannedBy: req.user._id
    });

    await checkLog.save();
    console.log('✅ Check-in log saved');

    // Populate for response
    await checkLog.populate('visitor', 'name email phone photo');
    await checkLog.populate('scannedBy', 'name');

    console.log('✅ CHECK-IN SUCCESSFUL!');
    console.log('Visitor:', pass.visitor.name);
    console.log('Time:', checkLog.checkInTime.toLocaleString());

    res.status(201).json({
      message: 'Check-in successful',
      checkLog,
      visitor: pass.visitor
    });
  } catch (err) {
    console.error('❌ CHECK-IN ERROR:', err);
    console.error('Error stack:', err.stack);
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
    console.log('Check-in time:', checkLog.checkInTime);

    // Update with checkout time
    checkLog.checkOutTime = new Date();
    
    // Calculate duration in minutes
    const duration = Math.round((checkLog.checkOutTime - checkLog.checkInTime) / 60000);
    checkLog.duration = duration;

    await checkLog.save();

    console.log('✅ CHECK-OUT SUCCESSFUL!');
    console.log('Check-out time:', checkLog.checkOutTime.toLocaleString());
    console.log('Duration:', duration, 'minutes');

    res.json({
      message: 'Check-out successful',
      checkLog,
      visitor: checkLog.visitor,
      duration: `${Math.floor(duration / 60)}h ${duration % 60}m`
    });
  } catch (err) {
    console.error('❌ CHECK-OUT ERROR:', err);
    console.error('Error stack:', err.stack);
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
      .populate('scannedBy', 'name')
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
      .populate('scannedBy', 'name')
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
      .populate('scannedBy', 'name role');

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
      .populate('scannedBy', 'name')
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