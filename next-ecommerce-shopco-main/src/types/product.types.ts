export type Discount = {
  amount: number;
  percentage: number;
};

export interface Product {
  id: number;
  name: string;
  image: string;
  images: string[];
  price: number;
  discount: Discount;
  rating: number;
  category: any;
  description: string;
  colors: string[];
  sizes: string[];
}
