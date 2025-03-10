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

export default function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          setRelatedProducts(relatedData.filter((p: Product) => p.id !== data.id));
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
      <Footer/>
    </main>
  );
}
