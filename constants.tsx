
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 's1',
    name: 'French Fries Milkshake',
    englishName: 'French Fries Milkshake',
    description: 'Sweet and creamy milkshake topped with crunchy french fry sticks for a perfect sweet-salty combo.',
    price: 12500,
    category: 'Seasonal Specials',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    calories: 478.2,
    volume: '591ml',
    temperature: 'ICE'
  },
  {
    id: 's2',
    name: 'Marshmallow Snow Choco',
    englishName: 'Marshmallow Chocolate',
    description: 'Rich chocolate latte topped with fluffy milk cream and crunchy snow-like marshmallows.',
    price: 11900,
    category: 'Seasonal Specials',
    image: 'https://images.unsplash.com/photo-1544787210-282d93ad9ecf?auto=format&fit=crop&w=600&q=80',
    calories: 485.4,
    volume: '591ml',
    temperature: 'BOTH'
  },
  {
    id: 'f1',
    name: 'Nurung-ji Crisp Frappe',
    englishName: 'Nurung-Ji Crisp Frappe',
    description: 'Savory and sweet frappe made with traditional toasted rice, topped with extra crispy rice bits.',
    price: 13500,
    category: 'Smoothie & Frappe',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    calories: 591.3,
    volume: '591ml',
    temperature: 'ICE'
  },
  {
    id: 'f2',
    name: 'Peanut Butter Choco Frappe',
    englishName: 'Peanut Butter Chocolate Frappe',
    description: 'Smooth nougat chocolate frappe blended with salty peanut butter for a rich flavor profile.',
    price: 13500,
    category: 'Smoothie & Frappe',
    image: 'https://images.unsplash.com/photo-1626078436897-9e6e0f2b0124?auto=format&fit=crop&w=600&q=80',
    calories: 639.4,
    volume: '591ml',
    temperature: 'ICE'
  },
  {
    id: 'j1',
    name: 'Mega Vita Pop Smoothie',
    englishName: 'Mega Vitamin Pop Smoothie',
    description: 'Packed with 7 vitamins! Refreshing orange-mango with sweet berry coconut jam.',
    price: 10500,
    category: 'Smoothie & Frappe',
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
    calories: 332.7,
    volume: '591ml',
    temperature: 'ICE'
  },
  {
    id: 'c1',
    name: 'Mega Americano',
    englishName: 'Mega Americano',
    description: 'Deep and rich signature coffee brewed with a premium double shot.',
    price: 5500,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    calories: 15,
    volume: '591ml',
    temperature: 'BOTH'
  },
  {
    id: 'c2',
    name: 'King Mega Cafe Latte',
    englishName: 'BIG MEGA Caffe Latte',
    description: 'Extra large latte featuring smooth steamed milk and our bold espresso blend.',
    price: 8500,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=80',
    calories: 269.4,
    volume: '946ml',
    temperature: 'ICE'
  },
  {
    id: 't1',
    name: 'Zero Cherry Cola',
    englishName: 'Cherry Cola Zero',
    description: 'A refreshing zero-calorie ade combining tart cherry with fizzy cola.',
    price: 7500,
    category: 'Tea & Juice',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    calories: 7.9,
    volume: '710ml',
    temperature: 'ICE'
  },
  {
    id: 'd1',
    name: 'Butter Croissant',
    englishName: 'Butter Croissant',
    description: 'French-style buttery pastry, baked fresh for a flaky and savory treat.',
    price: 6500,
    category: 'Dessert',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    calories: 340,
    temperature: 'BOTH'
  }
];

export const CATEGORIES: { name: string; icon: string }[] = [
  { name: 'Seasonal Specials', icon: '❄️' },
  { name: 'Coffee', icon: '☕' },
  { name: 'Smoothie & Frappe', icon: '🥤' },
  { name: 'Tea & Juice', icon: '🍎' },
  { name: 'Dessert', icon: '🥐' }
];

export const SIZES = [
  { name: 'Small', upcharge: 0, oz: 12 },
  { name: 'Medium', upcharge: 1500, oz: 20 },
  { name: 'Big Mega', upcharge: 3000, oz: 32 }
];

export const MILK_OPTIONS = ['Normal', 'Skim Milk', 'Oat Milk (+ 1,500₮)', 'Almond Milk (+ 1,500₮)'];
export const SWEETNESS_LEVELS = ['100% (Standard)', '75%', '50%', 'Unsweetened'];
export const ADD_ONS = [
  { id: 'esp', name: 'Extra Espresso Shot', price: 2500 },
  { id: 'vsy', name: 'Vanilla Syrup', price: 1500 },
  { id: 'whc', name: 'Whipped Cream', price: 1800 },
  { id: 'ice', name: 'Add Ice Cream', price: 3000 }
];
