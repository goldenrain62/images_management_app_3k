import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên danh mục là bắt buộc"],
      maxlength: [150, "Tên danh mục không được quá 150 ký tự"],
      trim: true,
    },
    images_qty: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tạo là bắt buộc"],
    },
  },
  { timestamps: true },
);

// Add indexes for better query performance
CategorySchema.index({ name: 1 });
CategorySchema.index({ creator: 1 });

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
