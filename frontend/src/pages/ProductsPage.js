import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../services/apiService';
import ProductCard from '../components/ProductCard';
import {
  Box,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Collapse
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const ProductsPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCategories, setOpenCategories] = useState({});

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

  const handleCategoryClick = (categoryId) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={3}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Paper elevation={3} sx={{ width: 250, mr: 3, flexShrink: 0 }}>
        <Box p={2}>
          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/products">
                <ListItemText primary="All Products" />
              </ListItemButton>
            </ListItem>
            {categories.map(category => (
              <React.Fragment key={category.id}>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleCategoryClick(category.id)}
                    component={category.children.length > 0 ? 'div' : Link}
                    to={category.children.length === 0 ? `/products/category/${category.id}` : undefined}
                  >
                    <ListItemText primary={category.name} />
                    {category.children.length > 0 && (
                      openCategories[category.id] ? <ExpandLess /> : <ExpandMore />
                    )}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openCategories[category.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {category.children.map(child => (
                      <ListItem key={child.id} disablePadding sx={{ pl: 4 }}>
                        <ListItemButton component={Link} to={`/products/category/${child.id}`}>
                          <ListItemText primary={child.name} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Paper>

      <Box sx={{ flexGrow: 1 }}>
        {products.length > 0 ? (
          <Grid container spacing={3}>
            {products.map(product => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6">
              No products found in this category
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ProductsPage;