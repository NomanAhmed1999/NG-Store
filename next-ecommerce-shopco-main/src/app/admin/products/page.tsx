"use client";

import React from 'react'
import { AppSidebar } from '@/components/common/app-sidebar';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductTable from '../admin-components/productTable';
import AddProduct from '../admin-components/addProduct';


function page() {


    return (

        <SidebarProvider>
            <AppSidebar />
            <main>
                <TopNavbar isAdmin={true} />
                <div className='pt-24 p-4'>


                    <Tabs defaultValue="products" className="w-[1050px]">
                        <TabsList>
                            <TabsTrigger value="products">Products</TabsTrigger>
                            <TabsTrigger value="add-product">Add Product</TabsTrigger>
                        </TabsList>
                        <TabsContent value="products">
                            <ProductTable />
                        </TabsContent>
                        <TabsContent value="add-product">
                            <AddProduct />
                        </TabsContent>
                    </Tabs>




                </div>
            </main>
        </SidebarProvider>
    )
}

export default page