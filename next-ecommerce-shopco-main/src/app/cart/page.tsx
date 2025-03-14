"use client";

import { useCartStore } from "@/lib/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CartCounter from "@/components/ui/CartCounter";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import { useState, useEffect } from "react";
import { CheckoutModal } from "@/components/modals/CheckoutModal";
import axios from 'axios';
import { BASE_URL } from '@/lib/constant';
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

interface DeliveryCharge {
  _id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
  freeShippingThreshold: number;
  isActive: boolean;
}

interface CouponResponse {
  success: boolean;
  discountAmount: number;
  discountPercentage: number;
  message?: string;
}

export default function CartPage() {
  const { items, totalItems, removeFromCart, updateQuantity } = useCartStore();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState<DeliveryCharge[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryCharge | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountPercentage: number;
  } | null>(null);

  const totalPrice = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  useEffect(() => {
    fetchDeliveryCharges();
  }, []);

  const fetchDeliveryCharges = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/delivery-charges`);
      const activeCharges = response.data.filter((charge: DeliveryCharge) => charge.isActive);
      setDeliveryCharges(activeCharges);
      if (activeCharges.length > 0) {
        setSelectedDelivery(activeCharges[0]); // Set default delivery option
      }
    } catch (error) {
      console.error('Failed to fetch delivery charges');
    }
  };

  // Recalculate coupon discount whenever subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      updateCouponDiscount();
    }
  }, [totalPrice]); // This will run whenever totalPrice changes

  const updateCouponDiscount = async () => {
    if (!appliedCoupon?.code) return;

    try {
      const response = await axios.post<CouponResponse>(`${BASE_URL}/coupons/validate`, {
        code: appliedCoupon.code,
        amount: totalPrice
      });

      if (response.data.success) {
        setAppliedCoupon({
          ...appliedCoupon,
          discountAmount: response.data.discountAmount,
          discountPercentage: response.data.discountPercentage
        });
      } else {
        // If coupon becomes invalid (e.g., subtotal falls below minimum amount)
        toast.error('Coupon is no longer valid');
        setAppliedCoupon(null);
        setCouponCode('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Coupon is no longer valid');
      setAppliedCoupon(null);
      setCouponCode('');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const response = await axios.post<CouponResponse>(`${BASE_URL}/coupons/validate`, {
        code: couponCode,
        amount: totalPrice
      });

      if (response.data.success) {
        setAppliedCoupon({
          code: couponCode,
          discountAmount: response.data.discountAmount,
          discountPercentage: response.data.discountPercentage
        });
        toast.success('Coupon applied successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const isFreeShipping = selectedDelivery?.freeShippingThreshold && 
    subtotal > selectedDelivery.freeShippingThreshold;
  const shippingCost = isFreeShipping ? 0 : selectedDelivery?.price ?? 0;
  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal - discountAmount + shippingCost;

  console.log(items);

  if (items.length === 0) {
    return (
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
    );
  }

  return (
      <main>
        <TopNavbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-8">
            Shopping Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </h1>
          
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
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <div className="flex gap-4 mt-1 text-sm text-gray-500">
                          {item.selectedColor && (
                            <div className="flex items-center gap-1">
                              <span>Color:</span>
                              <div 
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: item.selectedColor }}
                                title={item.selectedColor}
                              />
                            </div>
                          )}
                          {item.selectedSize && (
                            <div className="flex items-center gap-1">
                              <span>Size:</span>
                              <span className="uppercase">{item.selectedSize}</span>
                            </div>
                          )}
                        </div>
                      </div>
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
                      <div className="text-right">
                        <p className="font-medium">Rs. {item.price * item.quantity}</p>
                        <p className="text-sm text-gray-500">Rs. {item.price} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-4">
                {/* Delivery Options */}
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Delivery Options</h3>
                  <div className="space-y-3">
                    {deliveryCharges.map((charge) => (
                      <div
                        key={charge._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedDelivery?._id === charge._id
                            ? 'border-black'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedDelivery(charge)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{charge.name}</p>
                            <p className="text-sm text-gray-500">
                              Estimated delivery: {charge.estimatedDays}
                            </p>
                            {charge.description && (
                              <p className="text-sm text-gray-500">{charge.description}</p>
                            )}
                            {charge.freeShippingThreshold > 0 && (
                              <p className="text-sm text-emerald-600">
                                Free shipping on orders over Rs. {charge.freeShippingThreshold}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {isFreeShipping ? (
                                <span className="text-emerald-600">Free</span>
                              ) : charge.price === 0 ? (
                                'Free'
                              ) : (
                                `Rs. ${charge.price}`
                              )}
                            </p>
                            {charge.freeShippingThreshold > 0 && !isFreeShipping && (
                              <p className="text-sm text-gray-500">
                                Add Rs. {(charge.freeShippingThreshold - subtotal).toFixed(2)} for free shipping
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Have a coupon?</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon || isApplyingCoupon}
                    />
                    {appliedCoupon ? (
                      <Button 
                        variant="outline" 
                        onClick={removeCoupon}
                        className="whitespace-nowrap"
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleApplyCoupon} 
                        disabled={!couponCode || isApplyingCoupon}
                        className="whitespace-nowrap"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </Button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <div className="mt-2 text-sm text-emerald-600">
                      Coupon "{appliedCoupon.code}" applied - {appliedCoupon.discountPercentage}% off
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-white p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                  <div className="flex flex-col space-y-4">
                    {/* Subtotal */}
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">Rs. {subtotal}</span>
                    </div>

                    {/* Discount Section - if coupon applied */}
                    {appliedCoupon && (
                      <div className="flex justify-between text-gray-600">
                        <span>Discount ({appliedCoupon.discountPercentage}% off)</span>
                        <span className="text-emerald-600">- Rs. {discountAmount}</span>
                      </div>
                    )}

                    {/* Shipping Section */}
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">Shipping</span>
                      <div className="text-right">
                        {isFreeShipping ? (
                          <div className="flex flex-col items-end">
                            <span className="text-emerald-600 font-medium">Free</span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-sm text-emerald-600">
                                🎉 Free shipping applied!
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="font-medium">Rs. {shippingCost}</span>
                            {selectedDelivery?.freeShippingThreshold && (
                              <div className="mt-2 w-48">
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div 
                                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                                      style={{ 
                                        width: `${Math.min((subtotal / selectedDelivery.freeShippingThreshold) * 100, 100)}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  Spend <span className="font-medium">Rs. {(selectedDelivery.freeShippingThreshold - subtotal).toFixed(2)}</span> more for free shipping
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Total Section */}
                    <div className="border-t border-gray-200 pt-4 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-lg">Total</span>
                        <div className="text-right">
                          <span className="font-semibold text-lg">Rs. {total}</span>
                          {(appliedCoupon || isFreeShipping) && (
                            <p className="text-sm text-emerald-600">
                              You saved Rs. {discountAmount + (isFreeShipping ? (selectedDelivery?.price ?? 0) : 0)}!
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedDelivery?.estimatedDays && (
                        <p className="text-sm text-gray-500 mt-2">
                          Estimated delivery: {selectedDelivery.estimatedDays}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-black text-white rounded-full mt-6"
                  onClick={() => setIsCheckoutModalOpen(true)}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />

        <CheckoutModal 
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
        />
      </main>
  );
}
