// components/ProductList.tsx
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
  const productsPerPage = 10;
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchProducts = useCallback(
    async (page: number) => {
      setLoading(true);
      try {
        const skip = (page - 1) * productsPerPage;
        const response = await fetch(
          `https://dummyjson.com/products?limit=${productsPerPage}&skip=${skip}`
        );
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products);
        setTotalPages(Math.ceil(data.total / productsPerPage));

        const params = new URLSearchParams(searchParams.toString());
        params.set('page', page.toString());
        router.replace(`?${params.toString()}`, { scroll: false });
      } catch (error: unknown) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    },
    [productsPerPage, router, searchParams]
  );

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(page);
    fetchProducts(page);
  }, [searchParams, fetchProducts]);

  const paginationHandlers = useMemo(
    () => ({
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
    }),
    [currentPage, totalPages, fetchProducts]
  );

  return (
    <>
      {/* ... आपका existing JSX कोड यहाँ ... */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            aria-label="Loading"
          />
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
                  <h2
                    id={`product-${product.id}-title`}
                    className="text-lg font-semibold text-gray-900 truncate mb-1"
                  >
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

          <nav
            aria-label="Product pagination"
            className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10"
          >
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
        </>
      )}
    </>
  );
}