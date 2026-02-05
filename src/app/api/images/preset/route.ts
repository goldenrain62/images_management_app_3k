import { NextResponse } from "next/server";
import { db } from "@/db";
import { images } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/images/preset — Public, no authentication required
export async function GET() {
  try {
    const rows = await db
      .select({ productUrl: images.productUrl })
      .from(images)
      .where(eq(images.categoryId, "000000"));

    const result = rows
      .map((row) => row.productUrl)
      .filter((url): url is string => url !== null);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching preset images:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy dữ liệu." },
      { status: 500 },
    );
  }
}
