'use client';

import { useEffect, useState } from "react";
import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { Product } from "@/types/product.types";
import { BASE_URL } from "@/lib/constant";
import { toast } from "react-hot-toast";
import ProductLoader from "@/components/product-page/ProductLoader";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import { useCartStore } from "@/lib/store/useCartStore";
import { Button } from "@/components/ui/button";

export default function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${BASE_URL}/products/${params.slug[0]}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);

        // Fetch related products (products in the same category)
        const relatedResponse = await fetch(`${BASE_URL}/products?category=${data.category._id}`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          setRelatedProducts(relatedData.products.filter((p: Product) => p.id !== data.id));
        }
      } catch (error) {
        toast.error('Error fetching product details');
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product.id.toString(), // Convert number to string
        name: product.name,
        price: product.price,
        image: product.image,
        description: product.description,
        selectedColor,
        selectedSize,
      }, quantity);

      toast.success("Product added to cart!");
      setQuantity(1); // Reset quantity after adding
    }
  };

  if (isLoading) {
    return <ProductLoader />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <main>
    <TopNavbar/>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={product.name} />
        <section className="mb-11">
          <Header data={product} />
        </section>
        <Tabs description={product.description} />
      </div>
      {relatedProducts.length > 0 && (
        <div className="mb-[50px] sm:mb-20">
          <ProductListSec 
            title="You might also like" 
            data={relatedProducts}
            viewAllLink={`/shop?category=${product.category._id}`}
          />
        </div>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Color</h3>
          <div className="flex gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? 'border-black' : 'border-gray-200'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Size</h3>
          <div className="flex gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border rounded ${
                  selectedSize === size 
                    ? 'border-black bg-black text-white' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button 
        onClick={handleAddToCart}
        className="w-full"
      >
        Add to Cart
      </Button>

      <Footer/>
    </main>
  );
}
