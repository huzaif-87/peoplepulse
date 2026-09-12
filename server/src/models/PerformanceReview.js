const mongoose = require("mongoose");

const performanceReviewSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true
    },
    reviewPeriod: {
      type: String,
      required: [true, "Review period is required"],
      trim: true
    },
    overallScore: {
      type: Number,
      required: [true, "Overall score is required"],
      min: [1, "Score must be at least 1"],
      max: [5, "Score cannot exceed 5"]
    },
    productivityScore: {
      type: Number,
      required: [true, "Productivity score is required"],
      min: [1, "Score must be at least 1"],
      max: [5, "Score cannot exceed 5"]
    },
    teamworkScore: {
      type: Number,
      required: [true, "Teamwork score is required"],
      min: [1, "Score must be at least 1"],
      max: [5, "Score cannot exceed 5"]
    },
    communicationScore: {
      type: Number,
      required: [true, "Communication score is required"],
      min: [1, "Score must be at least 1"],
      max: [5, "Score cannot exceed 5"]
    },
    goalsCompleted: {
      type: Number,
      required: [true, "Goals completed percentage is required"],
      min: [0, "Goals completed cannot be negative"],
      max: [100, "Goals completed cannot exceed 100%"]
    },
    reviewDate: {
      type: Date,
      required: [true, "Review date is required"]
    }
  },
  {
    timestamps: true
  }
);

performanceReviewSchema.index({ employeeId: 1 });
performanceReviewSchema.index({ reviewDate: -1 });

module.exports = mongoose.model("PerformanceReview", performanceReviewSchema);
