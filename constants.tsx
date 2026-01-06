
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 's1',
    name: '감튀스틱 밀크쉐이크',
    englishName: 'French Fries Milkshake',
    description: '부드럽고 달콤한 밀크쉐이크에 바삭한 감자튀김스틱을 더한 단짠 매력의 겨울시즌 한정 쉐이크',
    price: 4.50,
    category: 'Seasonal Specials',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80',
    calories: 478.2,
    volume: '591ml',
    temperature: 'ICE'
  },
  {
    id: 's2',
    name: '마시멜로스노우 크림초코',
    englishName: 'Marshmallow Chocolate',
    description: '눈처럼 소복하게 쌓인 우유크림 위 바삭뽀득한 마시멜로우가 듬뿍 올라간 달콤한 초코라떼',
    price: 4.20,
    category: 'Seasonal Specials',
    image: 'https://images.unsplash.com/photo-1544787210-282d93ad9ecf?auto=format&fit=crop&w=600&q=80',
    calories: 485.4,
    volume: '591ml',
    temperature: 'BOTH'
  },
  {
    id: 'f1',
    name: '누룽누룽 바삭 프라페',
    englishName: 'Nurung-Ji Crisp Frappe',
    description: '여주쌀로 만든 누룽지를 넣어 달달 꼬소한 프라페 위로 바삭한 누룽지를 올린 가을/겨울 한정 프라페',
    price: 4.80,
    category: 'Smoothie & Frappe',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
    calories: 591.3,
    volume: '591ml',
    temperature: 'ICE'
  },
  {
    id: 'f2',
    name: '피넛버터 초코 프라페',
    englishName: 'Peanut Butter Chocolate Frappe',
    description: '진한 누가초코 프라페에 고소한 피넛버터를 더해 단짠 풍미가 어우러진 프라페',
    price: 4.80,
    category: 'Smoothie & Frappe',
    image: 'https://images.unsplash.com/photo-1626078436897-9e6e0f2b0124?auto=format&fit=crop&w=600&q=80',
    calories: 639.4,
    volume: '591ml',
    temperature: 'ICE'
  },
  {
    id: 'j1',
    name: '메가 비타 팝스무디',
    englishName: 'Mega Vitamin Pop Smoothie',
    description: '비타민 7종 함유! 상큼한 오렌지망고와 베리코코넛잼의 에너지 한 잔',
    price: 3.90,
    category: 'Smoothie & Frappe',
    image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
    calories: 332.7,
    volume: '591ml',
    temperature: 'ICE'
  },
  {
    id: 'c1',
    name: '메가 아메리카노',
    englishName: 'Mega Americano',
    description: '진한 두 샷으로 더 깊고 풍부한 메가MGC커피의 시그니처 커피',
    price: 2.00,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    calories: 15,
    volume: '591ml',
    temperature: 'BOTH'
  },
  {
    id: 'c2',
    name: '왕메가카페라떼',
    englishName: 'BIG MEGA Caffe Latte',
    description: '부드러운 우유와 진한 에스프레소가 어우러진 대용량 라떼',
    price: 3.90,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=80',
    calories: 269.4,
    volume: '946ml',
    temperature: 'ICE'
  },
  {
    id: 't1',
    name: '제로 체리콜라',
    englishName: 'Cherry Cola Zero',
    description: '체리의 새콤함과 콜라의 청량감을 즐기는 제로 칼로리 에이드',
    price: 3.50,
    category: 'Tea & Juice',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    calories: 7.9,
    volume: '710ml',
    temperature: 'ICE'
  },
  {
    id: 'd1',
    name: '버터 크로와상',
    englishName: 'Butter Croissant',
    description: '매일 아침 구워내는 고소하고 담백한 프랑스 정통 크로와상',
    price: 3.20,
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
  { name: 'Medium', upcharge: 0.50, oz: 20 },
  { name: 'Big Mega', upcharge: 1.50, oz: 32 }
];

export const MILK_OPTIONS = ['Normal', 'Skim Milk', 'Oat Milk (+ $0.60)', 'Almond Milk (+ $0.60)'];
export const SWEETNESS_LEVELS = ['100% (Standard)', '75%', '50%', 'Unsweetened'];
export const ADD_ONS = [
  { id: 'esp', name: 'Extra Espresso Shot', price: 0.90 },
  { id: 'vsy', name: 'Vanilla Syrup', price: 0.50 },
  { id: 'whc', name: 'Whipped Cream', price: 0.60 },
  { id: 'ice', name: 'Add Ice Cream', price: 1.00 }
];
