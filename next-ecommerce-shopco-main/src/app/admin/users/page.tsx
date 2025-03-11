"use client";

import React, { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/common/app-sidebar';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import Footer from '@/components/layout/Footer';
import { BASE_URL } from '@/lib/constant';
import { toast } from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { debounce } from 'lodash';

interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isAdmin: boolean;
    isActive: boolean;
    dateCreated: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchUsers = async (search: string = '', status: string = 'all') => {
        try {
            let url = `${BASE_URL}/users?`;
            if (search) url += `search=${search}&`;
            if (status !== 'all') url += `status=${status}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            toast.error('Error fetching users');
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedFetch = debounce((search: string, status: string) => {
        fetchUsers(search, status);
    }, 500);

    useEffect(() => {
        debouncedFetch(searchTerm, statusFilter);
        return () => {
            debouncedFetch.cancel();
        };
    }, [searchTerm, statusFilter]);

    const handleStatusChange = async (userId: string, isActive: boolean) => {
        try {
            const response = await fetch(`${BASE_URL}/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive }),
            });

            if (!response.ok) throw new Error('Failed to update user status');
            
            setUsers(users.map(user => 
                user._id === userId ? { ...user, isActive } : user
            ));
            
            toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            toast.error('Error updating user status');
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                <TopNavbar isAdmin={true} />
                <div className='pt-24 p-6'>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold mb-6">User Management</h1>
                        
                        {/* Filters */}
                        <div className="flex gap-4 mb-6">
                            <div className="w-64">
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Users Table */}
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.phone}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        user.isAdmin 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {user.isAdmin ? 'Admin' : 'User'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        user.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Switch
                                                            checked={user.isActive}
                                                            onCheckedChange={(checked) => 
                                                                handleStatusChange(user._id, checked)
                                                            }
                                                        />
                                                        <span className="text-sm text-gray-500">
                                                            {user.isActive ? 'Deactivate' : 'Activate'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
                <Footer/>
            </main>
        </SidebarProvider>
    );
}