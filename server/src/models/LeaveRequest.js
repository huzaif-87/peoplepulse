const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true
    },
    leaveType: {
      type: String,
      required: [true, "Leave type is required"],
      enum: {
        values: ["Annual", "Sick", "Personal", "Emergency"],
        message: "{VALUE} is not a valid leave type"
      }
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be greater than or equal to start date"
      }
    },
    reason: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      required: [true, "Leave request status is required"],
      enum: {
        values: ["Pending", "Approved", "Rejected"],
        message: "{VALUE} is not a valid leave request status"
      },
      default: "Pending"
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

leaveRequestSchema.index({ employeeId: 1 });
leaveRequestSchema.index({ status: 1, employeeId: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
