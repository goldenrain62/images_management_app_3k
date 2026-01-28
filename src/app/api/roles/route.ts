// app/api/roles/route.ts
import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb"; // Use the db utility we created earlier
import Role from "@/models/Role";

export async function POST(request: NextRequest) {
  try {
    // 1. Connect to the database
    await dbConnect();

    // 2. Parse the body from the request
    const body = await request.json();
    const { name, description } = body;

    // 3. Create the new role
    const newRole = await Role.create({
      name,
      description,
    });

    // 4. Return success response
    return NextResponse.json(
      { message: "Role created successfully", data: newRole },
      { status: 201 },
    );
  } catch (error: any) {
    // 5. Handle Mongoose Validation Errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message,
      );
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    // Handle Duplicate Key Error (if you add unique: true later)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Role name already exists" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
