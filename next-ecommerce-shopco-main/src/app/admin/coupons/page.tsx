"use client";

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common/app-sidebar';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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

interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  description: string;
  minAmount: number;
  maxDiscount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
}

function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: 0,
    description: '',
    minAmount: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    usageLimit: 0
  });

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/coupons`);
      setCoupons(response.data);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    }
  };

  useEffect(() => {
    fetchCoupons();
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
      await axios.post(`${BASE_URL}/coupons`, formData);
      toast.success('Coupon added successfully');
      setIsAddModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to add coupon');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoupon) return;

    try {
      await axios.put(`${BASE_URL}/coupons/${selectedCoupon._id}`, formData);
      toast.success('Coupon updated successfully');
      setIsAddModalOpen(false);
      setSelectedCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  const handleDelete = async () => {
    if (!selectedCoupon) return;

    try {
      await axios.delete(`${BASE_URL}/coupons/${selectedCoupon._id}`);
      toast.success('Coupon deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedCoupon(null);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      description: coupon.description,
      minAmount: coupon.minAmount,
      maxDiscount: coupon.maxDiscount,
      startDate: new Date(coupon.startDate).toISOString().split('T')[0],
      endDate: new Date(coupon.endDate).toISOString().split('T')[0],
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountPercentage: 0,
      description: '',
      minAmount: 0,
      maxDiscount: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      usageLimit: 0
    });
  };

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <TopNavbar isAdmin={true} />
          <div className='pt-24 p-4'>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Coupons</h1>
              <Button onClick={() => {
                setSelectedCoupon(null);
                resetForm();
                setIsAddModalOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Coupon
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Amount</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell className="font-medium">{coupon.code}</TableCell>
                    <TableCell>{coupon.discountPercentage}%</TableCell>
                    <TableCell>Rs. {coupon.minAmount}</TableCell>
                    <TableCell>
                      {new Date(coupon.startDate).toLocaleDateString()} - 
                      {new Date(coupon.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {coupon.usedCount}/{coupon.usageLimit || '∞'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(coupon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCoupon(coupon);
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
                  <DialogTitle>{selectedCoupon ? 'Edit' : 'Add'} Coupon</DialogTitle>
                </DialogHeader>
                <form onSubmit={selectedCoupon ? handleEdit : handleAdd} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Coupon Code</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountPercentage">Discount Percentage</Label>
                    <Input
                      id="discountPercentage"
                      name="discountPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercentage}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minAmount">Minimum Amount</Label>
                    <Input
                      id="minAmount"
                      name="minAmount"
                      type="number"
                      value={formData.minAmount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDiscount">Maximum Discount</Label>
                    <Input
                      id="maxDiscount"
                      name="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="usageLimit">Usage Limit (0 for unlimited)</Label>
                    <Input
                      id="usageLimit"
                      name="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                    />
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
                    {selectedCoupon ? 'Update' : 'Add'} Coupon
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
                <p>Are you sure you want to delete this coupon?</p>
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

export default CouponsPage; 