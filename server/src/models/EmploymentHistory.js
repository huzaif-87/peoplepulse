const mongoose = require("mongoose");

const employmentHistorySchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: {
        values: ["Joined", "Resigned", "Promoted", "Transferred"],
        message: "{VALUE} is not a valid employment event type"
      }
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"]
    },
    department: {
      type: String,
      trim: true
    },
    reason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

employmentHistorySchema.index({ employeeId: 1, eventDate: -1 });
employmentHistorySchema.index({ eventType: 1, eventDate: -1 });
employmentHistorySchema.index({ eventDate: -1 });

module.exports = mongoose.model("EmploymentHistory", employmentHistorySchema);
