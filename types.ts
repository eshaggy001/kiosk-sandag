
export type Category = 'Coffee' | 'Smoothie & Frappe' | 'Tea & Juice' | 'Dessert' | 'Seasonal Specials';

export interface Product {
  id: string;
  name: string;
  englishName: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  calories: number;
  volume?: string;
  temperature: 'HOT' | 'ICE' | 'BOTH';
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: 'Small' | 'Medium' | 'Big Mega';
  temperature: 'HOT' | 'ICE';
  customizations: {
    milk?: string;
    sweetness?: string;
    addOns: CustomizationOption[];
  };
}

export enum KioskStep {
  WELCOME = 'WELCOME',
  ORDER_TYPE = 'ORDER_TYPE',
  MENU = 'MENU',
  CHECKOUT = 'CHECKOUT',
  PAYMENT = 'PAYMENT',
  SUCCESS = 'SUCCESS'
}

export type OrderType = 'Eat In' | 'Take Out';
