import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Image from "@/models/Image";

export async function GET(
  request: NextRequest,
  // 1. Update type to Promise
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const { id } = await params;

    // 1. Get the Category Name
    const category = await Category.findById(id).select("name").lean();
    if (!category)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 2. Get the Images separately (This avoids the StrictPopulateError)
    const images = await Image.find({ category: id })
      .populate("uploader", "name email image")
      .sort({ createdAt: -1 })
      .lean();

    // 3. Merge them into the format your frontend expects
    return NextResponse.json({
      ...category,
      images: images,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
