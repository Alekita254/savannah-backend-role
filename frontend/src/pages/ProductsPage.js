import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/apiService';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(categoryId),
          fetchCategories()
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="products-page">
      <div className="sidebar">
        <h3>Categories</h3>
        <ul className="category-list">
          <li>
            <a href="/products">All Products</a>
          </li>
          {categories.map(category => (
            <li key={category.id}>
              <a href={`/products/category/${category.id}`}>{category.name}</a>
              {category.children.length > 0 && (
                <ul>
                  {category.children.map(child => (
                    <li key={child.id}>
                      <a href={`/products/category/${child.id}`}>{child.name}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="products-grid">
        {products.length > 0 ? (
          products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="no-products">No products found in this category</div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;