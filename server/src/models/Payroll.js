const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true
    },
    month: {
      type: String,
      required: [true, "Month (YYYY-MM) is required"],
      trim: true
    },
    baseSalary: {
      type: Number,
      required: [true, "Base salary is required"],
      min: [0, "Base salary cannot be negative"]
    },
    benefits: {
      type: Number,
      min: [0, "Benefits cannot be negative"],
      default: 0
    },
    bonus: {
      type: Number,
      min: [0, "Bonus cannot be negative"],
      default: 0
    },
    totalCost: {
      type: Number,
      required: [true, "Total cost is required"],
      min: [0, "Total cost cannot be negative"]
    }
  },
  {
    timestamps: true
  }
);

// Pre-validate hook to calculate totalCost consistently
payrollSchema.pre("validate", function () {
  const base = this.baseSalary || 0;
  const ben = this.benefits || 0;
  const bon = this.bonus || 0;
  this.totalCost = base + ben + bon;
});

payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });
payrollSchema.index({ month: -1 });

module.exports = mongoose.model("Payroll", payrollSchema);
