const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    source: { type: String, trim: true, default: "unknown" },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "converted", "lost"],
      default: "new",
    },
    notes: [
      {
        text: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    history: [
      {
        changeType: {
          type: String,
          enum: ["CREATE", "STATUS_UPDATE", "FIELD_UPDATE", "DUPLICATE_MERGE"],
        },
        changedFields: { type: mongoose.Schema.Types.Mixed, default: {} },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
