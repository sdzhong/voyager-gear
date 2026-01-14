import { createBrowserRouter } from 'react-router'

import Layout from './components/Layout/Layout'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Notfound from './pages/Notfound'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Index />
      </Layout>
    ),
  },
  {
    path: '/login',
    element: (
      <Layout>
        <Login />
      </Layout>
    ),
  },
  {
    path: '/register',
    element: (
      <Layout>
        <Register />
      </Layout>
    ),
  },
  {
    path: '/account',
    element: (
      <ProtectedRoute>
        <Layout>
          <Account />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/products',
    element: (
      <Layout>
        <Products />
      </Layout>
    ),
  },
  {
    path: '/products/:id',
    element: (
      <Layout>
        <ProductDetail />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <Notfound />
      </Layout>
    ),
  },
])

export default router
