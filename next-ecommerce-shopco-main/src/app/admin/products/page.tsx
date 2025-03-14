"use client";

import React, { useState, useEffect } from 'react';
import { AppSidebar } from '@/components/common/app-sidebar';
import TopNavbar from '@/components/layout/Navbar/TopNavbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/layout/Footer';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';
import { BASE_URL } from '@/lib/constant';

interface Product {
  _id: string;
  name: string;
  description: string;
  richDescription: string;
  image: string;
  images: string[];
  brand: string;
  price: number;
  category: Category;
  countInStock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface ProductType {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface FormData {
  name: string;
  description: string;
  richDescription: string;
  image?: string;
  brand: string;
  price: number;
  category: string;
  countInStock: number;
  isFeatured: boolean;
  productType: string;
  colors: string[];
  sizes: string[];
}

function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    richDescription: '',
    brand: '',
    price: 0,
    category: '',
    countInStock: 0,
    isFeatured: false,
    productType: '',
    colors: [],
    sizes: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/products');
      setProducts(response.data?.products);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/product-types`);
      setProductTypes(response.data.productTypes.filter((pt: ProductType) => pt.isActive));
    } catch (error) {
      toast.error('Failed to fetch product types');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchProductTypes();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
        if (formData[key] !== undefined) {
          formDataToSend.append(key, formData[key].toString());
        }
      });
      
      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('image', fileInputRef.current.files[0]);
      }

      await axios.post('http://localhost:3000/api/v1/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Product added successfully');
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        description: '',
        richDescription: '',
        brand: '',
        price: 0,
        category: '',
        countInStock: 0,
        isFeatured: false,
        productType: '',
        colors: [],
        sizes: []
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchProducts();
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const formDataToSend = new FormData();
      (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
        if (key === 'category') {
          formDataToSend.append('category', formData[key]);
        } else if (formData[key] !== undefined) {
          formDataToSend.append(key, formData[key].toString());
        }
      });
      
      if (fileInputRef.current?.files?.[0]) {
        formDataToSend.append('image', fileInputRef.current.files[0]);
      }

      await axios.put(`http://localhost:3000/api/v1/products/${selectedProduct._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Product updated successfully');
      setIsAddModalOpen(false);
      setSelectedProduct(null);
      setFormData({
        name: '',
        description: '',
        richDescription: '',
        image: '',
        brand: '',
        price: 0,
        category: '',
        countInStock: 0,
        isFeatured: false,
        productType: '',
        colors: [],
        sizes: []
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/products/${selectedProduct._id}`);
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      richDescription: product.richDescription,
      brand: product.brand,
      price: product.price,
      category: product.category?._id || '',
      countInStock: product.countInStock,
      isFeatured: product.isFeatured,
      productType: '',
      colors: [],
      sizes: []
    });
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      richDescription: '',
      brand: '',
      price: 0,
      category: '',
      countInStock: 0,
      isFeatured: false,
      productType: '',
      colors: [],
      sizes: []
    });
  };

  const handleAddColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor('');
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(color => color !== colorToRemove)
    }));
  };

  const handleAddSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.toUpperCase()]
      }));
      setNewSize('');
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(size => size !== sizeToRemove)
    }));
  };

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <AppSidebar />
        <main className="flex-1 w-full">
          <TopNavbar isAdmin={true} />
          <div className='pt-24 p-4 w-full'>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Products</h1>
              <Button onClick={() => {
                setSelectedProduct(null);
                resetForm();
                setIsAddModalOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <div className="h-12 w-12 relative rounded overflow-hidden">
                            <Image 
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <Link 
                          href={`/admin/products/${product._id}`}
                          className="font-bold hover:underline"
                        >
                          {product.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.category?.name || 'No Category'}</TableCell>
                    <TableCell>{product.countInStock}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Add/Edit Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedProduct ? 'Edit Product' : 'Add Product'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={selectedProduct ? handleEdit : handleAdd} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="countInStock">Stock</Label>
                      <Input
                        id="countInStock"
                        name="countInStock"
                        type="number"
                        value={formData.countInStock}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleSelectChange(value, 'category')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="image">Product Image</Label>
                      {selectedProduct && (
                        <div className="mb-2">
                          <img
                            src={selectedProduct.image}
                            alt={selectedProduct.name}
                            className="w-32 h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      <Input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        required={!selectedProduct}
                      />
                    </div>
                    <div>
                      <Label htmlFor="productType">Product Type</Label>
                      <Select
                        value={formData.productType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, productType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Product Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {productTypes.map((type) => (
                            <SelectItem key={type._id} value={type._id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Colors</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newColor}
                          onChange={(e) => setNewColor(e.target.value)}
                          placeholder="Add a color"
                        />
                        <Button type="button" onClick={handleAddColor}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.colors.map((color) => (
                          <div 
                            key={color}
                            className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1"
                          >
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: color }}
                            />
                            {color}
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(color)}
                              className="ml-1 text-gray-500 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Sizes</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                          placeholder="Add a size (e.g., S, M, L, XL)"
                        />
                        <Button type="button" onClick={handleAddSize}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.sizes.map((size) => (
                          <div 
                            key={size}
                            className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1"
                          >
                            {size}
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(size)}
                              className="ml-1 text-gray-500 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="richDescription">Rich Description</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.richDescription}
                      onChange={(content) => handleSelectChange(content, 'richDescription')}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {selectedProduct ? 'Update' : 'Add'} Product
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Delete</DialogTitle>
                </DialogHeader>
                <p>Are you sure you want to delete this product?</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Footer/>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default ProductPage;