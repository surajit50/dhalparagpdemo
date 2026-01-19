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

    const { searchParams } = new URL(request.url);
    const latest = searchParams.get("latest");

    if (latest === "true") {
      const billAbstract = await db.workBillAbstract.findFirst({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          entries: true,
        },
      });

      return NextResponse.json(billAbstract);
    } else {
      const billAbstracts = await db.workBillAbstract.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          entries: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json(billAbstracts);
    }
  } catch (error) {
    console.error("Error fetching bill abstracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch bill abstracts" },
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

    const body = await request.json();
    const {
      billType,
      period,
      contractualPercentage,
      itemwiseTotal,
      contractualDeduction,
      actualValue,
      entries,
    } = body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return NextResponse.json(
        { error: "Missing entries" },
        { status: 400 }
      );
    }

    // Generate bill number
    const billCount = await db.workBillAbstract.count({
      where: {
        userId: session.user.id,
      },
    });
    const billNumber = `BILL-${billCount + 1}`;

    // Create bill abstract with entries
    const billAbstract = await db.workBillAbstract.create({
      data: {
        userId: session.user.id,
        billNumber,
        billType: billType || "1st & Final Bill",
        period: period || "",
        contractualPercentage: contractualPercentage || 0,
        itemwiseTotal: itemwiseTotal || 0,
        contractualDeduction: contractualDeduction || 0,
        actualValue: actualValue || 0,
        entries: {
          create: entries.map((entry: any) => ({
            mbNumber: entry.mbNumber,
            mbPageNumber: entry.mbPageNumber,
            workItemDescription: entry.workItemDescription,
            unit: entry.unit,
            quantityExecuted: entry.quantityExecuted,
            rate: entry.rate,
            amount: entry.amount,
            remarks: entry.remarks || null,
          })),
        },
      },
      include: {
        entries: true,
      },
    });

    revalidatePath("/admindashboard/work-manage/bill-abstract");

    return NextResponse.json({
      success: true,
      data: billAbstract,
      message: "Bill abstract saved successfully",
    });
  } catch (error) {
    console.error("Error saving bill abstract:", error);
    return NextResponse.json(
      { error: "Failed to save bill abstract" },
      { status: 500 }
    );
  }
}
