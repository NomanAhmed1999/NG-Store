"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/common/app-sidebar';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import Image from 'next/image';
import ImageViewerModal from '@/components/admin/ImageViewerModal';
import DraggableGallery from '@/components/admin/DraggableGallery';

interface Product {
  _id: string;
  name: string;
  description: string;
  richDescription: string;
  image: string;
  images: string[];
  brand: string;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  countInStock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/products/${params.id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Failed to fetch product details');
      router.push('/admin/products');
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('images', file);
    });

    try {
      await axios.put(
        `http://localhost:3000/api/v1/products/gallery-images/${params.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Images uploaded successfully');
      fetchProduct();
      setSelectedFiles(null);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/products/gallery-image/${params.id}`, {
        data: { imageUrl }
      });
      toast.success('Image deleted successfully');
      fetchProduct();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleReorderImages = async (reorderedImages: string[]) => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/products/gallery-images-reorder/${params.id}`,
        { images: reorderedImages }
      );
      setProduct(prev => prev ? { ...prev, images: reorderedImages } : null);
    } catch (error) {
      toast.error('Failed to reorder images');
      // Refresh the product to restore the original order
      fetchProduct();
    }
  };

  const handleDeleteMultipleImages = async (imageUrls: string[]) => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/products/gallery-images/${params.id}`, {
        data: { imageUrls }
      });
      toast.success('Images deleted successfully');
      fetchProduct();
    } catch (error) {
      toast.error('Failed to delete images');
    }
  };

  if (!product) return null;

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 w-full">
          <TopNavbar isAdmin={true} />
          <div className='pt-24 p-4 w-full'>
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{product.name}</h1>
                <Button onClick={() => router.push('/admin/products')}>
                  Back to Products
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Main Image</h2>
                    {product.image && (
                      <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold mb-4">Gallery Images</h2>
                    {product.images && product.images.length > 0 && (
                      <DraggableGallery
                        images={product.images}
                        onImageClick={setSelectedImage}
                        onReorder={handleReorderImages}
                        onDeleteMultiple={handleDeleteMultipleImages}
                      />
                    )}

                    {selectedImage && (
                      <ImageViewerModal
                        imageUrl={selectedImage}
                        onClose={() => setSelectedImage(null)}
                        onDelete={() => handleDeleteImage(selectedImage)}
                        productName={product.name}
                      />
                    )}

                    <form onSubmit={handleImageUpload} className="space-y-4">
                      <Input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                      />
                      <Button 
                        type="submit" 
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? 'Uploading...' : 'Upload Images'}
                      </Button>
                    </form>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold">Brand</h3>
                    <p>{product.brand}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Price</h3>
                    <p>${product.price}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Category</h3>
                    <p>{product.category?.name || 'No Category'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Stock</h3>
                    <p>{product.countInStock}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p>{product.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Rich Description</h3>
                    <div dangerouslySetInnerHTML={{ __html: product.richDescription }} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Rating</h3>
                    <p>{product.rating} ({product.numReviews} reviews)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
} 