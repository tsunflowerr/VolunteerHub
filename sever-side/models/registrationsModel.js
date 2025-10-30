import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "event", required: true },
  status: {type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending"},
  registerAt: { type: Date, default: Date.now }
}, { timestamps: true });


registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });
registrationSchema.index({ eventId: 1, status: 1 });
registrationSchema.index({ userId: 1, status: 1 });
const Registration = mongoose.models.Registration || mongoose.model("registration", registrationSchema);

export default Registration;
