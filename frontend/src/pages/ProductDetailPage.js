import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById, addToCart } from '../services/apiService';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const productData = await fetchProductById(productId);
        setProduct(productData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      alert(`${quantity} ${product.name}(s) added to cart!`);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="loading">Loading product details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!product) return <div className="not-found">Product not found</div>;

  return (
    <div className="product-detail">
      <div className="product-images">
        <img 
          src={product.image} 
          alt={product.name} 
          onError={(e) => {
            e.target.src = '/placeholder-product.png'; // fallback image
          }}
        />
      </div>
      <div className="product-info">
        <h1>{product.name}</h1>
        <div className="price">KES{parseFloat(product.price).toFixed(2)}</div>
        <div className="categories">
          {product.categories.map(cat => (
            <span key={cat.id} className="category-tag">{cat.name}</span>
          ))}
        </div>
        <p className="description">{product.description}</p>
        
        <div className="stock-status">
          {product.available ? (
            <span className="in-stock">In Stock ({product.stock} available)</span>
          ) : (
            <span className="out-of-stock">Currently Out of Stock</span>
          )}
        </div>

        {product.available && (
          <div className="product-actions">
            <div className="quantity-selector">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </button>
            </div>
            <button 
              onClick={handleAddToCart}
              className="add-to-cart-btn"
            >
              Add to Cart
            </button>
            <button className="buy-now-btn">
              Buy Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;