import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    amount: { type: Number, required: true },
    purpose: { type: String, required: true }, // e.g., "Education", "Health", "Event"
    method: {
      type: String,
      enum: ["Cash", "UPI", "Card", "Online"],
      required: true,
    },
    profession: { type: String },
    transactionId: { type: String }, // if digital payment
    date: { type: Date, default: Date.now },
    remarks: { type: String },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const donationModel =
  mongoose.models.donation || mongoose.model("donation", donationSchema);

export default donationModel;
