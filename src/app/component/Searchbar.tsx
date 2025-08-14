'use client';

import { useState, useEffect, useCallback, ChangeEvent, useMemo } from 'react';
import Image from 'next/image';

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Properly typed debounce function
  const debounce = <T extends unknown[]>(func: (...args: T) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // API call function with proper typing
  const fetchSearchResults = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(searchTerm)}&limit=5`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setResults(data.products || []);
      setIsDropdownOpen(true);
    } catch (err) {
      setError('Error fetching results. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memoized debounced fetch function
  const debouncedFetch = useMemo(() => {
    return debounce((searchTerm: string) => {
      fetchSearchResults(searchTerm);
    }, 1000);
  }, [fetchSearchResults]);

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetch(value);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search products..."
          className="w-full p-4 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search products"
          aria-expanded={isDropdownOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {isDropdownOpen && (results.length > 0 || error) && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : (
            <ul role="listbox" className="divide-y divide-gray-100">
              {results.map((product) => (
                <li 
                  key={product.id}
                  role="option"
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setQuery(product.title);
                    setIsDropdownOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0">
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover rounded"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{product.title}</h3>
                      <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export { SearchBar };
