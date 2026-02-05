import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, images } from "@/db/schema";
import { eq, ne, asc } from "drizzle-orm";

// GET /api/categories/all — Public, no authentication required
export async function GET() {
  try {
    const rows = await db
      .select({
        categoryName: categories.name,
        imageName: images.name,
        productUrl: images.productUrl,
        imageUrl: images.imageUrl,
        thumbnailUrl: images.thumbnailUrl,
      })
      .from(categories)
      .leftJoin(images, eq(images.categoryId, categories.id))
      .where(ne(categories.id, "000000"))
      .orderBy(asc(categories.name));

    // Group rows by category
    const map = new Map<string, { name: string; productUrl: string | null; imageUrl: string | null; thumbnailUrl: string | null }[]>();

    for (const row of rows) {
      if (!map.has(row.categoryName)) {
        map.set(row.categoryName, []);
      }

      // LEFT JOIN produces a null image row when a category has no images
      if (row.imageName) {
        map.get(row.categoryName)!.push({
          name: row.imageName,
          productUrl: row.productUrl,
          imageUrl: row.imageUrl,
          thumbnailUrl: row.thumbnailUrl,
        });
      }
    }

    const result = Array.from(map, ([name, products]) => ({ name, products }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching categories/all:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi lấy dữ liệu." },
      { status: 500 },
    );
  }
}
