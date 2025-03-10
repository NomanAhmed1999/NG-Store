export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Product {
  id: string;
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
  dateCreated: string;
  
} 