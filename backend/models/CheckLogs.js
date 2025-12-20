import mongoose from "mongoose";

const checkLogSchema = new mongoose.Schema(
  {
    pass: { type: mongoose.Schema.Types.ObjectId, ref: "Pass", required: true },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("CheckLog", checkLogSchema);
