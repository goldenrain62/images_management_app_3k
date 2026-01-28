import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      maxlength: [225, "Tên không được vượt quá 225 ký tự"],
      trim: true,
    },
    size: {
      type: Number,
    },
    productUrl: {
      type: String,
      maxlength: [250, "Product URL không được vượt quá 250 ký tự"],
    },
    imageUrl: {
      type: String,
      unique: true,
      maxlength: 250,
    },
    thumbnailUrl: {
      type: String,
      unique: true,
      maxlength: 250,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Danh mục là bắt buộc"],
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người tải lên là bắt buộc"],
    },
  },
  { timestamps: true },
);

export default mongoose.models.Image || mongoose.model("Image", ImageSchema);
