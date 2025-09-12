import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); // ✅ Create an instance

// ✅ Create or update invoice (DRAFT or FINAL)
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      invoiceNumber,
      invoiceDate,
      dueDate,
      customerInfo,
      shippingInfo,
      items,
      subtotal,
      cgst,
      sgst,
      total,
      advancePaid,
      balanceDue,
      totalInWords,
      deliveryDate,
      status, // "DRAFT" or "FINAL"
    } = data;

    // ✅ Upsert Customer
    const customer = await prisma.customer.upsert({
      where: { number: customerInfo.number },
      update: {
        name: customerInfo.name,
        address: customerInfo.address,
      },
      create: {
        name: customerInfo.name,
        number: customerInfo.number,
        address: customerInfo.address,
      },
    });

    // ✅ Create Shipping Info (optional)
    let shipping = null;
    if (shippingInfo?.address) {
      shipping = await prisma.shippingInfo.create({
        data: {
          name: shippingInfo.name,
          address: shippingInfo.address,
          customerId: customer.id,
        },
      });
    }

    // ✅ Create or Update Invoice
    const invoice = await prisma.invoice.upsert({
      where: { invoiceNumber },
      update: {
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        customerId: customer.id,
        shippingId: shipping?.id,
        subtotal,
        cgst,
        sgst,
        total,
        advancePaid,
        balanceDue,
        totalInWords,
        deliveryDate: new Date(deliveryDate),
        status,
      },
      create: {
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        customerId: customer.id,
        shippingId: shipping?.id,
        subtotal,
        cgst,
        sgst,
        total,
        advancePaid,
        balanceDue,
        totalInWords,
        deliveryDate: new Date(deliveryDate),
        status,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            description: item.description || "",
            notes: item.notes || "",
          })),
        },
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("❌ Error saving invoice:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ Fetch all invoices
export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        shipping: true,
        items: true,
      },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error("❌ Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// ✅ Delete Invoice
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // First delete items related to the invoice
    await prisma.invoiceItem.deleteMany({
      where: { invoiceId: Number(id) },
    });

    // Then delete the invoice itself
    await prisma.invoice.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Invoice deleted" });
  } catch (error: any) {
    console.error("❌ Error deleting invoice:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// ✅ Update Invoice (customer, number, remaining, status)
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { customer, remaining, status } = body;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data: {
        balanceDue: remaining,
        status,
        customer: customer
          ? {
              update: {
                name: customer.name,
                number: customer.number,
              },
            }
          : undefined,
      },
      include: { customer: true },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error: any) {
    console.error("❌ Error updating invoice:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
