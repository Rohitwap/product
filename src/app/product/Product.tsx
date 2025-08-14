'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  description: string;
  rating: number;
  stock: number;
  brand: string;
  category: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const productsPerPage = 10;
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchProducts = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * productsPerPage;
      const response = await fetch(
        `https://dummyjson.com/products?limit=${productsPerPage}&skip=${skip}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setTotalPages(Math.ceil(data.total / productsPerPage));
      
      // Update URL without page reload
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [productsPerPage, router, searchParams]);

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
    fetchProducts(page);
  }, [searchParams, fetchProducts]);

  const paginationHandlers = useMemo(() => ({
    handleNext: () => {
      if (currentPage < totalPages) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchProducts(nextPage);
      }
    },
    handlePrevious: () => {
      if (currentPage > 1) {
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        fetchProducts(prevPage);
      }
    }
  }), [currentPage, totalPages, fetchProducts]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchProducts(currentPage)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          Product Listing
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <article 
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  aria-labelledby={`product-${product.id}-title`}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={product.thumbnail}
                      alt={`Thumbnail for ${product.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 4}
                      unoptimized={process.env.NODE_ENV !== 'production'}
                    />
                  </div>
                  <div className="p-4">
                    <h2 id={`product-${product.id}-title`} className="text-lg font-semibold text-gray-900 truncate mb-1">
                      {product.title}
                    </h2>
                    <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★ {product.rating.toFixed(1)}</span>
                      <span className="text-gray-400 ml-2 text-sm">
                        ({product.stock} in stock)
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {products.length > 0 && (
              <nav aria-label="Product pagination" className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
                <button
                  onClick={paginationHandlers.handlePrevious}
                  disabled={currentPage <= 1}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentPage > 1
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  Previous
                </button>
                
                <span className="text-gray-700 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={paginationHandlers.handleNext}
                  disabled={currentPage >= totalPages}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    currentPage < totalPages
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  aria-disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}