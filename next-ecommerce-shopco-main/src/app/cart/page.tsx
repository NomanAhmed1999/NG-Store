"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CartCounter from "@/components/ui/CartCounter";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/app-sidebar";

export default function CartPage() {
  const { items, totalQuantities, removeFromCart, updateQuantity } = useCartStore();

  const totalPrice = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  if (items.length === 0) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <main>
          <TopNavbar />
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
              <Link href="/shop">
                <Button className="bg-black text-white rounded-full px-8">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  return (
      <main>
        <TopNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-8">Shopping Cart ({totalQuantities} items)</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-4 border-b py-4">
                  <div className="w-24 h-24 relative">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">{item.name}</h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <p className="text-gray-500 text-sm mb-4">{item.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <CartCounter
                        initialValue={item.quantity}
                        onAdd={() => updateQuantity(item.id, item.quantity + 1)}
                        onRemove={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      />
                      <p className="font-medium">{item.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{totalPrice}</span>
                  </div>
                </div>
                
                <Button className="w-full bg-black text-white rounded-full mt-6">
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
  );
}
