import SearchBar from './component/Searchbar'; 
import Product from './product/Product';
import { Suspense } from 'react';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Product Search</h1>
        <SearchBar />
        <Suspense fallback={<div className="text-center py-8">Loading products...</div>}>
          <Product />
        </Suspense>
      </div>
    </main>
  );
}