"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/useCartStore";
import { Product } from "@/types/product.types";
import { useState } from "react";
import { toast } from "react-hot-toast";
import CartCounter from "../../ui/CartCounter";

interface AddToCardSectionProps {
  product: Product & {
    selectedColor: string;
    selectedSize: string;
  };
}

const AddToCardSection: React.FC<AddToCardSectionProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = () => {
    if (!product.selectedColor || !product.selectedSize) {
      toast.error("Please select both color and size");
      return;
    }
    
    addToCart({
      ...product,
      id: product.id.toString(),
    }, quantity);
    toast.success("Product added to cart!");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-8">
        <CartCounter
          initialValue={quantity}
          onAdd={() => setQuantity(prev => prev + 1)}
          onRemove={() => setQuantity(prev => Math.max(1, prev - 1))}
        />
        <Button
          onClick={handleAddToCart}
          className="bg-black text-white rounded-full px-12 py-4 h-12"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default AddToCardSection;
