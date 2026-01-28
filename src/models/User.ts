import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "./Role";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      // This Regex checks for the standard email format
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập email hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      minlength: [8, "Mật khẩu phải có ít nhất 8 ký tự"],
      maxlength: [100, "Mật khẩu quá dài"],
    },
    name: {
      type: String,
      required: [true, "Vui lòng nhập họ tên đầy đủ"],
      minlength: [1, "Họ tên phải có ít nhất 1 kí tự"],
      maxlength: [150, "Họ tên không được quá 150 ký tự"],
    },
    isActive: {
      type: Number,
      enum: [0, 1], // Restricts input to only 0 or 1
      default: 1, // Default to 'yes'
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Vui lòng chọn quyền cho tài khoản"],
    },
  },
  { timestamps: true },
);

// --- PASSWORD HASHING MIDDLEWARE ---
UserSchema.pre("save", async function () {
  // 'this' refers to the user document
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// --- HELPER METHOD TO CHECK PASSWORD ---
// This lets you call user.comparePassword("input") later during login
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
