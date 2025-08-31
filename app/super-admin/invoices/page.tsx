"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Printer,
  Download,
  Save,
  Search,
  IndianRupee,
  PackageIcon,
  List,
  ReceiptIndianRupee,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import InvoicePDF from "@/components/InvoicePDF/InvoicePDF";
import { convertToWords } from "@/utils/numberToWords";
import { pdf } from "@react-pdf/renderer";

// Define types
interface Product {
  id: number;
  name: string;
  size: string;
  price: number;
  category: string;
}

interface InvoiceItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
  notes?: string;
  description?: string;
}

interface CustomerInfo {
  name: string;
  number: string;
  address: string;
}

const Invoices = () => {
  // State for customer information
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    number: "",
    address: "",
  });

  // State for shipping information
  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    address: "",
  });

  // State for invoice items
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // State for advance payment
  const [advancePayment, setAdvancePayment] = useState<number>(0);

  // State for GST
  const [includeGst, setIncludeGst] = useState<boolean>(true);

  // State for search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // State for selected product
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const [productsData, setProductsData] = useState<Product[]>([]);
  const [generatePdf, setGeneratePdf] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProductsData(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = productsData.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(productsData);
    }
  }, [searchQuery]);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const cgst = includeGst ? subtotal * 0.06 : 0;
  const sgst = includeGst ? subtotal * 0.06 : 0;
  const gstTotal = cgst + sgst;
  const total = subtotal + gstTotal;
  const advanceAmount = total * (advancePayment / 100);
  const balance = total - advanceAmount;

  // Handle customer info change
  const handleCustomerInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));

    // Auto-fill shipping info if empty
    if (name === "name" && !shippingInfo.name) {
      setShippingInfo((prev) => ({ ...prev, name: value }));
    }
    if (name === "address" && !shippingInfo.address) {
      setShippingInfo((prev) => ({ ...prev, address: value }));
    }
  };

  // Handle shipping info change
  const handleShippingInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    const product = productsData.find((p) => p.id === parseInt(productId));
    setSelectedProduct(product || null);
  };

  // Add item to invoice
  const handleAddItem = () => {
    if (!selectedProduct || quantity < 1) return;

    const newItem: InvoiceItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      quantity,
      price: selectedProduct.price,
      total: selectedProduct.price * quantity,
    };

    setItems([...items, newItem]);
    setSelectedProduct(null);
    setQuantity(1);
    setSearchQuery("");
  };

  // Remove item from invoice
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  // Handle print (for demo purposes)
  const handlePrint = () => {
    window.print();
  };

  // Generate invoice number (for demo purposes)
  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  // Get current date
  const invoiceDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Company details
  const companyDetails = {
    name: "Rudra Arts and Handicrafts",
    address: "Samata Nagar, Ganesh Nagar Lane No 1, Famous Chowk, New Sangavi",
    city: "Pune, Maharashtra 411061, India",
    gstin: "GSTIN 27AMWPV8148A1ZE",
    phone: "9595221296",
    email: "rudraarts30@gmail.com",
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6 font-open-sans">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold flex items-center text-[#954C2E] font-open-sans">
            <ReceiptIndianRupee className="mr-2 h-8 w-8" />{" "}
            {/* Increased size */}
            Create Invoice
          </h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="border-[#954C2E] text-[#954C2E] hover:bg-blue-50 font-open-sans"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              className="flex-1 bg-[#954C2E] hover:bg-[#734d26] text-white font-open-sans"
              onClick={async () => {
                const blob = await pdf(
                  <InvoicePDF
                    invoiceData={{
                      companyDetails,
                      invoiceNumber,
                      invoiceDate,
                      dueDate: invoiceDate,
                      customerInfo,
                      shippingInfo: shippingInfo.address
                        ? shippingInfo
                        : customerInfo,
                      items: items.map((item) => ({
                        name: item.name,
                        hsn: "970300",
                        quantity: item.quantity,
                        unit: "pcs",
                        rate: item.price,
                        cgst: 6,
                        sgst: 6,
                        amount: item.total,
                      })),
                      subtotal,
                      cgst,
                      sgst,
                      total,
                      totalInWords: `${convertToWords(total)} Only`,
                      deliveryDate: new Date().toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }),
                    }}
                    logoUrl="/images/logo.png"
                  />
                ).toBlob();

                // Trigger download
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `invoice-${invoiceNumber}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <IndianRupee className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="bg-blue-50/50 pb-3">
                <CardTitle className="text-[#954C2E] flex items-center gap-2 font-open-sans">
                  <div className="w-2 h-5 rounded-full bg-[#954C2E]"></div>
                  Customer Information
                </CardTitle>
                <CardDescription>
                  Enter customer details for the invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    placeholder="Customer Name"
                    required
                    className="border-gray-300 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number" className="text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="number"
                    name="number"
                    value={customerInfo.number}
                    onChange={handleCustomerInfoChange}
                    placeholder="Customer Phone Number"
                    required
                    className="border-gray-300 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-700">
                    Billing Address
                  </Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerInfoChange}
                    placeholder="Customer Billing Address"
                    rows={3}
                    className="border-gray-300 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="bg-blue-50/50 pb-3">
                <CardTitle className="text-[#954C2E] flex items-center gap-2">
                  <div className="w-2 h-5 rounded-full bg-[#954C2E]"></div>
                  Shipping Information
                </CardTitle>
                <CardDescription>
                  Enter shipping details (if different from billing)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="shippingName" className="text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="shippingName"
                    name="name"
                    value={shippingInfo.name}
                    onChange={handleShippingInfoChange}
                    placeholder="Shipping Name"
                    className="border-gray-300 focus:border-blue-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress" className="text-gray-700">
                    Shipping Address
                  </Label>
                  <Textarea
                    id="shippingAddress"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingInfoChange}
                    placeholder="Shipping Address"
                    rows={3}
                    className="border-gray-300 focus:border-blue-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Add Products */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="bg-blue-50/50 pb-3">
                <CardTitle className="text-[#954C2E] flex items-center gap-2">
                  <div className="w-2 h-5 rounded-full bg-[#954C2E]"></div>
                  Add Products
                </CardTitle>
                <CardDescription>
                  Select products and quantities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">
                    Search and Select Product
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search and select products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-400"
                      onFocus={() => setSearchQuery("")}
                    />
                    {searchQuery && filteredProducts.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setSelectedProduct(product);
                              setSearchQuery(product.name);
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-blue-50 flex justify-between"
                          >
                            <span>
                              {product.name} {product.size}
                            </span>
                            <span className="text-blue-600">
                              ₹{product.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-gray-700">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 1)
                      }
                      className="border-gray-300 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Selected Product</Label>
                    <div className="p-2 border border-gray-300 rounded-md min-h-[40px] bg-gray-50">
                      {selectedProduct ? (
                        <div className="flex justify-between items-center">
                          <span>{selectedProduct.name}</span>
                          <span className="text-blue-600 font-medium">
                            ₹{selectedProduct.price}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          No product selected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleAddItem}
                  disabled={!selectedProduct}
                  className="w-full bg-[#954C2E] hover:bg-[#996600] text-white font-open-sans"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardContent>
            </Card>

            {/* Product List */}
            <Card className="border-blue-100 shadow-sm">
              <CardHeader className="bg-blue-50/50 pb-3">
                <CardTitle className="text-[#954C2E] flex items-center gap-2">
                  <div className="w-2 h-5 rounded-full bg-[#954C2E]"></div>
                  Product List
                </CardTitle>
                <CardDescription>Items added to the invoice</CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No products added yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Add products using the form above
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50/30 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x ₹{item.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="font-medium text-[#954C2E]">
                            ₹{item.total.toFixed(2)}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Invoice Preview */}
          <div className="space-y-6">
            <Card className="sticky top-6 border-blue-100 shadow-lg">
              <CardHeader className="bg-[#954C2E] text-white p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">
                      Invoice Preview
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Real-time invoice preview
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-white text-[#954C2E] font-bold"
                  >
                    {invoiceNumber}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Company Header */}
                <div className="p-6 border-b border-blue-100 bg-blue-50/30">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-semibold text-[#954C2E]">
                      {companyDetails.name}
                    </h2>
                    <p className="text-sm text-gray-700">
                      {companyDetails.address}
                    </p>
                    <p className="text-sm text-gray-700">
                      {companyDetails.city}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {companyDetails.gstin}
                    </p>
                    <p className="text-sm text-gray-700">
                      {companyDetails.phone} | {companyDetails.email}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-sm text-gray-800">
                        <span className="font-bold">Invoice No:</span>{" "}
                        {invoiceNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-800">
                        <span className="font-bold">Date:</span> {invoiceDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bill To / Ship To */}
                <div className="p-6 border-b border-blue-100 grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#954C2E] mb-2">
                      Bill To:
                    </h3>
                    <p className="text-sm text-gray-800 font-bold">
                      {customerInfo.name || "Customer Name"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {customerInfo.number || "Phone Number"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {customerInfo.address || "Billing Address"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#954C2E] mb-2">
                      Ship To:
                    </h3>
                    <p className="text-sm text-gray-800 font-bold">
                      {shippingInfo.name ||
                        customerInfo.name ||
                        "Shipping Name"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {shippingInfo.address ||
                        customerInfo.address ||
                        "Shipping Address"}
                    </p>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="p-6 border-b border-blue-100">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-blue-100">
                        <th className="text-left py-3 text-[#954C2E] font-semibold text-sm">
                          Item & Description
                        </th>
                        <th className="text-right py-3 text-[#954C2E] font-semibold text-sm">
                          Qty
                        </th>
                        <th className="text-right py-3 text-[#954C2E] font-semibold text-sm">
                          Rate (₹)
                        </th>
                        <th className="text-right py-3 text-[#954C2E] font-semibold text-sm">
                          CGST (6%)
                        </th>
                        <th className="text-right py-3 text-[#954C2E] font-semibold text-sm">
                          SGST (6%)
                        </th>
                        <th className="text-right py-3 text-[#954C2E] font-semibold text-sm">
                          Amount (₹)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => {
                        const itemCgst = includeGst ? item.total * 0.06 : 0;
                        const itemSgst = includeGst ? item.total * 0.06 : 0;
                        const itemTotal = item.total + itemCgst + itemSgst;

                        return (
                          <tr key={index} className="border-b border-blue-50">
                            <td className="py-3 text-gray-800 text-sm font-semibold">
                              {item.name}
                            </td>
                            <td className="text-right py-3 text-gray-600 text-sm">
                              {item.quantity}
                            </td>
                            <td className="text-right py-3 text-gray-600 text-sm">
                              ₹{item.price.toFixed(2)}
                            </td>
                            <td className="text-right py-3 text-gray-600 text-sm">
                              ₹{itemCgst.toFixed(2)}
                            </td>
                            <td className="text-right py-3 text-gray-600 text-sm">
                              ₹{itemSgst.toFixed(2)}
                            </td>
                            <td className="text-right py-3 text-[#954C2E] font-semibold text-sm">
                              ₹{itemTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Invoice Totals */}
                <div className="p-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-800">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* GST Options */}
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="includeGst"
                      checked={includeGst}
                      onCheckedChange={(checked) =>
                        setIncludeGst(checked === true)
                      }
                      className="data-[state=checked]:bg-[#954C2E] text-white"
                    />
                    <Label
                      htmlFor="includeGst"
                      className="text-gray-700 cursor-pointer"
                    >
                      Include GST (12% total: 6% CGST + 6% SGST)
                    </Label>
                  </div>

                  {includeGst && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-semibold">
                          CGST:
                        </span>
                        <span className="text-gray-800">6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-semibold">
                          SGST:
                        </span>
                        <span className="text-gray-800">6%</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-100 pt-2">
                        <span className="text-gray-800 font-semibold">
                          GST Total:
                        </span>
                        <span className="text-gray-800 font-medium">
                          ₹{gstTotal.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-blue-100">
                    <span className="text-[#954C2E]">Total:</span>
                    <span className="text-[#954C2E]">₹{total.toFixed(2)}</span>
                  </div>

                  {/* Advance Payment */}
                  <div className="pt-4 mt-4 border-t border-blue-100">
                    <div className="space-y-2">
                      <Label htmlFor="advance" className="text-gray-700">
                        Advance Payment (%)
                      </Label>
                      <Input
                        id="advance"
                        type="number"
                        min="0"
                        max="100"
                        value={advancePayment}
                        onChange={(e) =>
                          setAdvancePayment(parseInt(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="border-gray-300 focus:border-blue-400"
                      />
                    </div>
                    {advancePayment > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Advance Amount:</span>
                          <span className="text-gray-800">
                            ₹{advanceAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t border-blue-100">
                          <span className="text-green-700">Balance Due:</span>
                          <span className="text-green-700">
                            ₹{balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setCustomerInfo({ name: "", number: "", address: "" });
                  setShippingInfo({ name: "", address: "" });
                  setItems([]);
                  setAdvancePayment(0);
                  setIncludeGst(true);
                }}
              >
                Clear All
              </Button>
              <Button
                className="flex-1 bg-[#954C2E] hover:bg-[#734d26] text-white font-open-sans"
                onClick={async () => {
                  const blob = await pdf(
                    <InvoicePDF
                      invoiceData={{
                        companyDetails,
                        invoiceNumber,
                        invoiceDate,
                        dueDate: invoiceDate,
                        customerInfo,
                        shippingInfo: shippingInfo.address
                          ? shippingInfo
                          : customerInfo,
                        items: items.map((item) => ({
                          name: item.name,
                          hsn: "970300",
                          quantity: item.quantity,
                          unit: "pcs",
                          rate: item.price,
                          cgst: 6,
                          sgst: 6,
                          amount: item.total,
                        })),
                        subtotal,
                        cgst,
                        sgst,
                        total,
                        totalInWords: `${convertToWords(total)} Only`,
                        deliveryDate: new Date().toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }),
                      }}
                      logoUrl="/images/logo.png"
                    />
                  ).toBlob();

                  // Trigger download
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `invoice-${invoiceNumber}.pdf`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <IndianRupee className="mr-2 h-4 w-4" />
                Generate Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
