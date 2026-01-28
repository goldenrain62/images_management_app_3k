import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    await dbConnect();

    // Fetch categories and populate the creator field (only returning name and email)
    const categories = await Category.find({})
      .populate("creator", "name email")
      .sort({ createdAt: -1 }); // Newest first

    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the body as a single object
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Tên danh mục là bắt buộc" },
        { status: 400 },
      );
    }

    // 3. Create a single category
    const newCategory = await Category.create({
      name: name.trim(),
      creator: (session.user as any).id, // Link to the logged-in user
      images_qty: 0,
      size: 0,
    });

    return NextResponse.json(
      { message: "Category created", data: newCategory },
      { status: 201 },
    );
  } catch (error: any) {
    // Handle duplicate names if you added 'unique: true' to your schema
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Tên danh mục này đã tồn tại" },
        { status: 400 },
      );
    }

    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
