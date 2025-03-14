"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SizeSelectionProps {
  sizes: string[];
  selectedSize: string;
  onSizeSelect: (size: string) => void;
}

const SizeSelection: React.FC<SizeSelectionProps> = ({ 
  sizes, 
  selectedSize, 
  onSizeSelect 
}) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Select Size
      </span>
      <div className="flex items-center flex-wrap gap-2.5">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onSizeSelect(size)}
            className={cn(
              "p-2 rounded-lg border border-black/10 text-sm font-medium",
              selectedSize === size
                ? "bg-black text-white"
                : "bg-white text-black hover:border-black"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelection;
