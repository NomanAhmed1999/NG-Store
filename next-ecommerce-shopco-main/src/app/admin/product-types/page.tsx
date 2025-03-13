"use client";

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common/app-sidebar';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import axios from 'axios';
import { BASE_URL } from '@/lib/constant';

interface ProductType {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  dateCreated: string;
}

function ProductTypesPage() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '',
    isActive: true
  });

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/product-types`);
      setProductTypes(response.data.productTypes);
    } catch (error) {
      toast.error('Failed to fetch product types');
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/product-types`, formData);
      toast.success('Product type added successfully');
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '', icon: '', color: '', isActive: true });
      fetchProductTypes();
    } catch (error) {
      toast.error('Failed to add product type');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductType) return;

    try {
      await axios.put(`${BASE_URL}/product-types/${selectedProductType._id}`, formData);
      toast.success('Product type updated successfully');
      setIsAddModalOpen(false);
      setSelectedProductType(null);
      setFormData({ name: '', description: '', icon: '', color: '', isActive: true });
      fetchProductTypes();
    } catch (error) {
      toast.error('Failed to update product type');
    }
  };

  const handleDelete = async () => {
    if (!selectedProductType) return;

    try {
      await axios.delete(`${BASE_URL}/product-types/${selectedProductType._id}`);
      toast.success('Product type deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProductType(null);
      fetchProductTypes();
    } catch (error) {
      toast.error('Failed to delete product type');
    }
  };

  const handleToggleStatus = async (productType: ProductType) => {
    try {
      await axios.patch(`${BASE_URL}/product-types/${productType._id}/toggle-status`);
      toast.success(`Product type ${productType.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchProductTypes();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const openEditModal = (productType: ProductType) => {
    setSelectedProductType(productType);
    setFormData({
      name: productType.name,
      description: productType.description,
      icon: productType.icon,
      color: productType.color,
      isActive: productType.isActive
    });
    setIsAddModalOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 w-full">
          <TopNavbar isAdmin={true} />
          <div className='pt-24 p-4 w-full'>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Product Types</h1>
              <Button onClick={() => {
                setSelectedProductType(null);
                setFormData({ name: '', description: '', icon: '', color: '', isActive: true });
                setIsAddModalOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Product Type
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productTypes.map((productType) => (
                  <TableRow key={productType._id}>
                    <TableCell>{productType.name}</TableCell>
                    <TableCell>{productType.description}</TableCell>
                    <TableCell>{productType.icon}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: productType.color }}
                        />
                        {productType.color}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        productType.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {productType.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(productType)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(productType)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProductType(productType);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Add/Edit Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedProductType ? 'Edit Product Type' : 'Add Product Type'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={selectedProductType ? handleEdit : handleAdd} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Input
                      id="icon"
                      name="icon"
                      value={formData.icon}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        name="color"
                        type="color"
                        value={formData.color}
                        onChange={handleInputChange}
                      />
                      <Input
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="isActive">Active Status</Label>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={handleSwitchChange}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {selectedProductType ? 'Update' : 'Add'} Product Type
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Delete</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete this product type?</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default ProductTypesPage;