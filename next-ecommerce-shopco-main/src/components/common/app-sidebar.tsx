import { Calendar, Home, Inbox, ListOrdered, Search, Settings, User, Truck, Tag } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DashboardIcon } from "@radix-ui/react-icons"
import Link from "next/link"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: DashboardIcon,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Home,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Inbox,
  },
  {
    title: "Product Types",
    url: "/admin/product-types",
    icon: Inbox,
  },
  {
    title: "Delivery Charges",
    url: "/admin/delivery-charges",
    icon: Truck,
  },
  {
    title: "Coupons",
    url: "/admin/coupons",
    icon: Tag,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: User,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ListOrdered,
  }
]

export function AppSidebar() {
  return (
    <Sidebar className="pt-[100px]">
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
