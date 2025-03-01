"use client";

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common/app-sidebar';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import axios from 'axios';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell, ResponsiveContainer } from 'recharts';

interface OrderItem {
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

interface Order {
  _id: string;
  orderItems: OrderItem[];
  status: string;
  totalPrice: number;
  user: {
    _id: string;
    name: string;
  };
  dateOrdered: string;
  shippingAddress1: string;
  shippingAddress2: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
}

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    orderId: '',
    customerName: '',
    minPrice: '',
    maxPrice: '',
    status: ''
  });

  // Prepare data for charts
  const prepareChartData = () => {
    // Order Status Distribution
    const statusCount = orders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1 as number;
      return acc;
    }, {});
    const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

    // Sales Over Time
    const salesByDate = orders.reduce((acc: any, order) => {
      const date = new Date(order.dateOrdered).toLocaleDateString();
      acc = { ...acc, [date]: (acc[date] || 0) + order.totalPrice };
      return acc;
    }, {});
    const salesData = Object.entries(salesByDate).map(([date, amount]) => ({ date, amount }));

    // Orders by Customer
    const customerOrders = orders.reduce((acc: any, order) => {
      acc[order.user.name] = (acc[order.user.name] || 0) + 1;
      return acc;
    }, {});
    const customerData = Object.entries(customerOrders).map(([name, count]) => ({ name, count }));

    // Orders by Location
    const locationOrders = orders.reduce((acc: any, order) => {
      acc[order.country] = (acc[order.country] || 0) + 1;
      return acc;
    }, {});
    const locationData = Object.entries(locationOrders).map(([country, count]) => ({ country, count }));

    return { statusData, salesData, customerData, locationData };
  };

  const { statusData, salesData, customerData, locationData } = prepareChartData();

  const fetchOrders = async () => {
    try {
      let url = 'http://localhost:3000/api/v1/orders';
      const params = new URLSearchParams();

      if (searchFilters.orderId) params.append('orderId', searchFilters.orderId);
      if (searchFilters.customerName) params.append('customerName', searchFilters.customerName);
      if (searchFilters.minPrice) params.append('minPrice', searchFilters.minPrice);
      if (searchFilters.maxPrice) params.append('maxPrice', searchFilters.maxPrice);
      if (searchFilters.status) params.append('status', searchFilters.status);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await axios.get(url);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSearchFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [salesResponse, countResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/v1/orders/get/totalsales'),
        axios.get('http://localhost:3000/api/v1/orders/get/count')
      ]);
      setTotalSales(salesResponse.data.totalsales);
      setOrderCount(countResponse.data.orderCount);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchOrderDetails = async (userId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/orders/get/userorders/${userId}`);
      setOrderDetails(response.data[0]);
    } catch (error) {
      toast.error('Failed to fetch order details');
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/orders/${selectedOrder._id}`);
      toast.success('Order deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
      fetchStatistics();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const openDetailsModal = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderDetails(order.user._id);
    setIsDetailsModalOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 w-full">
          <TopNavbar isAdmin={true} />
          <div className='pt-24 p-4 w-full'>
            {/* Charts Section */}
            <div className="grid gap-6 mb-8 md:grid-cols-2">
              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart<any> width={400} height={300}>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sales Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Sales Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart<any> data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Sales ($)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders by Customer */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart<any> data={customerData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" name="Number of Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders by Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart<any> data={locationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="country" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#ffc658" name="Number of Orders" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalSales}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orderCount}</div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-6">
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    name="orderId"
                    value={searchFilters.orderId}
                    onChange={handleSearchChange}
                    placeholder="Search by ID"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={searchFilters.customerName}
                    onChange={handleSearchChange}
                    placeholder="Search by name"
                  />
                </div>
                <div>
                  <Label htmlFor="minPrice">Min Price</Label>
                  <Input
                    id="minPrice"
                    name="minPrice"
                    type="number"
                    value={searchFilters.minPrice}
                    onChange={handleSearchChange}
                    placeholder="Min price"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice">Max Price</Label>
                  <Input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    value={searchFilters.maxPrice}
                    onChange={handleSearchChange}
                    placeholder="Max price"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    value={searchFilters.status}
                    onChange={handleSearchChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
                <div className="md:col-span-5 flex justify-end">
                  <Button type="submit">Search Orders</Button>
                </div>
              </form>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>{order._id}</TableCell>
                        <TableCell>{order.user.name}</TableCell>
                        <TableCell>${order.totalPrice}</TableCell>
                        <TableCell>{order.status}</TableCell>
                        <TableCell>{new Date(order.dateOrdered).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDetailsModal(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Delete</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete this order?</p>
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

            {/* Order Details Modal */}
            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                </DialogHeader>
                {orderDetails && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold">Shipping Information</h3>
                        <p>{orderDetails.shippingAddress1}</p>
                        {orderDetails.shippingAddress2 && <p>{orderDetails.shippingAddress2}</p>}
                        <p>{orderDetails.city}, {orderDetails.zip}</p>
                        <p>{orderDetails.country}</p>
                        <p>Phone: {orderDetails.phone}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold">Order Information</h3>
                        <p>Status: {orderDetails.status}</p>
                        <p>Date: {new Date(orderDetails.dateOrdered).toLocaleDateString()}</p>
                        <p>Total: ${orderDetails.totalPrice}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Order Items</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderDetails.orderItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.product.name}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>${item.product.price}</TableCell>
                              <TableCell>${item.quantity * item.product.price}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default OrdersPage;