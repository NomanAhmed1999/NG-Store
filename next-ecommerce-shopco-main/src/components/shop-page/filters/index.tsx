import React from "react";
import { Button } from "@/components/ui/button";

interface FilterState {
  categories: string[];
  priceRange: { min: number; max: number };
  brands: string[];
  sort: string;
  search: string;
  page: number;
}

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange, onClearFilters }) => {
  const categories = ['new-arrivals', 'top-selling', 'regular'];
  const brands = ['Nike', 'Adidas', 'Puma', 'Reebok'];

  const handleApplyFilter = () => {
    // You can add additional logic here before applying filters
    console.log('Filters applied:', filters);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        
      </div>
      <hr className="border-t-black/10" />
      {/* Categories Section */}
      <div>
        <h3 className="font-medium mb-3">Categories</h3>
        {categories.map(category => (
          <label key={category} className="flex items-center mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.categories.includes(category)}
              onChange={(e) => {
                const newCategories = e.target.checked
                  ? [...filters.categories, category]
                  : filters.categories.filter(c => c !== category);
                onFilterChange({ categories: newCategories });
              }}
              className="mr-2"
            />
            <span className="capitalize">{category.replace('-', ' ')}</span>
          </label>
        ))}
      </div>

      <hr className="border-t-black/10" />
      {/* Price Range Section */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            value={filters.priceRange.min}
            onChange={(e) => onFilterChange({
              priceRange: { ...filters.priceRange, min: Number(e.target.value) }
            })}
            className="w-24 border rounded p-2"
            placeholder="Min"
          />
          <input
            type="number"
            value={filters.priceRange.max}
            onChange={(e) => onFilterChange({
              priceRange: { ...filters.priceRange, max: Number(e.target.value) }
            })}
            className="w-24 border rounded p-2"
            placeholder="Max"
          />
        </div>
      </div>

      <hr className="border-t-black/10" />
      {/* Brands Section */}
      <div>
        <h3 className="font-medium mb-3">Brands</h3>
        {brands.map(brand => (
          <label key={brand} className="flex items-center mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.brands.includes(brand)}
              onChange={(e) => {
                const newBrands = e.target.checked
                  ? [...filters.brands, brand]
                  : filters.brands.filter(b => b !== brand);
                onFilterChange({ brands: newBrands });
              }}
              className="mr-2"
            />
            <span>{brand}</span>
          </label>
        ))}
      </div>

      <hr className="border-t-black/10" />
      {/* Rating Section */}

      <Button
        type="button"
        className="bg-black w-full rounded-full text-sm font-medium py-4 h-12"
        onClick={handleApplyFilter}
      >
        Apply Filter
      </Button>
    </>
  );
};

export default Filters;
