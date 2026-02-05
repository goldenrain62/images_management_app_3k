import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/images/preset — Public, no authentication required
export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin;

    const rows = await db
      .select({ imageUrl: images.imageUrl })
      .from(images)
      .where(eq(images.categoryId, "000000"));

    const result = rows.map((row) => `${origin}${row.imageUrl}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching preset images:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy dữ liệu." },
      { status: 500 },
    );
  }
}
