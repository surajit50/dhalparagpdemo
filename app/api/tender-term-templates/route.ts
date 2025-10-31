import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - List templates; supports optional ids query param (comma-separated)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (idsParam) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      const templates = await db.tenderTermTemplate.findMany({
        where: { id: { in: ids } },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(templates);
    }

    const templates = await db.tenderTermTemplate.findMany({
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST - Create a template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, content, isActive } = body as {
      name?: string;
      description?: string;
      content?: string;
      isActive?: boolean;
    };

    if (!name || !content) {
      return NextResponse.json(
        { message: "Name and content are required" },
        { status: 400 }
      );
    }

    const created = await db.tenderTermTemplate.create({
      data: {
        name,
        description: description ?? null,
        content,
        isActive: isActive ?? true,
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { message: "Template name must be unique" },
        { status: 409 }
      );
    }
    console.error("Error creating template:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}


