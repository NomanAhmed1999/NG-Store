'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/types/product.types';
import { BASE_URL } from '@/lib/constant';
import ProductCard from '@/components/common/ProductCard';
import ProductListLoader from '@/components/common/ProductListLoader';
import { toast } from 'react-hot-toast';
import BreadcrumbShop from "@/components/shop-page/BreadcrumbShop";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MobileFilters from "@/components/shop-page/filters/MobileFilters";
import Filters from "@/components/shop-page/filters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Footer from "@/components/layout/Footer";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import debounce from 'lodash/debounce';
import { Button } from "@/components/ui/button";

interface FilterState {
  categories: string[];
  priceRange: { min: number; max: number };
  brands: string[];
  rating: number | null;
  sort: string;
  search: string;
  page: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: 0, max: 10000 },
    brands: [],
    rating: null,
    sort: '',
    search: '',
    page: 1
  });

  const debouncedFetch = useCallback(
    debounce((filterValues: FilterState) => {
      const fetchProducts = async () => {
        try {
          setIsLoading(true);
          const queryParams = new URLSearchParams();

          if (filterValues.categories.length) {
            queryParams.set('categories', filterValues.categories.join(','));
          }
          if (filterValues.priceRange.min > 0) {
            queryParams.set('minPrice', filterValues.priceRange.min.toString());
          }
          if (filterValues.priceRange.max < 10000) {
            queryParams.set('maxPrice', filterValues.priceRange.max.toString());
          }
          if (filterValues.brands.length) {
            queryParams.set('brands', filterValues.brands.join(','));
          }
          if (filterValues.rating) {
            queryParams.set('rating', filterValues.rating.toString());
          }
          if (filterValues.sort) {
            queryParams.set('sort', filterValues.sort);
          }
          if (filterValues.search) {
            queryParams.set('search', filterValues.search);
          }
          queryParams.set('page', filterValues.page.toString());
          queryParams.set('limit', '12');

          const response = await fetch(`${BASE_URL}/products?${queryParams}`);
          if (!response.ok) throw new Error('Failed to fetch products');
          
          const data = await response.json();
          setProducts(data.products);
          setTotalPages(data.pages);
        } catch (error) {
          toast.error('Error fetching products');
        } finally {
          setIsLoading(false);
        }
      };

      fetchProducts();
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetch(filters);
    return () => {
      debouncedFetch.cancel();
    };
  }, [filters, debouncedFetch]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: 0, max: 10000 },
      brands: [],
      rating: null,
      sort: '',
      search: '',
      page: 1
    });
  };

  const handleSortChange = (value: string) => {
    let sortValue = '';
    switch (value) {
      case 'most-popular':
        sortValue = 'rating_desc';
        break;
      case 'low-price':
        sortValue = 'price_asc';
        break;
      case 'high-price':
        sortValue = 'price_desc';
        break;
    }
    handleFilterChange({ sort: sortValue });
  };

  const handlePageChange = (page: number) => {
    handleFilterChange({ page });
  };

  return (
    <>
      <TopNavbar />
      <main className="pb-20">
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
          <BreadcrumbShop />
          <div className="flex md:space-x-5 items-start">
            <div className="hidden md:block min-w-[295px] max-w-[295px] border border-black/10 rounded-[20px] px-5 md:px-6 py-5 space-y-5 md:space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black text-xl">Filters</span>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Clear All
                </button>
              </div>
              <Filters 
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
            <div className="flex flex-col w-full space-y-5">
              <div className="flex flex-col lg:flex-row lg:justify-between">
                <div className="flex items-center justify-between">
                  <h1 className="font-bold text-2xl md:text-[32px]">Casual</h1>
                  <MobileFilters 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                  />
                </div>
                <div className="flex flex-col sm:items-center sm:flex-row">
                  <span className="text-sm md:text-base text-black/60 mr-3">
                    Showing {((filters.page - 1) * 12) + 1}-{Math.min(filters.page * 12, products.length)} of {products.length} Products
                  </span>
                  <div className="flex items-center">
                    Sort by:{" "}
                    <Select 
                      defaultValue="most-popular"
                      onValueChange={handleSortChange}
                    >
                      <SelectTrigger className="font-medium text-sm px-1.5 sm:text-base w-fit text-black bg-transparent shadow-none border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="most-popular">Most Popular</SelectItem>
                        <SelectItem value="low-price">Low Price</SelectItem>
                        <SelectItem value="high-price">High Price</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              {isLoading ? (
                <ProductListLoader />
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <p className="text-2xl font-medium text-gray-500 mb-4">
                    No products found
                  </p>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button
                    onClick={handleClearFilters}
                    className="bg-black text-white px-6 py-2 rounded-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {products.map((product: Product) => (
                    <ProductCard key={product.id} data={product} />
                  ))}
                </div>
              )}
              <hr className="border-t-black/10" />
              <Pagination className="justify-between">
                <PaginationPrevious 
                  className="border border-black/10 cursor-pointer"
                  onClick={() => handlePageChange(filters.page - 1)}
                  aria-disabled={filters.page === 1}
                />
                <PaginationContent>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current page
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - filters.page) <= 1;
                    })
                    .map((page, index, array) => (
                      <PaginationItem key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <PaginationEllipsis className="text-black/50 font-medium text-sm" />
                        )}
                        <PaginationLink
                          className="text-black/50 font-medium text-sm"
                          isActive={page === filters.page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                </PaginationContent>
                <PaginationNext 
                  className="border border-black/10 cursor-pointer"
                  onClick={() => handlePageChange(filters.page + 1)}
                  aria-disabled={filters.page === totalPages}
                />
              </Pagination>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
