"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  FileText,
  Plus,
  Download,
} from "lucide-react";
import { toast } from "sonner";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Define types based on your Prisma schema
type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    customer: true;
    shipping: true;
    items: true;
  };
}>;

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<
    InvoiceWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [selectedInvoice, setSelectedInvoice] =
    useState<InvoiceWithRelations | null>(null);
  const [mode, setMode] = useState<"view" | "edit" | null>(null);

  const router = useRouter();

  // Theme colors
  const themeColor = "#954C2E";
  const themeLight = "#F5E9E4";

  // Fetch invoices from API
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      if (statusFilter !== "ALL") {
        queryParams.append("status", statusFilter);
      }

      const response = await fetch(
        `/api/allinvoices/getallinvoices?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInvoices(data);
      setFilteredInvoices(data); // Initialize filtered invoices with all invoices
    } catch (error) {
      console.error("Error fetching invoices:", error);
      // Set empty array instead of showing error for better UX
      setInvoices([]);
      setFilteredInvoices([]);
      toast.error("Failed to fetch invoices", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [searchTerm, statusFilter]);

  // Handle invoice deletion
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/allinvoices/deleteinvoice?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the deleted invoice from state
        setInvoices(invoices.filter((invoice) => invoice.id !== id));
        setFilteredInvoices(
          filteredInvoices.filter((invoice) => invoice.id !== id)
        );
        setDeleteConfirm(null);
        toast.success("Invoice deleted successfully", {
          description: "The invoice has been permanently removed.",
        });
      } else {
        const data = await response.json();
        console.error("Error deleting invoice:", data.error);
        toast.error("Failed to delete invoice", {
          description: data.error || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice", {
        description: "An unexpected error occurred.",
      });
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get status badge variant (restricted to allowed Badge variants)
  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" | undefined => {
    switch (status) {
      case "PAID":
        return "default";
      case "PENDING":
        return "outline";
      case "DRAFT":
        return "secondary";
      case "OVERDUE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Export filtered invoices to Excel
  // Export filtered invoices to Excel with additional summary row
  const exportToExcel = () => {
    if (filteredInvoices.length === 0) {
      toast.info("No data to export", {
        description: "There are no invoices matching your current filters.",
      });
      return;
    }

    try {
      // Create CSV content
      let csvContent =
        "Invoice Number,Customer Name,Customer Phone,Date,Due Date,Total Amount,Advance Paid,Balance Due,Status\n";

      // Calculate overall totals
      let overallTotal = 0;
      let overallAdvancePaid = 0;
      let overallBalanceDue = 0;

      filteredInvoices.forEach((invoice) => {
        let balanceDue = invoice.total - invoice.advancePaid;

        if (invoice.advancePaid <= 0) {
          balanceDue = 0;
        }

        // Add to overall totals
        overallTotal += invoice.total;
        overallAdvancePaid += invoice.advancePaid;
        overallBalanceDue += balanceDue;

        const row = [
          `"${invoice.invoiceNumber}"`,
          `"${invoice.customer.name}"`,
          `"${invoice.customer.number}"`,
          `"${formatDate(invoice.invoiceDate)}"`,
          `"${formatDate(invoice.dueDate)}"`,
          `"${invoice.total}"`,
          `"${invoice.advancePaid}"`,
          `"${balanceDue}"`,
          `"${invoice.status}"`,
        ].join(",");

        csvContent += row + "\n";
      });

      // Add summary row
      csvContent += "\n";
      csvContent += `"","","","","","TOTAL: ${overallTotal}","ADVANCE: ${overallAdvancePaid}","BALANCE: ${overallBalanceDue}",""\n`;

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `invoices-${new Date().toISOString().split("T")[0]}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Export successful", {
        description: `${filteredInvoices.length} invoice(s) exported to CSV with summary.`,
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("Export failed", {
        description: "An error occurred while exporting the data.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Invoice Management
          </h1>
          <p className="text-gray-600">View and manage all your invoices</p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Invoices
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by invoice number or customer name..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full md:w-48">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={exportToExcel}
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50"
                  disabled={filteredInvoices.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Statement
                </Button>

                <Button
                  onClick={() => router.push("/super-admin/invoices")}
                  style={{ backgroundColor: themeColor }}
                  className="hover:opacity-90 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Invoice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>
              {filteredInvoices.length} invoice
              {filteredInvoices.length !== 1 ? "s" : ""} found
              {filteredInvoices.length !== invoices.length &&
                ` (filtered from ${invoices.length} total)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No invoices found
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm || statusFilter !== "ALL"
                    ? "Try changing your search or filter criteria"
                    : "Get started by creating a new invoice."}
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => router.push("/super-admin/invoices")}
                    style={{ backgroundColor: themeColor }}
                    className="hover:opacity-90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Invoice
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {invoice.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.customer.number}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(invoice.total)}
                        </div>
                        {invoice.advancePaid > 0 && (
                          <div className="text-xs text-gray-500">
                            Advance: {formatCurrency(invoice.advancePaid)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.status === "PAID" ? (
                          <Badge className="bg-green-600 text-white hover:bg-green-700">
                            {invoice.status}
                          </Badge>
                        ) : (
                          <Badge variant={getStatusVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setMode("view");
                            }}
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setMode("edit");
                            }}
                            title="Edit Invoice"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteConfirm(invoice.id)}
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={mode === "view"} onOpenChange={() => setMode(null)}>
          <DialogContent className="w-7xl bg-white">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                View details for invoice #{selectedInvoice?.invoiceNumber}
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Invoice #</h4>
                    <p>{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Status</h4>
                    {selectedInvoice.status === "PAID" ? (
                      <Badge className="bg-green-600 text-white hover:bg-green-700">
                        {selectedInvoice.status}
                      </Badge>
                    ) : (
                      <Badge variant={getStatusVariant(selectedInvoice.status)}>
                        {selectedInvoice.status}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Date</h4>
                    <p>{formatDate(selectedInvoice.invoiceDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Due Date</h4>
                    <p>{formatDate(selectedInvoice.dueDate)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Customer</h4>
                  <p>{selectedInvoice.customer.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedInvoice.customer.number}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">Amount</h4>
                  <p>{formatCurrency(selectedInvoice.total)}</p>
                  {selectedInvoice.advancePaid > 0 && (
                    <p className="text-sm text-gray-500">
                      Advance: {formatCurrency(selectedInvoice.advancePaid)}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2 wrap-anywhere">Items</h4>
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium break-words whitespace-normal max-w-[250px]">
                              {item.name}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.quantity * item.price)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={mode === "edit"} onOpenChange={() => setMode(null)}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Edit Invoice</DialogTitle>
              <DialogDescription>
                Make changes to invoice #{selectedInvoice?.invoiceNumber}
              </DialogDescription>
            </DialogHeader>

            {selectedInvoice && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const body = {
                    customer: {
                      name: formData.get("customerName"),
                      number: formData.get("customerNumber"),
                    },
                    remaining: Number(formData.get("remaining")),
                  };

                  const updatePromise = fetch(
                    `/api/allinvoices/updateinvoice?id=${selectedInvoice.id}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    }
                  );

                  toast.promise(updatePromise, {
                    loading: "Updating invoice...",
                    success: async (res) => {
                      if (res.ok) {
                        await fetchInvoices();
                        setSelectedInvoice(null);
                        setMode(null);
                        return "Invoice updated successfully";
                      } else {
                        throw new Error("Failed to update invoice");
                      }
                    },
                    error: (error) => {
                      return error.message || "Failed to update invoice";
                    },
                  });
                }}
                className="grid gap-4 py-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="customerName"
                      className="text-sm font-medium"
                    >
                      Customer Name
                    </label>
                    <Input
                      id="customerName"
                      name="customerName"
                      defaultValue={selectedInvoice.customer.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="customerNumber"
                      className="text-sm font-medium"
                    >
                      Customer Number
                    </label>
                    <Input
                      id="customerNumber"
                      name="customerNumber"
                      defaultValue={selectedInvoice.customer.number}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="remaining" className="text-sm font-medium">
                    Remaining Amount
                  </label>
                  <Input
                    id="remaining"
                    name="remaining"
                    type="number"
                    defaultValue={
                      selectedInvoice.total - selectedInvoice.advancePaid
                    }
                  />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    type="button"
                    onClick={async () => {
                      const markAsPaidPromise = fetch(
                        `/api/allinvoices/${selectedInvoice.id}`,
                        {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            remaining: 0,
                            status: "PAID",
                          }),
                        }
                      );

                      toast.promise(markAsPaidPromise, {
                        loading: "Marking as paid...",
                        success: async (res) => {
                          if (res.ok) {
                            await fetchInvoices();
                            setSelectedInvoice(null);
                            setMode(null);
                            return "Invoice marked as paid successfully";
                          } else {
                            throw new Error("Failed to mark as paid");
                          }
                        },
                        error: (error) => {
                          return error.message || "Failed to mark as paid";
                        },
                      });
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark as Paid
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <DialogContent className="max-w-sm bg-white">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this invoice? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceManagement;
