import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const docType = formData.get("docType") as string;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Only PDF, JPG, PNG allowed." }, { status: 400 });
  }

  // Validate extension
  const originalExt = file.name.split(".").pop()?.toLowerCase();
  const allowedExtensions = ["jpg", "jpeg", "png", "pdf"];
  if (!originalExt || !allowedExtensions.includes(originalExt)) {
    return NextResponse.json({ error: "Invalid file extension." }, { status: 400 });
  }

  // Validate size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }

  const userId = session.user.id;
  const athlete = await prisma.athlete.findUnique({ where: { userId } });
  if (!athlete) return NextResponse.json({ error: "Athlete not found" }, { status: 404 });

  // Save file securely outside public directory
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Basic magic bytes check (JPEG, PNG, PDF)
  const magic = buffer.toString("hex", 0, 4);
  const isValidMagic = magic.startsWith("ffd8") || magic.startsWith("89504e47") || magic.startsWith("25504446");
  if (!isValidMagic) {
    return NextResponse.json({ error: "File content does not match extension." }, { status: 400 });
  }

  const fileName = `${athlete.id}-${Date.now()}.${originalExt}`;
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "uploads");
  
  try {
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, fileName), buffer);
  } catch {
    return NextResponse.json({ error: "File save failed" }, { status: 500 });
  }

  const doc = await prisma.document.create({
    data: {
      athleteId: athlete.id,
      docType: docType as any,
      fileUrl: `/api/documents/download?file=${fileName}`, // Changed to authenticated download route
      fileName: file.name,
      fileSize: file.size,
    },
  });

  return NextResponse.json({ success: true, documentId: doc.id, fileUrl: doc.fileUrl });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const athlete = await prisma.athlete.findUnique({
    where: { userId: session.user.id },
    include: { documents: { orderBy: { uploadedAt: "desc" } } },
  });

  return NextResponse.json(athlete?.documents || []);
}
