"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { IoMdCheckmark } from "react-icons/io";

interface ColorSelectionProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

const ColorSelection: React.FC<ColorSelectionProps> = ({ 
  colors, 
  selectedColor, 
  onColorSelect 
}) => {
  return (
    <div className="flex flex-col">
      <span className="text-sm sm:text-base text-black/60 mb-4">
        Select Colors
      </span>
      <div className="flex items-center flex-wrap space-x-3 sm:space-x-4">
        {colors.map((color, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              "rounded-full w-9 sm:w-10 h-9 sm:h-10 flex items-center justify-center",
            )}
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(color)}
          >
            {selectedColor === color && (
              <IoMdCheckmark className="text-base text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelection;
