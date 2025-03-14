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
import Footer from '@/components/layout/Footer';

interface DeliveryCharge {
  _id: string;
  name: string;
  price: number;
  description: string;
  estimatedDays: string;
  freeShippingThreshold: number;
  isActive: boolean;
  dateCreated: string;
}

function DeliveryChargesPage() {
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<DeliveryCharge | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    estimatedDays: '',
    freeShippingThreshold: 0,
    isActive: true
  });

  const fetchDeliveryCharges = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/delivery-charges`);
      setDeliveryCharges(response.data);
    } catch (error) {
      toast.error('Failed to fetch delivery charges');
    }
  };

  useEffect(() => {
    fetchDeliveryCharges();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/delivery-charges`, formData);
      toast.success('Delivery charge added successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchDeliveryCharges();
    } catch (error) {
      toast.error('Failed to add delivery charge');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharge) return;

    try {
      await axios.put(`${BASE_URL}/delivery-charges/${selectedCharge._id}`, formData);
      toast.success('Delivery charge updated successfully');
      setIsAddModalOpen(false);
      setSelectedCharge(null);
      resetForm();
      fetchDeliveryCharges();
    } catch (error) {
      toast.error('Failed to update delivery charge');
    }
  };

  const handleDelete = async () => {
    if (!selectedCharge) return;

    try {
      await axios.delete(`${BASE_URL}/delivery-charges/${selectedCharge._id}`);
      toast.success('Delivery charge deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedCharge(null);
      fetchDeliveryCharges();
    } catch (error) {
      toast.error('Failed to delete delivery charge');
    }
  };

  const handleToggleStatus = async (charge: DeliveryCharge) => {
    try {
      await axios.patch(`${BASE_URL}/delivery-charges/${charge._id}/toggle-status`);
      fetchDeliveryCharges();
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openEditModal = (charge: DeliveryCharge) => {
    setSelectedCharge(charge);
    setFormData({
      name: charge.name,
      price: charge.price,
      description: charge.description,
      estimatedDays: charge.estimatedDays,
      freeShippingThreshold: charge.freeShippingThreshold,
      isActive: charge.isActive
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      description: '',
      estimatedDays: '',
      freeShippingThreshold: 0,
      isActive: true
    });
  };

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 w-full">
          <TopNavbar isAdmin={true} />
          <div className='pt-24 p-4 w-full'>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Delivery Charges</h1>
              <Button onClick={() => {
                setSelectedCharge(null);
                resetForm();
                setIsAddModalOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Delivery Charge
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Estimated Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveryCharges.map((charge) => (
                  <TableRow key={charge._id}>
                    <TableCell>{charge.name}</TableCell>
                    <TableCell>Rs. {charge.price}</TableCell>
                    <TableCell>{charge.estimatedDays}</TableCell>
                    <TableCell>
                      <Switch
                        checked={charge.isActive}
                        onCheckedChange={() => handleToggleStatus(charge)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(charge)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCharge(charge);
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
                    {selectedCharge ? 'Edit Delivery Charge' : 'Add Delivery Charge'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={selectedCharge ? handleEdit : handleAdd} className="space-y-4">
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
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedDays">Estimated Days</Label>
                    <Input
                      id="estimatedDays"
                      name="estimatedDays"
                      value={formData.estimatedDays}
                      onChange={handleInputChange}
                      placeholder="e.g., 2-3 days"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                    <Input
                      id="freeShippingThreshold"
                      name="freeShippingThreshold"
                      type="number"
                      value={formData.freeShippingThreshold}
                      onChange={handleInputChange}
                      placeholder="Enter amount for free shipping"
                    />
                    <span className="text-sm text-gray-500">
                      Set to 0 if no free shipping threshold
                    </span>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
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
                    {selectedCharge ? 'Update' : 'Add'} Delivery Charge
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
                <p>Are you sure you want to delete this delivery charge?</p>
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
          <Footer />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default DeliveryChargesPage; 