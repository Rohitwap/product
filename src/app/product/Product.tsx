'use client';

import { useState, useEffect } from 'react';
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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const productsPerPage = 10;
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchProducts = async (page: number) => {
    setLoading(true);
    try {
      const skip = (page - 1) * productsPerPage;
      const response = await fetch(
        `https://dummyjson.com/products?limit=${productsPerPage}&skip=${skip}`
      );
      const data = await response.json();
      setProducts(data.products);
      setTotalPages(Math.ceil(data.total / productsPerPage));
      
      // Update URL without page reload
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', page.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1');
    setCurrentPage(page);
    fetchProducts(page);
  }, []);

  const handleNext = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchProducts(nextPage);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchProducts(prevPage);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
          Product Listing
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold text-gray-900 truncate mb-1">
                      {product.title}
                    </h2>
                    <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
                    <div className="flex items-center">
                      <span className="text-yellow-500">★ {product.rating}</span>
                      <span className="text-gray-400 ml-2 text-sm">
                        ({product.stock} in stock)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
              <button
                onClick={handlePrevious}
                disabled={currentPage <= 1}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentPage > 1
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              
              <span className="text-gray-700 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={handleNext}
                disabled={currentPage >= totalPages}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentPage < totalPages
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}