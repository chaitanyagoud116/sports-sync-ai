import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) {
    return NextResponse.json({ error: "Invalid file request" }, { status: 400 });
  }

  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
  const filePath = path.join(uploadDir, file);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const fileBuffer = await readFile(filePath);
    
    // Determine content type
    const ext = file.split(".").pop()?.toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === "pdf") contentType = "application/pdf";
    if (ext === "png") contentType = "image/png";
    if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${file}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
