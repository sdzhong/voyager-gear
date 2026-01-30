import React, { useState, useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary'
import router from './router'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import SentryTest from './pages/SentryTest'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import MiniCart from './components/cart/MiniCart'
import { productService } from './services/product.service'
import type { Product } from './types/product.types'


const PRODUCTS = [
  { id: 1, name: "Sahara Duffel Bag", price: 120.00, category: "Popular", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600" },
  { id: 2, name: "Titanium Trekking Poles", price: 85.00, category: "New", img: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&w=600" },
  { id: 3, name: "Solar Power Bank", price: 45.00, category: "Discounted", img: "https://images.unsplash.com/photo-1617576621334-92718104863e?auto=format&fit=crop&w=600" },
];

const Navigation = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav style={{ display: 'flex', gap: '20px', padding: '1.5rem', background: '#2c3e50', color: 'white', alignItems: 'center' }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>VOYAGER</Link>
      <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Products</Link>
      <Link to="/search" style={{ color: 'white', textDecoration: 'none' }}>Search</Link>
      {isAuthenticated && <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>Orders</Link>}

      {/* User Account and Cart Icons */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mini Cart */}
        <MiniCart />

        {/* User Account */}
        {isAuthenticated && user ? (
          <Link to="/account" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{user.username}</span>
          </Link>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#3498db', borderRadius: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

const Hero = () => (
  <section>
    <img
      src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=4000"
      alt="Adventure"
      style={{ width: '100%', objectFit: 'cover' }}
    />
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Gear Up for the Unknown</h1>
    </div>
  </section>
);

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await productService.getProducts({ search: query, page_size: 20 });
        setResults(response.products);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchProducts();
  }, [query]);

  return (
    <div style={{ padding: '40px' }}>
      <h2>Search Inventory</h2>
      <input
        type="text"
        placeholder="Type to search..."
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: '12px', width: '100%', maxWidth: '400px', fontSize: '16px' }}
      />
       {isSearching && <div style={{ marginTop: '10px', color: '#666' }}>Searching...</div>}
       <div style={{ marginTop: '20px' }}>
         {results.map(p => (
           <Link 
             key={p.id} 
             to={`/products/${p.id}`}
             style={{ 
               display: 'block',
               padding: '10px', 
               borderBottom: '1px solid #eee',
               textDecoration: 'none',
               color: 'inherit',
               transition: 'background-color 0.2s'
             }}
             onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
             onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
           >
             <div style={{ fontWeight: 'bold' }}>{p.name}</div>
             <div style={{ fontSize: '14px', color: '#666' }}>${p.price.toFixed(2)}</div>
           </Link>
         ))}
       </div>
    </div>
  );
};


export default function VoyagerApp() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<><Hero />{/* Render product list here */}</>} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/sentry-test" element={<SentryTest />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}