"use client";

import { useEffect, useState } from 'react';
import { BASE_URL } from '@/lib/constant';
import { toast } from 'react-hot-toast';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import Footer from '@/components/layout/Footer';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/common/app-sidebar';
interface DashboardData {
    totalRevenue: number;
    salesByCategory: Array<{ _id: string; total: number }>;
    monthlyRevenue: Array<{ _id: { year: number; month: number }; total: number }>;
    topProducts: Array<{ product: { name: string }; totalSold: number }>;
    recentOrders: Array<{
        _id: string;
        user: { name: string };
        totalPrice: number;
        dateOrdered: string;
        status: string;
    }>;
    lowStockProducts: Array<{ name: string; countInStock: number }>;
    stats: {
        totalOrders: number;
        totalProducts: number;
        totalUsers: number;
        averageOrderValue: number;
    };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${BASE_URL}/analytics/dashboard`);
                if (!response.ok) throw new Error('Failed to fetch dashboard data');
                const dashboardData = await response.json();
                setData(dashboardData);
            } catch (error) {
                toast.error('Error fetching dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (!data) return <div>No data available</div>;

    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                <TopNavbar />
                <div className="p-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Revenue"
                            value={`$${data.totalRevenue?.toLocaleString()}`}
                            icon="💰"
                        />
                        <StatCard
                            title="Total Orders"
                            value={data.stats.totalOrders.toString()}
                            icon="📦"
                        />
                        <StatCard
                            title="Total Products"
                            value={data.stats.totalProducts.toString()}
                            icon="🏷️"
                        />
                        <StatCard
                            title="Total Users"
                            value={data.stats.totalUsers.toString()}
                            icon="👥"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Monthly Revenue Chart */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="_id.month"
                                        tickFormatter={(month) => new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="total" stroke="#8884d8" name="Revenue" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Sales by Category */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.salesByCategory}
                                        dataKey="total"
                                        nameKey="_id"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        label
                                    >
                                        {data.salesByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.topProducts}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="product.name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="totalSold" fill="#8884d8" name="Units Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recent Orders Table */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2">Order ID</th>
                                            <th className="px-4 py-2">Customer</th>
                                            <th className="px-4 py-2">Amount</th>
                                            <th className="px-4 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.recentOrders.map((order) => (
                                            <tr key={order._id}>
                                                <td className="px-4 py-2">{order._id.slice(-6)}</td>
                                                <td className="px-4 py-2">{order.user.name}</td>
                                                <td className="px-4 py-2">${order.totalPrice}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Low Stock Alerts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.lowStockProducts.map((product) => (
                                <div key={product.name} className="p-4 bg-red-50 rounded-lg">
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-red-600">Only {product.countInStock} units left</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </SidebarProvider>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon: string;
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-500 text-sm">{title}</p>
                    <p className="text-2xl font-semibold mt-1">{value}</p>
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
        </div>
    );
}