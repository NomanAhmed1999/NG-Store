"use client";

import React from 'react'
import { AppSidebar } from '@/components/common/app-sidebar';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

function page() {


    return (

        <SidebarProvider>
            <AppSidebar />
            <main>
                <TopNavbar isAdmin={true} />
                <div className='pt-24 p-4'>
                    Admin Dashboard
                </div>
            </main>
        </SidebarProvider>
    )
}

export default page