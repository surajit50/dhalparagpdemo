import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const workId = searchParams.get("workId");

    const whereClause: any = {
      userId: session.user.id,
    };

    if (workId) {
      whereClause.workDetailId = workId;
    }

    const mbEntries = await db.workMeasurementBook.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(mbEntries);
  } catch (error) {
    console.error("Error fetching MB entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch MB entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { workId, entries } = body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Missing entries" },
        { status: 400 }
      );
    }

    // Create MB entries
    const createdEntries = await db.workMeasurementBook.createMany({
      data: entries.map((entry: any) => ({
        userId: userId,
        workDetailId: workId,
        estimateItemId: entry.estimateItemId,
        mbNumber: entry.mbNumber,
        mbPageNumber: entry.mbPageNumber,
        workItemDescription: entry.workItemDescription,
        unit: entry.unit,
        quantityExecuted: entry.quantityExecuted,
        rate: entry.rate,
        amount: entry.amount,
        measurements: entry.measurements || null,
        measuredDate: new Date(entry.measuredDate),
        measuredBy: entry.measuredBy,
        remarks: entry.remarks || null,
        status: "DRAFT",
      })),
    });

    revalidatePath("/admindashboard/work-manage/mb-create");

    return NextResponse.json({
      success: true,
      data: createdEntries,
      message: "MB entries saved successfully",
    });
  } catch (error) {
    console.error("Error saving MB entries:", error);
    return NextResponse.json(
      { error: "Failed to save MB entries" },
      { status: 500 }
    );
  }
}
