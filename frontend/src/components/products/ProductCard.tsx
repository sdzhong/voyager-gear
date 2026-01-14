import React from 'react'
import { Link } from 'react-router-dom'

import type { Product } from '@/types/product.types'
import styles from './ProductCard.module.css'

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={product.image_url}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        {product.stock === 0 && (
          <div className={styles.outOfStock}>Out of Stock</div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.category}>{formatCategory(product.category)}</div>
        <h3 className={styles.title}>{product.name}</h3>
        <p className={styles.description}>
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </p>
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          {product.stock > 0 && product.stock < 10 && (
            <span className={styles.lowStock}>Only {product.stock} left</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
