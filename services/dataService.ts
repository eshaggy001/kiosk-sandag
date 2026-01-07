
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';

export const dataService = {
    async getInitialData() {
        try {
            const [
                { data: products, error: productsError },
                { data: categories, error: categoriesError },
                { data: sizes, error: sizesError },
                { data: milkOptions, error: milkError },
                { data: sweetnessLevels, error: sweetnessError },
                { data: addOns, error: addOnsError }
            ] = await Promise.all([
                supabase.from('products').select('*'),
                supabase.from('categories').select('*'),
                supabase.from('sizes').select('*'),
                supabase.from('milk_options').select('*'),
                supabase.from('sweetness_levels').select('*'),
                supabase.from('add_ons').select('*')
            ]);

            if (productsError) throw productsError;
            if (categoriesError) throw categoriesError;
            if (sizesError) throw sizesError;
            if (milkError) throw milkError;
            if (sweetnessError) throw sweetnessError;
            if (addOnsError) throw addOnsError;

            // Map to application format
            const mappedProducts: Product[] = (products || []).map((p: any) => ({
                id: p.id,
                name: p.name,
                englishName: p.english_name,
                description: p.description,
                price: p.price,
                category: p.category as Category,
                image: p.image,
                calories: p.calories,
                volume: p.volume || undefined,
                temperature: p.temperature
            }));

            const mappedCategories = (categories || []).map((c: any) => ({
                name: c.name,
                icon: c.icon
            }));

            const mappedSizes = (sizes || []).map((s: any) => ({
                name: s.name,
                upcharge: s.upcharge,
                oz: s.oz
            }));

            const mappedMilkOptions = (milkOptions || []).map((m: any) => m.name);

            const mappedSweetnessLevels = (sweetnessLevels || []).map((s: any) => s.level);

            const mappedAddOns = (addOns || []).map((a: any) => ({
                id: a.id,
                name: a.name,
                price: a.price
            }));

            return {
                products: mappedProducts,
                categories: mappedCategories,
                sizes: mappedSizes,
                milkOptions: mappedMilkOptions,
                sweetnessLevels: mappedSweetnessLevels,
                addOns: mappedAddOns
            };
        } catch (error) {
            console.error('Error fetching data from Supabase:', error);
            return null;
        }
    }
};
