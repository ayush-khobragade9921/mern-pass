import mongoose from "mongoose";
const checkLogSchema = new mongoose.Schema(
  {
    pass: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pass", 
      required: true 
    },
    visitor: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Visitor",
      required: true
    },
    scannedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    checkInTime: { 
      type: Date,
      default: Date.now
    },
    checkOutTime: { 
      type: Date 
    },
    location: {
      type: String,
      default: 'Main Entrance'
    },
    duration: {
      type: Number // Duration in minutes
    }
  },
  { timestamps: true }
);
export default mongoose.model("CheckLog", checkLogSchema);