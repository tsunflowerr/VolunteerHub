import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  status: {type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending"},
  registerAt: { type: Date, default: Date.now }
}, { timestamps: true });
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
const Registration = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);

export default Registration;
