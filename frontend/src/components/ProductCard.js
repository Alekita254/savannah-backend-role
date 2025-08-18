import React from 'react';
import { Link } from 'react-router-dom';
import { addToCart } from '../services/apiService';

const ProductCard = ({ product }) => {
  const handleAddToCart = async (e) => {
    e.preventDefault();
    try {
      await addToCart(product.id);
      alert(`${product.name} added to cart!`);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`}>
        <div className="product-image-container">
          <img 
            src={product.image} 
            alt={product.name} 
            onError={(e) => {
              e.target.src = '/placeholder-product.png';
            }}
          />
        </div>
        <div className="product-info">
          <h3>{product.name}</h3>
          <div className="price">KES {parseFloat(product.price).toFixed(2)}</div>
          <div className="categories">
            {product.categories.map(cat => (
              <span key={cat.id} className="category-tag">{cat.name}</span>
            ))}
          </div>
          <p className="description">{product.description.substring(0, 60)}...</p>
          <div className="stock-status">
            {product.available ? (
              <span className="in-stock">In Stock ({product.stock})</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>
        </div>
      </Link>
      <div className="product-actions">
        <button 
          onClick={handleAddToCart} 
          disabled={!product.available}
          className="add-to-cart-btn"
        >
          Add to Cart
        </button>
        <button 
          disabled={!product.available}
          className="buy-now-btn"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;