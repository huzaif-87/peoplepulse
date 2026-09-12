const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true
    },
    date: {
      type: Date,
      required: [true, "Date is required"]
    },
    status: {
      type: String,
      required: [true, "Attendance status is required"],
      enum: {
        values: ["Present", "Absent", "Late", "Half Day"],
        message: "{VALUE} is not a valid attendance status"
      }
    },
    checkIn: {
      type: String,
      trim: true
    },
    checkOut: {
      type: String,
      trim: true
    },
    workingHours: {
      type: Number,
      min: [0, "Working hours cannot be negative"],
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index to prevent duplicate attendance on the same day for an employee
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
