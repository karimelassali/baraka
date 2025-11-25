"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Tag } from 'lucide-react';

export default function CategoriesSection() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const locale = useLocale();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`/api/categories?locale=${locale}`);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, [locale]);

    if (loading || categories.length === 0) {
        return null; // Don't show anything if loading or no categories
    }

    return (
        <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 mb-6">
                    <Tag className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-gray-800">Browse by Category</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                    {categories.map((category, index) => (
                        <motion.button
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-primary/50 hover:text-primary transition-all text-sm font-medium text-gray-700"
                        >
                            {category.name}
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
}
