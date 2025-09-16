import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, quantityToDeduct } = body;

    if (!productId || quantityToDeduct === undefined || quantityToDeduct < 0) {
      return NextResponse.json(
        { error: "Product ID and valid quantity are required" },
        { status: 400 }
      );
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if enough quantity is available
    if (product.quantity < quantityToDeduct) {
      return NextResponse.json(
        {
          error: "Insufficient quantity",
          available: product.quantity,
          requested: quantityToDeduct,
        },
        { status: 400 }
      );
    }

    // Update quantity
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(productId) },
      data: {
        quantity: product.quantity - quantityToDeduct,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product quantity:", error);
    return NextResponse.json(
      { error: "Failed to update product quantity" },
      { status: 500 }
    );
  }
}
