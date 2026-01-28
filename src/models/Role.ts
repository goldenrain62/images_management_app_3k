import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
        type: String,
        required: [true, "Role needs a name"],
        unique: true,
        maxlength: 50 
    },
    description: {
      type: String,
      required: [true, "Role needs a description to show that what an account can do with this role."],
      maxlength: [150, "Role description cannot be more than 150 characters"],
    },
  },
  { timestamps: true },
);

export default mongoose.models.Role ||
  mongoose.model("Role", RoleSchema);