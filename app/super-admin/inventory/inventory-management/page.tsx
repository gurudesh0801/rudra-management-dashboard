"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

// Define types based on your Prisma schema
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    items: true;
  };
}>;

const ProductManagement = () => {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<ProductWithRelations | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    name: "",
    size: "",
    price: "",
    category: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: "",
    size: "",
    price: "",
    category: "",
  });
  const [addLoading, setAddLoading] = useState(false);

  const categoryOptions = [
    "All",
    "Mavala",
    "Maharaj",
    "Shastra (Weapons)",
    "Miniature Weapons",
    "Miniatures",
    "Spiritual Statues",
    "Car Dashboard",
    "Frame Collection",
    "Shilekhana (Weapon Vault)",
    "Symbolic & Cultural Artefacts",
    "Sanch",
    "Keychains",
    "Jewellery",
    "Historical Legends",
    "Badges",
    "Taxidermy",
  ];

  const router = useRouter();

  // Theme colors
  const themeColor = "#954C2E";
  const themeLight = "#F5E9E4";

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      if (categoryFilter !== "ALL") {
        queryParams.append("category", categoryFilter);
      }

      const response = await fetch(
        `/api/products/search?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to prevent too many API calls while typing
    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter]);

  // Handle product deletion
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProducts(products.filter((product) => product.id !== id));
        setDeleteConfirm(null);
      } else {
        const data = await response.json();
        console.error("Error deleting product:", data.error);
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  // Handle edit button click
  const handleEditClick = (product: ProductWithRelations) => {
    setEditProduct(product);
    setEditFormData({
      name: product.name,
      size: product.size || "",
      price: product.price.toString(),
      category: product.category,
    });
  };

  // Handle edit form input changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;

    setEditLoading(true);
    try {
      const response = await fetch(`/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editFormData.name,
          size: editFormData.size,
          price: parseFloat(editFormData.price),
          category: editFormData.category,
        }),
      });

      if (response.ok) {
        // Refresh the product list
        fetchProducts();
        setEditProduct(null);
        alert("Product updated successfully!");
      } else {
        const data = await response.json();
        console.error("Error updating product:", data.error);
        alert("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle add form input changes
  const handleAddInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddFormData({
      ...addFormData,
      [name]: value,
    });
  };

  // Handle add form submission
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setAddLoading(true);
    try {
      const response = await fetch(`/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: addFormData.name,
          size: addFormData.size,
          price: parseFloat(addFormData.price),
          category: addFormData.category,
        }),
      });

      if (response.ok) {
        // Refresh the product list
        fetchProducts();
        setAddProductOpen(false);
        setAddFormData({
          name: "",
          size: "",
          price: "",
          category: "",
        });
        alert("Product added successfully!");
      } else {
        const data = await response.json();
        console.error("Error adding product:", data.error);
        alert("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    } finally {
      setAddLoading(false);
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

  // Get unique categories for filter
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">View and manage all your products</p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <Input
                      type="text"
                      placeholder="Search by product name or category..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full md:w-48">
                  <Select
                    value={categoryFilter}
                    onValueChange={(value) => setCategoryFilter(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ALL">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Button
                    onClick={() => setAddProductOpen(true)}
                    style={{ backgroundColor: themeColor }}
                    className="text-white"
                  >
                    Add New Product
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Table */}
        <Card>
          {loading ? (
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="rounded-full h-8 w-8 border-b-2 mx-auto"
                style={{ borderColor: themeColor }}
              ></motion.div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </CardContent>
          ) : products.length === 0 ? (
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No products
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || categoryFilter !== "ALL"
                    ? "Try changing your search or filter criteria"
                    : "Get started by adding a new product."}
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => setAddProductOpen(true)}
                    style={{ backgroundColor: themeColor }}
                  >
                    Add New Product
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ backgroundColor: themeLight }}>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Id
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Quantity
                    </th>
                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Created
                    </th> */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {products.map((product) => (
                      <motion.tr
                        key={product.id}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.id}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {product.size || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {}
                        </td>
                        {/* <td className="px-4 py-3 text-sm text-gray-900">
                          <Badge variant="secondary">{product.category}</Badge>
                        </td> */}
                        {/* <td className="px-4 py-3 text-sm text-gray-900">
                          {formatDate(product.createdAt)}
                        </td> */}
                        <td className="px-4 py-3 text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(product)}
                              title="Edit Product"
                              className="cursor-pointer"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirm(product.id)}
                              title="Delete Product"
                              className="cursor-pointer"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Add Product Dialog */}
        <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your inventory. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-name" className="text-sm font-medium">
                  Product Name
                </Label>
                <Input
                  id="add-name"
                  type="text"
                  name="name"
                  required
                  value={addFormData.name}
                  onChange={handleAddInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-size" className="text-sm font-medium">
                  Size
                </Label>
                <Input
                  id="add-size"
                  type="text"
                  name="size"
                  value={addFormData.size}
                  onChange={handleAddInputChange}
                  placeholder="10 inch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-price" className="text-sm font-medium">
                  Price
                </Label>
                <Input
                  id="add-price"
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={addFormData.price}
                  onChange={handleAddInputChange}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="add-category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  value={addFormData.category}
                  onValueChange={(value) =>
                    setAddFormData({ ...addFormData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddProductOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addLoading}
                  style={{ backgroundColor: themeColor }}
                  className="text-white"
                >
                  {addLoading ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
          <DialogContent className="sm:max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Make changes to your product here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Product Name
                </Label>
                <Input
                  id="edit-name"
                  type="text"
                  name="name"
                  required
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-size" className="text-sm font-medium">
                  Size
                </Label>
                <Input
                  id="edit-size"
                  type="text"
                  name="size"
                  value={editFormData.size}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm font-medium">
                  Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={editFormData.price}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm font-medium">
                  Category
                </Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditProduct(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  style={{ backgroundColor: themeColor }}
                  className="text-white"
                >
                  {editLoading ? "Updating..." : "Update Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default ProductManagement;
