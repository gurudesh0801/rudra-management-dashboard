import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const data = await req.json();
    const params = await context.params;
    const { id } = params;

    let updateData: any = {
      status: data.status,
      balanceDue: data.remaining,
      advancePaid: data.advancePaid,
      customer: {
        update: {
          name: data.customer?.name,
          number: data.customer?.number,
        },
      },
    };

    // 🔹 Force values if status = PAID
    if (data.status?.toUpperCase() === "PAID") {
      updateData.balanceDue = 0;
      updateData.advancePaid = 0;
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data: updateData,
      include: { customer: true },
    });

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    console.error("❌ Error updating invoice:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
