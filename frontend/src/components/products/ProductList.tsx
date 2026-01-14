import React from 'react'

import type { Product } from '@/types/product.types'
import ProductCard from './ProductCard'
import styles from './ProductList.module.css'

interface ProductListProps {
  products: Product[]
  isLoading?: boolean
}

const ProductList: React.FC<ProductListProps> = ({ products, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No products found matching your criteria.</p>
        <p className={styles.emptySubtext}>Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductList
