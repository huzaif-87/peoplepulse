const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters long"]
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email address"
      ]
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      enum: {
        values: [
          "Engineering",
          "Design",
          "Sales",
          "Marketing",
          "HR",
          "Finance",
          "Operations"
        ],
        message: "{VALUE} is not a valid department"
      }
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      enum: {
        values: [
          "Chennai",
          "Bangalore",
          "Hyderabad",
          "Mumbai",
          "Pune",
          "Delhi",
          "Remote"
        ],
        message: "{VALUE} is not a valid location"
      }
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"]
    },
    employmentType: {
      type: String,
      required: [true, "Employment type is required"],
      enum: {
        values: ["Full-time", "Part-time", "Contract", "Intern"],
        message: "{VALUE} is not a valid employment type"
      }
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Active", "On Leave", "Inactive"],
        message: "{VALUE} is not a valid status"
      },
      default: "Active"
    },
    skills: {
      type: [String],
      default: []
    },
    manager: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes to optimize frequent query/filter requirements
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ location: 1 });
employeeSchema.index({ employmentType: 1 });
employeeSchema.index({ joiningDate: -1 });
employeeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Employee", employeeSchema);
