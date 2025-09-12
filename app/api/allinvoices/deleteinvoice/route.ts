import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // First delete related invoice items
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: Number(id) },
    });

    // Then delete the invoice
    await prisma.invoice.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting invoice:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
