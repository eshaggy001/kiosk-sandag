
import React, { useState, useEffect, useMemo } from 'react';
import { KioskStep, Product, Category, CartItem, OrderType } from './types';
import { PRODUCTS as InitialProducts, CATEGORIES as InitialCategories, SIZES as InitialSizes, MILK_OPTIONS as InitialMilkOptions, SWEETNESS_LEVELS as InitialSweetnessLevels, ADD_ONS as InitialAddOns } from './constants';
import { dataService } from './services/dataService';
import { getSmartRecommendations, getVirtualBaristaHelp } from './services/geminiService';

// --- Branding Constants ---
const BRAND_YELLOW = "#FDD000";
const BRAND_DARK = "#231F20";

// Helper to format currency
const formatPrice = (price: number) => {
  return price.toLocaleString() + '₮';
};

// --- Sub-components ---

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    chevronLeft: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    cart: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    x: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>,
    check: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>,
    help: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    back: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
    creditCard: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    qrCode: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>,
    home: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    coffeeIcon: <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.5 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2.5-2zM18 19H6V5h12v14zm-5-12h2v10h-2V7zm-4 4h2v6H9v-6z" /></svg>
  };
  return icons[name] || <span>?</span>;
};

const ProductImage = ({ src, alt, className }: { src: string, alt: string, className: string }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`${className} bg-stone-100 flex flex-col items-center justify-center p-4 text-stone-300`}>
        <Icon name="coffeeIcon" className="w-16 h-16 opacity-20 mb-2" />
        <span className="text-[10px] font-black uppercase tracking-widest text-center">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

// --- Main App ---

export default function App() {
  const [step, setStep] = useState<KioskStep>(KioskStep.WELCOME);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Seasonal Specials');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpQuery, setHelpQuery] = useState('');
  const [helpResponse, setHelpResponse] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<{ productName: string; reason: string }[]>([]);

  // Data State
  const [PRODUCTS, setProducts] = useState<Product[]>(InitialProducts);
  const [CATEGORIES, setCategories] = useState(InitialCategories);
  const [SIZES, setSizes] = useState(InitialSizes);
  const [MILK_OPTIONS, setMilkOptions] = useState(InitialMilkOptions);
  const [SWEETNESS_LEVELS, setSweetnessLevels] = useState(InitialSweetnessLevels);
  const [ADD_ONS, setAddOns] = useState(InitialAddOns);

  useEffect(() => {
    const loadData = async () => {
      const data = await dataService.getInitialData();
      if (data) {
        setProducts(data.products);
        setCategories(data.categories);
        setSizes(data.sizes);
        setMilkOptions(data.milkOptions);
        setSweetnessLevels(data.sweetnessLevels);
        setAddOns(data.addOns);
      }
    };
    loadData();
  }, []);

  const [isPaymentMethodModalOpen, setIsPaymentMethodModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'QPAY' | null>(null);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const resetOrder = () => {
    setCart([]);
    setStep(KioskStep.WELCOME);
    setOrderType(null);
    setIsPaymentMethodModalOpen(false);
    setPaymentMethod(null);
    setIsHelpOpen(false);
    setActiveProduct(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step !== KioskStep.WELCOME) {
        resetOrder();
      }
    }, 180000);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (cart.length > 0 && step === KioskStep.MENU) {
      const fetchRecs = async () => {
        const recs = await getSmartRecommendations(cart, PRODUCTS);
        setAiRecommendations(recs);
      };
      fetchRecs();
    } else if (cart.length === 0) {
      setAiRecommendations([]);
    }
  }, [cart, step, PRODUCTS]);

  const addToCart = (product: Product, customization: any) => {
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      name: product.name,
      price: product.price + (customization.sizePrice || 0) + (customization.addOns?.reduce((s: number, a: any) => s + a.price, 0) || 0),
      quantity: 1,
      image: product.image,
      size: customization.size || 'Medium',
      temperature: customization.temperature || 'ICE',
      customizations: {
        milk: customization.milk,
        sweetness: customization.sweetness,
        addOns: customization.addOns || []
      }
    };
    setCart(prev => [...prev, newItem]);
    setActiveProduct(null);
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpQuery.trim()) return;
    setIsAIProcessing(true);
    const response = await getVirtualBaristaHelp(helpQuery);
    setHelpResponse(response);
    setIsAIProcessing(false);
  };

  const handlePaymentSelect = (method: 'CARD' | 'QPAY') => {
    setPaymentMethod(method);
    setIsPaymentMethodModalOpen(false);
    setStep(KioskStep.PAYMENT);
  };

  // --- Views ---

  const WelcomeView = () => (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-yellow-400 cursor-pointer overflow-hidden"
      onClick={() => setStep(KioskStep.ORDER_TYPE)}
    >
      <div className="absolute inset-0 bg-[url('https://img.79plus.co.kr/megahp/common/img/quick_img.png')] opacity-5 animate-pulse scale-150 rotate-12" />
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        <div className="bg-stone-900 px-8 py-4 mb-12 rounded-2xl shadow-2xl">
          <h1 className="text-6xl font-black text-yellow-400 tracking-tighter italic">MEGA COFFEE</h1>
        </div>

        <div className="w-80 h-80 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-16 border-4 border-white/30">
          <img
            src="https://img.79plus.co.kr/megahp/common/img/new_logo.png"
            className="w-56 h-auto drop-shadow-2xl animate-bounce"
            alt="Mega Coffee"
          />
        </div>

        <div className="text-center space-y-4">
          <p className="text-stone-900 text-6xl font-extrabold uppercase tracking-tight">Tap to Order</p>
          <p className="text-stone-800 text-3xl font-bold opacity-60">Enjoy Big Size Coffee Here</p>
        </div>

        <div className="mt-24 px-12 py-6 bg-white/10 backdrop-blur-lg rounded-full border-2 border-white/20 flex gap-12 text-stone-900 font-bold text-2xl">
          <span>한국어</span>
          <span className="opacity-40">|</span>
          <span>ENGLISH</span>
          <span className="opacity-40">|</span>
          <span>MONGOLIAN</span>
        </div>
      </div>
    </div>
  );

  const OrderTypeView = () => (
    <div className="h-screen w-screen bg-white flex flex-col p-12 portrait:p-20 relative">
      <div className="absolute top-12 left-12 portrait:top-20 portrait:left-20">
        <button
          onClick={() => setStep(KioskStep.WELCOME)}
          className="bg-stone-50 p-6 rounded-[2rem] shadow-xl hover:bg-stone-100 transition-all active:scale-95 group border border-stone-100"
        >
          <Icon name="back" className="w-10 h-10 text-stone-900 group-hover:scale-110 transition-transform" />
        </button>
      </div>
      <div className="flex flex-col items-center mb-24">
        <img src="https://img.79plus.co.kr/megahp/common/img/new_logo_b.png" className="w-40 mb-12" />
        <h2 className="text-6xl font-black text-stone-900 tracking-tight">How would you like to enjoy?</h2>
      </div>

      <div className="flex-1 grid grid-cols-1 gap-12 max-w-4xl mx-auto w-full">
        <button
          onClick={() => { setOrderType('Eat In'); setStep(KioskStep.MENU); }}
          className="group relative bg-stone-50 rounded-[4rem] p-16 shadow-2xl hover:bg-yellow-400 transition-all duration-500 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-30 transition-opacity">
            <span className="text-[12rem]">🍽️</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-9xl mb-8 filter drop-shadow-lg">☕</span>
            <span className="text-7xl font-black text-stone-900 uppercase">Eat In</span>
            <p className="text-3xl text-stone-500 mt-6 font-bold group-hover:text-stone-800">Enjoy in our cozy cafe</p>
          </div>
        </button>

        <button
          onClick={() => { setOrderType('Take Out'); setStep(KioskStep.MENU); }}
          className="group relative bg-stone-50 rounded-[4rem] p-16 shadow-2xl hover:bg-yellow-400 transition-all duration-500 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-30 transition-opacity">
            <span className="text-[12rem]">🛍️</span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-9xl mb-8 filter drop-shadow-lg">🥤</span>
            <span className="text-7xl font-black text-stone-900 uppercase">Take Out</span>
            <p className="text-3xl text-stone-500 mt-6 font-bold group-hover:text-stone-800">Perfect for your journey</p>
          </div>
        </button>
      </div>
    </div>
  );

  const MenuView = () => {
    const filteredProducts = PRODUCTS.filter(p => p.category === selectedCategory);

    return (
      <div className="h-screen w-screen flex flex-col bg-white overflow-hidden font-sans">
        <header className="bg-yellow-400 px-8 py-8 shadow-md flex items-center justify-between z-20">
          <div className="flex items-center gap-6">
            <button onClick={() => setStep(KioskStep.ORDER_TYPE)} className="bg-stone-900 text-yellow-400 p-4 rounded-2xl shadow-lg">
              <Icon name="back" className="w-8 h-8" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-stone-900 italic tracking-tighter">MEGA COFFEE</h1>
              <p className="text-stone-800 font-bold text-sm tracking-widest">{orderType?.toUpperCase()}</p>
            </div>
          </div>

          <button
            onClick={resetOrder}
            className="flex items-center gap-3 bg-stone-900 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all"
          >
            <Icon name="home" className="w-8 h-8 text-yellow-400" />
            ШИНЭЭР ЭХЛЭХ
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <nav className="w-36 bg-stone-50 border-r border-stone-100 flex flex-col py-10 gap-12 overflow-y-auto">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name as Category)}
                className={`flex flex-col items-center gap-3 transition-all duration-300 relative px-2 ${selectedCategory === cat.name ? 'text-stone-900 scale-110' : 'text-stone-300'}`}
              >
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-sm transition-all ${selectedCategory === cat.name ? 'bg-yellow-400 shadow-yellow-200' : 'bg-white opacity-60'}`}>
                  {cat.icon}
                </div>
                <span className="text-sm font-black text-center leading-tight uppercase tracking-tight">{cat.name}</span>
                {selectedCategory === cat.name && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-12 bg-yellow-400 rounded-l-full" />}
              </button>
            ))}
          </nav>

          <main className="flex-1 p-8 overflow-y-auto bg-white">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-6xl font-black text-stone-900 tracking-tighter">{selectedCategory}</h2>
              <p className="text-stone-400 font-bold text-xl">{filteredProducts.length} Items Available</p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => setActiveProduct(product)}
                  className="bg-stone-50 rounded-[3rem] overflow-hidden group hover:ring-8 hover:ring-yellow-400/30 transition-all duration-300 cursor-pointer shadow-md border border-stone-100 flex flex-col"
                >
                  <div className="relative h-[24rem] overflow-hidden bg-stone-100">
                    <ProductImage src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    {product.temperature !== 'BOTH' && (
                      <span className={`absolute top-6 left-6 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${product.temperature === 'ICE' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white shadow-xl'}`}>
                        {product.temperature}
                      </span>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-lg shadow-sm text-stone-400 font-bold text-[11px] border border-white/40">
                      {product.calories} CAL
                    </div>
                  </div>
                  <div className="p-6 flex flex-col justify-between flex-1 min-h-[140px]">
                    <h3 className="text-2xl font-black text-stone-900 mb-2 leading-tight line-clamp-2 uppercase tracking-tight">{product.name}</h3>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-200 mt-auto">
                      <span className="text-3xl font-black text-stone-900 tracking-tighter italic">{formatPrice(product.price)}</span>
                      <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon name="chevronLeft" className="w-6 h-6 rotate-180 text-stone-900" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {aiRecommendations.length > 0 && (
              <div className="mt-20 border-t-4 border-yellow-400 pt-12 animate-fade-in">
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-stone-900 p-4 rounded-2xl"><Icon name="cart" className="w-8 h-8 text-yellow-400" /></div>
                  <h3 className="text-4xl font-black text-stone-900 tracking-tighter italic uppercase">AI Smart Picks</h3>
                </div>
                <div className="flex gap-8 overflow-x-auto pb-8 snap-x no-scrollbar">
                  {aiRecommendations.map((rec, idx) => {
                    const recProduct = PRODUCTS.find(p => p.name === rec.productName || p.englishName === rec.productName);
                    if (!recProduct) return null;
                    return (
                      <div
                        key={idx}
                        onClick={() => setActiveProduct(recProduct)}
                        className="bg-yellow-50 min-w-[500px] p-8 rounded-[3rem] shadow-xl border-4 border-yellow-100 flex gap-8 snap-center hover:scale-[1.02] transition-transform cursor-pointer"
                      >
                        <ProductImage src={recProduct.image} alt={recProduct.name} className="w-32 h-32 rounded-[2rem] object-cover shadow-lg" />
                        <div className="flex-1">
                          <h4 className="text-2xl font-black text-stone-900">{recProduct.name}</h4>
                          <p className="text-lg text-stone-600 font-medium italic mt-2">"{rec.reason}"</p>
                          <p className="text-2xl font-black text-yellow-600 mt-4">{formatPrice(recProduct.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>

        <footer className="bg-stone-900 p-10 flex items-center justify-between shadow-2xl z-30">
          <div className="flex items-center gap-12">
            <div className="relative bg-white/10 p-6 rounded-3xl">
              <Icon name="cart" className="w-12 h-12 text-yellow-400" />
              {cart.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-yellow-400 text-stone-900 w-10 h-10 flex items-center justify-center rounded-full text-xl font-black ring-4 ring-stone-900 animate-bounce-short">
                  {cart.length}
                </span>
              )}
            </div>
            <div>
              <p className="text-white/40 font-black text-sm uppercase tracking-[0.2em] mb-1">Current Order</p>
              <p className="text-6xl font-black text-yellow-400 tracking-tighter italic">{formatPrice(cartTotal)}</p>
            </div>
          </div>

          <div className="flex gap-6">
            <button
              onClick={resetOrder}
              className="px-10 py-6 rounded-2xl text-2xl font-black text-white/50 uppercase tracking-widest hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={cart.length === 0}
              onClick={() => setStep(KioskStep.CHECKOUT)}
              className={`px-24 py-6 rounded-[2rem] text-3xl font-black transition-all duration-300 flex items-center gap-4 ${cart.length > 0 ? 'bg-yellow-400 text-stone-900 shadow-[0_0_50px_rgba(253,208,0,0.3)] hover:scale-105 active:scale-95' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}`}
            >
              PROCEED TO CHECKOUT
              <Icon name="chevronLeft" className="w-8 h-8 rotate-180" />
            </button>
          </div>
        </footer>
      </div>
    );
  };

  const CustomizationModal = () => {
    if (!activeProduct) return null;

    const [size, setSize] = useState('Medium');
    const [milk, setMilk] = useState('Normal');
    const [sweetness, setSweetness] = useState('100% (Standard)');
    const [selectedAddOns, setSelectedAddOns] = useState<any[]>([]);
    const [temp, setTemp] = useState<'HOT' | 'ICE'>(activeProduct.temperature === 'HOT' ? 'HOT' : 'ICE');

    const sizePrice = SIZES.find(s => s.name === size)?.upcharge || 0;
    const addOnsPrice = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    const totalItemPrice = activeProduct.price + sizePrice + addOnsPrice;

    return (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-900/80 backdrop-blur-md animate-fade-in">
        <div className="bg-white w-full max-w-5xl rounded-t-[4rem] p-16 flex flex-col gap-12 shadow-2xl animate-slide-up max-h-[95vh] overflow-y-auto">
          <div className="flex justify-between items-start">
            <div className="flex gap-10">
              <div className="relative">
                <ProductImage src={activeProduct.image} alt={activeProduct.name} className="w-56 h-56 rounded-[3rem] object-cover shadow-2xl ring-8 ring-stone-50" />
                <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl ${temp === 'ICE' ? 'bg-blue-500' : 'bg-red-500'}`}>
                  {temp === 'ICE' ? '🧊' : '🔥'}
                </div>
              </div>
              <div>
                <h2 className="text-6xl font-black text-stone-900 mb-2 tracking-tighter leading-tight">{activeProduct.name}</h2>
                <p className="text-2xl text-stone-400 font-bold uppercase tracking-tight mb-4">{activeProduct.englishName}</p>
                <p className="text-xl text-stone-500 leading-relaxed max-w-xl">{activeProduct.description}</p>
                <div className="mt-6 inline-flex gap-4">
                  <span className="bg-stone-100 px-6 py-2 rounded-xl text-lg font-black text-stone-600">{activeProduct.volume || 'Mega Size'}</span>
                  <span className="bg-stone-100 px-6 py-2 rounded-xl text-lg font-black text-stone-600 tracking-widest">{activeProduct.calories} CAL</span>
                </div>
              </div>
            </div>
            <button onClick={() => setActiveProduct(null)} className="bg-stone-100 p-6 rounded-full hover:bg-stone-200 transition-colors">
              <Icon name="x" className="w-10 h-10 text-stone-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-16">
            {activeProduct.temperature === 'BOTH' && (
              <section>
                <h3 className="text-3xl font-black text-stone-900 mb-8 flex items-center gap-4">Temperature</h3>
                <div className="grid grid-cols-2 gap-8">
                  <button onClick={() => setTemp('ICE')} className={`p-8 rounded-[2.5rem] border-4 transition-all flex items-center justify-center gap-6 ${temp === 'ICE' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-stone-100 text-stone-300'}`}>
                    <span className="text-5xl">🧊</span>
                    <span className="text-4xl font-black uppercase">Ice</span>
                  </button>
                  <button onClick={() => setTemp('HOT')} className={`p-8 rounded-[2.5rem] border-4 transition-all flex items-center justify-center gap-6 ${temp === 'HOT' ? 'border-red-500 bg-red-50 text-red-600' : 'border-stone-100 text-stone-300'}`}>
                    <span className="text-5xl">🔥</span>
                    <span className="text-4xl font-black uppercase">Hot</span>
                  </button>
                </div>
              </section>
            )}

            <section>
              <h3 className="text-3xl font-black text-stone-900 mb-8">Select Your Size</h3>
              <div className="grid grid-cols-3 gap-8">
                {SIZES.map(s => (
                  <button
                    key={s.name}
                    onClick={() => setSize(s.name)}
                    className={`p-10 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-3 ${size === s.name ? 'border-yellow-400 bg-yellow-50' : 'border-stone-100'}`}
                  >
                    <span className={`font-black ${s.name === 'Big Mega' ? 'text-6xl animate-pulse' : s.name === 'Medium' ? 'text-5xl' : 'text-4xl'}`}>🥤</span>
                    <span className="text-2xl font-black text-stone-900 uppercase">{s.name}</span>
                    <span className="text-xl font-bold text-yellow-600">+{formatPrice(s.upcharge)}</span>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-16">
              <section>
                <h3 className="text-2xl font-black text-stone-900 mb-6">Milk Choice</h3>
                <div className="flex flex-wrap gap-4">
                  {MILK_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setMilk(opt)}
                      className={`px-8 py-4 rounded-2xl border-2 transition-all font-black text-xl ${milk === opt ? 'bg-stone-900 text-yellow-400 border-stone-900 shadow-xl' : 'bg-white text-stone-400 border-stone-100'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-2xl font-black text-stone-900 mb-6">Sweetness</h3>
                <div className="flex flex-wrap gap-4">
                  {SWEETNESS_LEVELS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setSweetness(opt)}
                      className={`px-8 py-4 rounded-2xl border-2 transition-all font-black text-xl ${sweetness === opt ? 'bg-stone-900 text-yellow-400 border-stone-900 shadow-xl' : 'bg-white text-stone-400 border-stone-100'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <section>
              <h3 className="text-2xl font-black text-stone-900 mb-8">Add Extra Flavor</h3>
              <div className="grid grid-cols-2 gap-6">
                {ADD_ONS.map(opt => {
                  const isSelected = selectedAddOns.find(a => a.id === opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedAddOns(prev => prev.filter(a => a.id !== opt.id));
                        } else {
                          setSelectedAddOns(prev => [...prev, opt]);
                        }
                      }}
                      className={`p-8 rounded-[2rem] border-4 transition-all flex justify-between items-center ${isSelected ? 'border-yellow-400 bg-yellow-50' : 'border-stone-100'}`}
                    >
                      <div className="text-left">
                        <p className="text-2xl font-black text-stone-900">{opt.name}</p>
                        <p className="text-xl font-bold text-yellow-600">+{formatPrice(opt.price)}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-yellow-400' : 'bg-stone-100'}`}>
                        {isSelected && <Icon name="check" className="w-6 h-6 text-stone-900" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="mt-12 flex gap-8 pt-12 border-t border-stone-100 sticky bottom-0 bg-white">
            <div className="flex-1 flex flex-col justify-center">
              <span className="text-stone-300 text-xl font-black uppercase tracking-[0.3em] mb-1">Item Total</span>
              <span className="text-7xl font-black text-stone-900 tracking-tighter italic">{formatPrice(totalItemPrice)}</span>
            </div>
            <button
              onClick={() => addToCart(activeProduct, { size, milk, sweetness, addOns: selectedAddOns, temperature: temp, sizePrice })}
              className="px-24 py-10 bg-yellow-400 text-stone-900 rounded-[2.5rem] text-4xl font-black shadow-2xl hover:bg-yellow-500 transition-all active:scale-95 flex items-center gap-6"
            >
              ADD TO MY TICKET
              <Icon name="cart" className="w-10 h-10" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PaymentMethodModal = () => {
    if (!isPaymentMethodModalOpen) return null;
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/90 backdrop-blur-xl animate-fade-in px-12">
        <div className="bg-white w-full max-w-4xl rounded-[4rem] p-16 shadow-2xl animate-slide-up flex flex-col gap-12 relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-stone-900/5 rounded-full blur-3xl" />
          <div className="text-center">
            <h2 className="text-6xl font-black text-stone-900 mb-4 tracking-tighter">SELECT PAYMENT</h2>
            <p className="text-2xl text-stone-400 font-bold uppercase tracking-widest">Choose your preferred method</p>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-4">
            <button
              onClick={() => handlePaymentSelect('CARD')}
              className="group p-12 bg-stone-50 border-4 border-stone-100 rounded-[3rem] hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 flex flex-col items-center gap-8 shadow-xl active:scale-95"
            >
              <div className="w-32 h-32 bg-stone-900 rounded-[1.5rem] flex items-center justify-center group-hover:bg-yellow-400 transition-colors shadow-lg">
                <Icon name="creditCard" className="w-16 h-16 text-yellow-400 group-hover:text-stone-900" />
              </div>
              <div className="text-center">
                <span className="text-4xl font-black text-stone-900 block mb-2">Pay by card</span>
                <p className="text-lg text-stone-400 font-bold">Visa, MasterCard, etc.</p>
              </div>
            </button>
            <button
              onClick={() => handlePaymentSelect('QPAY')}
              className="group p-12 bg-stone-50 border-4 border-stone-100 rounded-[3rem] hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 flex flex-col items-center gap-8 shadow-xl active:scale-95"
            >
              <div className="w-32 h-32 bg-stone-900 rounded-[1.5rem] flex items-center justify-center group-hover:bg-yellow-400 transition-colors shadow-lg">
                <Icon name="qrCode" className="w-16 h-16 text-yellow-400 group-hover:text-stone-900" />
              </div>
              <div className="text-center">
                <span className="text-4xl font-black text-stone-900 block mb-2">Pay via QPay</span>
                <p className="text-lg text-stone-400 font-bold">Scan bank QR code</p>
              </div>
            </button>
          </div>
          <button
            onClick={() => setIsPaymentMethodModalOpen(false)}
            className="mt-4 w-full py-6 text-stone-400 font-black text-xl hover:text-stone-900 transition-colors uppercase tracking-widest"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  };

  const CheckoutView = () => (
    <div className="h-screen w-screen flex flex-col bg-stone-50 p-12 portrait:p-20 overflow-hidden font-sans">
      <div className="flex justify-between items-center mb-16">
        <button onClick={() => setStep(KioskStep.MENU)} className="bg-white p-6 rounded-3xl shadow-xl">
          <Icon name="back" className="w-10 h-10 text-stone-900" />
        </button>
        <h2 className="text-7xl font-black text-stone-900 tracking-tighter">Your Order Details</h2>
        <div className="w-20" />
      </div>
      <div className="flex-1 flex flex-col gap-10 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-6 space-y-8 no-scrollbar">
          {cart.map(item => (
            <div key={item.id} className="bg-white rounded-[3rem] p-10 flex gap-10 shadow-xl border border-stone-100 animate-fade-in">
              <div className="relative">
                <ProductImage src={item.image} alt={item.name} className="w-40 h-40 rounded-[2rem] object-cover shadow-lg" />
                <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-xl flex items-center justify-center font-black text-white shadow-lg ${item.temperature === 'ICE' ? 'bg-blue-500' : 'bg-red-500'}`}>
                  {item.temperature === 'ICE' ? '🧊' : '🔥'}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-4xl font-black text-stone-900 mb-2">{item.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-yellow-400 text-stone-900 px-4 py-1 rounded-lg text-sm font-black uppercase tracking-widest">{item.size}</span>
                      <span className="bg-stone-900 text-yellow-400 px-4 py-1 rounded-lg text-sm font-black uppercase tracking-widest">{item.customizations.milk}</span>
                    </div>
                  </div>
                  <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} className="p-4 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all">
                    <Icon name="x" className="w-8 h-8" />
                  </button>
                </div>
                <div className="mt-8 flex justify-between items-center">
                  <div className="flex items-center gap-10 bg-stone-50 rounded-2xl p-4 px-8 border-2 border-stone-100">
                    <button onClick={() => item.quantity > 1 && setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))} className="text-4xl font-black text-stone-300 hover:text-stone-900">-</button>
                    <span className="text-4xl font-black text-stone-900">{item.quantity}</span>
                    <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))} className="text-4xl font-black text-stone-300 hover:text-stone-900">+</button>
                  </div>
                  <span className="text-5xl font-black text-stone-900 italic tracking-tighter">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-10 py-32">
              <Icon name="cart" className="w-64 h-64 mb-12" />
              <p className="text-7xl font-black uppercase italic">Basket Empty</p>
            </div>
          )}
        </div>
        <div className="w-full">
          <div className="bg-stone-900 rounded-[4rem] p-12 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="flex justify-between items-center mb-10 border-b-2 border-white/10 pb-8">
              <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase">Order Summary</h3>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-white/40 uppercase tracking-[0.4em] mb-1">Final Total</span>
                <span className="text-7xl font-black text-yellow-400 italic tracking-tighter leading-none">{formatPrice(Math.round(cartTotal * 1.1))}</span>
              </div>
            </div>
            <div className="flex gap-12 items-center">
              <div className="flex-1 space-y-3">
                <div className="flex justify-between text-2xl font-bold text-white/30">
                  <span>Subtotal</span>
                  <span className="text-white/60">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-white/30">
                  <span>Tax (10%)</span>
                  <span className="text-white/60">{formatPrice(Math.round(cartTotal * 0.1))}</span>
                </div>
              </div>
              <button disabled={cart.length === 0} onClick={() => setIsPaymentMethodModalOpen(true)} className="px-20 py-8 bg-yellow-400 text-stone-900 rounded-[2.5rem] text-3xl font-black shadow-[0_20px_60px_rgba(253,208,0,0.4)] hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-6">
                MAKE PAYMENT
                <div className="w-10 h-10 bg-stone-900/10 rounded-xl flex items-center justify-center">
                  <Icon name="chevronLeft" className="w-6 h-6 rotate-180" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PaymentView = () => {
    useEffect(() => {
      const timer = setTimeout(() => setStep(KioskStep.SUCCESS), 5000);
      return () => clearTimeout(timer);
    }, []);
    const isCard = paymentMethod === 'CARD';
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white p-20 text-center font-sans overflow-hidden">
        <div className="absolute inset-0 bg-yellow-400/5 -z-10" />
        <div className="mb-24 space-y-6">
          <div className="bg-yellow-400 w-32 h-32 rounded-[2rem] flex items-center justify-center mx-auto mb-12 animate-bounce-short shadow-xl">
            <Icon name={isCard ? "creditCard" : "qrCode"} className="w-16 h-16 text-stone-900" />
          </div>
          <h2 className="text-7xl font-black text-stone-900 tracking-tighter italic uppercase">
            {isCard ? 'Waiting for card...' : 'Scan to pay'}
          </h2>
          <p className="text-3xl text-stone-400 font-bold uppercase tracking-widest">
            {isCard ? 'Please tap your card or use mobile pay' : 'Open your bank app and scan the QR code'}
          </p>
        </div>
        {isCard ? (
          <div className="relative w-96 h-[600px] bg-stone-900 rounded-[4rem] border-[12px] border-stone-800 shadow-[0_50px_100px_rgba(0,0,0,0.4)] flex flex-col items-center p-12 overflow-hidden animate-slide-up">
            <div className="w-24 h-3 bg-stone-800 rounded-full mb-16" />
            <div className="w-full bg-stone-800/50 rounded-3xl p-10 flex flex-col items-center justify-center border-2 border-white/5 h-64 shadow-inner">
              <div className="w-20 h-20 border-8 border-yellow-400 border-t-transparent rounded-full animate-spin mb-8" />
              <p className="text-yellow-400 font-black tracking-[0.3em] text-2xl animate-pulse uppercase italic">Verifying</p>
            </div>
            <div className="mt-20 w-full flex flex-col gap-6 opacity-30">
              <div className="h-4 bg-stone-700 rounded-full w-full" />
              <div className="h-4 bg-stone-700 rounded-full w-3/4" />
            </div>
            <div className="absolute bottom-16 flex gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12">
            <div className="bg-white p-12 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.1)] border-8 border-stone-50 animate-fade-in">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MEGACOFFEE_ORDER_123&bgcolor=ffffff&color=231f20" className="w-80 h-80 rounded-2xl grayscale contrast-125" alt="Payment QR" />
            </div>
            <div className="bg-stone-900 text-yellow-400 px-12 py-6 rounded-full text-4xl font-black italic tracking-tighter shadow-xl animate-pulse">
              {formatPrice(Math.round(cartTotal * 1.1))}
            </div>
          </div>
        )}
        <div className="mt-24 flex gap-12 items-center opacity-40">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-8 object-contain" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/MasterCard_Logo.svg/2560px-MasterCard_Logo.svg.png" className="h-12 object-contain" />
        </div>
        <button onClick={() => setStep(KioskStep.CHECKOUT)} className="mt-16 text-stone-300 font-black uppercase tracking-widest text-xl hover:text-stone-900">Cancel Payment</button>
      </div>
    );
  };

  const SuccessView = () => {
    const orderNum = useMemo(() => Math.floor(Math.random() * 900) + 100, []);
    useEffect(() => {
      const timer = setTimeout(() => resetOrder(), 15000);
      return () => clearTimeout(timer);
    }, []);
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-yellow-400 text-stone-900 p-12 text-center animate-fade-in font-sans">
        <div className="bg-stone-900 p-16 rounded-[4rem] mb-16 shadow-2xl scale-110">
          <Icon name="check" className="w-48 h-48 text-yellow-400" />
        </div>
        <h1 className="text-9xl font-black mb-6 tracking-tighter italic">YEAH! MEGA ORDER!</h1>
        <p className="text-4xl font-bold mb-24 opacity-80 uppercase tracking-tight">Your fresh coffee is being prepared now.</p>
        <div className="bg-white text-stone-900 p-20 rounded-[5rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] w-full max-w-2xl transform hover:scale-[1.02] transition-transform">
          <p className="text-stone-300 font-black uppercase tracking-[0.5em] mb-8 text-2xl">Your Ticket Number</p>
          <div className="text-[15rem] font-black leading-none mb-12 tracking-tighter italic text-stone-900">#{orderNum}</div>
          <div className="border-t-8 border-dotted border-stone-50 pt-12">
            <p className="text-3xl text-stone-400 font-bold mb-12">Grab your receipt below!</p>
            <button onClick={resetOrder} className="w-full py-10 bg-stone-900 text-yellow-400 rounded-[3rem] text-4xl font-black shadow-2xl hover:scale-95 transition-all">CLOSE & FINISH</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden select-none">
      {step === KioskStep.WELCOME && <WelcomeView />}
      {step === KioskStep.ORDER_TYPE && <OrderTypeView />}
      {step === KioskStep.MENU && <MenuView />}
      {step === KioskStep.CHECKOUT && <CheckoutView />}
      {step === KioskStep.PAYMENT && <PaymentView />}
      {step === KioskStep.SUCCESS && <SuccessView />}
      {activeProduct && <CustomizationModal />}
      <PaymentMethodModal />
      {isHelpOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xl" onClick={() => setIsHelpOpen(false)} />
          <div className="relative w-[600px] h-screen bg-white shadow-[-50px_0_100px_rgba(0,0,0,0.2)] flex flex-col p-16 animate-slide-left rounded-l-[4rem]">
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-6">
                <div className="bg-yellow-400 p-4 rounded-2xl shadow-lg"><Icon name="help" className="w-10 h-10 text-stone-900" /></div>
                <h2 className="text-5xl font-black text-stone-900 tracking-tighter italic uppercase">AI Assistant</h2>
              </div>
              <button onClick={() => setIsHelpOpen(false)} className="bg-stone-50 p-6 rounded-full"><Icon name="x" className="w-8 h-8 text-stone-300" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-10 pr-4 pb-12 no-scrollbar">
              <div className="bg-stone-50 p-10 rounded-[3rem] text-3xl text-stone-800 font-bold leading-relaxed border-2 border-stone-100 shadow-sm italic">
                "Big size, Great taste! How can I help you customize your Mega Coffee experience today?"
              </div>
              {helpResponse && (
                <div className="bg-yellow-50 p-10 rounded-[3rem] border-4 border-yellow-200 text-3xl text-stone-900 animate-fade-in shadow-xl leading-relaxed font-black tracking-tight">
                  <div className="flex items-center gap-4 mb-6 text-sm font-black text-yellow-600 uppercase tracking-[0.3em]">Mega AI Barista</div>
                  {helpResponse}
                </div>
              )}
              {isAIProcessing && (
                <div className="flex justify-center py-20"><div className="w-16 h-16 border-8 border-yellow-400 border-t-transparent rounded-full animate-spin" /></div>
              )}
            </div>
            <form onSubmit={handleHelpSubmit} className="mt-auto pt-12 border-t border-stone-100">
              <div className="relative">
                <input type="text" value={helpQuery} onChange={(e) => setHelpQuery(e.target.value)} placeholder="Ask about caffeine, calories, or recipes..." className="w-full p-10 pr-24 bg-stone-50 rounded-[3rem] text-2xl font-black text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-8 focus:ring-yellow-400/20 border-2 border-stone-100 transition-all" />
                <button type="submit" disabled={isAIProcessing || !helpQuery.trim()} className="absolute right-6 top-1/2 -translate-y-1/2 bg-stone-900 text-yellow-400 p-5 rounded-[2rem] shadow-2xl disabled:opacity-20 transition-all">
                  <Icon name="chevronLeft" className="w-8 h-8 rotate-180" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slide-left { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce-short { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-slide-left { animation: slide-left 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-bounce-short { animation: bounce-short 1s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
