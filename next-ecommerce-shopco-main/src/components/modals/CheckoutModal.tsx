"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCartStore } from "@/lib/store/useCartStore";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BASE_URL } from "@/lib/constant";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  // Add more countries as needed
];

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, totalQuantities, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    zipCode: "",
    address1: "",
    address2: "",
    mapLink: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'country', 'city', 'state', 'zipCode', 'address1'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      const orderItems = items.map(item => ({
        quantity: item.quantity,
        product: item.id
      }));

      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const orderData = {
        orderItems,
        shippingAddress1: formData.address1,
        shippingAddress2: formData.address2,
        city: formData.city,
        zip: formData.zipCode,
        country: formData.country,
        phone: formData.phone,
        status: "Pending",
        totalPrice,
        user: "67bec6c00b880e1b3c12258d", // Replace with actual user ID
        dateOrdered: new Date().toISOString()
      };

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      toast.success('Your order has been confirmed!');
      clearCart();
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="items">
              <AccordionTrigger>Order Summary ({items.length} items)</AccordionTrigger>
              <AccordionContent>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 font-semibold">
                  Total: ${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="name"
              placeholder="Full Name *"
              value={formData.name}
              onChange={handleInputChange}
            />
            <Input
              name="email"
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              name="phone"
              placeholder="Phone Number *"
              value={formData.phone}
              onChange={handleInputChange}
            />
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Country *" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="city"
              placeholder="City *"
              value={formData.city}
              onChange={handleInputChange}
            />
            <Input
              name="state"
              placeholder="State *"
              value={formData.state}
              onChange={handleInputChange}
            />
            <Input
              name="zipCode"
              placeholder="ZIP Code *"
              value={formData.zipCode}
              onChange={handleInputChange}
            />
            <Input
              name="address1"
              placeholder="Address Line 1 *"
              value={formData.address1}
              onChange={handleInputChange}
            />
            <Input
              name="address2"
              placeholder="Address Line 2"
              value={formData.address2}
              onChange={handleInputChange}
            />
            <Input
              name="mapLink"
              placeholder="Google Maps Link (Optional)"
              value={formData.mapLink}
              onChange={handleInputChange}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-black text-white hover:bg-black/90"
            >
              {isLoading ? "Processing..." : "Confirm Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 