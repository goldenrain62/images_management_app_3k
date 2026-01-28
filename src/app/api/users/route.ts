// src/app/api/users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, password, name, role, isActive } = body;

    // 1. Check if user already exists (Manual check for better error message)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được đăng ký" },
        { status: 400 },
      );
    }

    // 2. Create the user
    // The password will be hashed automatically by the UserSchema.pre hook!
    const newUser = await User.create({
      email,
      password,
      name,
      role, // This should be the MongoDB ID of the role
      isActive: isActive ?? 1,
    });

    // 3. Remove password from the response for security
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      { message: "Người dùng đã được tạo", data: userResponse },
      { status: 201 },
    );
  } catch (error: any) {
    // Handle Mongoose Validation Errors (minlength, required, etc.)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    console.error("User Creation Error:", error);
    return NextResponse.json({ error: "Lỗi máy chủ nội bộ" }, { status: 500 });
  }
}
