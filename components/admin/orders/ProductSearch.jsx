import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Package } from 'lucide-react';

export default function ProductSearch({ value, onChange }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const [isFocused, setIsFocused] = useState(false);

    const wrapperRef = useRef(null);
    const inputRef = useRef(null);
    const justSelected = useRef(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                // Check if click is inside the portal
                const portal = document.getElementById('product-search-portal');
                if (portal && portal.contains(event.target)) return;

                setShowResults(false);
            }
        };

        const updateCoords = () => {
            if (inputRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', updateCoords, true);
        window.addEventListener('resize', updateCoords);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, []);

    useEffect(() => {
        if (showResults && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    }, [showResults]);

    useEffect(() => {
        // Don't search if the input is not focused (prevents search on page load)
        if (!isFocused) return;

        const timer = setTimeout(async () => {
            if (justSelected.current) {
                justSelected.current = false;
                return;
            }

            if (value && value.length >= 1) {
                setLoading(true);
                try {
                    const res = await fetch(`/api/admin/inventory/products?search=${encodeURIComponent(value)}&limit=5`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data.products || []);
                        setShowResults(true);
                    }
                } catch (error) {
                    console.error("Search error", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value, isFocused]);

    const handleSelect = (product) => {
        justSelected.current = true;
        onChange(product.name);
        setShowResults(false);
        setIsFocused(false);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        if (value && value.length >= 1 && results.length > 0) {
                            setShowResults(true);
                        }
                    }}
                    onBlur={() => {
                        // Small delay or just set false. 
                        // Since handleClickOutside handles closing the dropdown, 
                        // this mainly serves to stop the search trigger.
                        setIsFocused(false);
                    }}
                    placeholder="Product name..."
                    className="w-full px-3 py-2 bg-transparent border border-transparent hover:border-gray-200 focus:border-black rounded-md transition-all outline-none font-medium pr-8"
                />
                {loading && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <Loader2 className="animate-spin text-gray-400" size={14} />
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && typeof document !== 'undefined' && createPortal(
                <div
                    id="product-search-portal"
                    className="fixed z-[9999] bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 overflow-auto min-w-[250px]"
                    style={{
                        top: coords.top - window.scrollY, // Correct for fixed position
                        left: coords.left - window.scrollX, // Correct for fixed position
                        width: coords.width
                    }}
                >
                    {results.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => handleSelect(product)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <Package size={16} />
                            </div>
                            <div>
                                <p className="font-medium text-sm text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">
                                    {product.sku ? `SKU: ${product.sku}` : ''}
                                    {product.quantity ? ` • Stock: ${product.quantity}` : ''}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}
