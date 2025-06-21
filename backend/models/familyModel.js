import mongoose from "mongoose";

const familySchema = new mongoose.Schema(
  {
    familyid: {
      type: String,
      required: true,
      unique: true,
    },
    familyname: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    familyaddress: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    gotra: {
      type: String,
      required: true,
    },
    mobile: {
      code: {
        type: String,
        default: "+91",
      },
      number: {
        type: String,
        default: "0000000000",
      },
    },

    memberids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);

const familyModel =
  mongoose.models.family || mongoose.model("family", familySchema);

export default familyModel;
