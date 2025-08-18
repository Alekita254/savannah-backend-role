import React from 'react';
import { Link } from 'react-router-dom';
import { addToCart } from '../services/apiService';
import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  IconButton
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';

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
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} to={`/products/${product.id}`}>
        <CardMedia
          component="img"
          height="200"
          image={product.image}
          alt={product.name}
          // onError={(e) => {
          //   e.target.src = '/placeholder-product.png';
          // }}
          // sx={{
          //   objectFit: 'contain',
          //   p: 1,
          //   backgroundColor: '#f5f5f5'
          // }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h3" noWrap>
            {product.name}
          </Typography>
          
          <Typography variant="h6" color="primary" gutterBottom>
            KES {parseFloat(product.price).toFixed(2)}
          </Typography>
          
          <Box sx={{ mb: 1 }}>
            {product.categories.slice(0, 2).map(cat => (
              <Chip
                key={cat.id}
                label={cat.name}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {product.categories.length > 2 && (
              <Chip label={`+${product.categories.length - 2}`} size="small" />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {product.description.substring(0, 80)}...
          </Typography>
          
          <Typography 
            variant="body2" 
            color={product.available ? 'success.main' : 'error'}
          >
            {product.available ? `In Stock (${product.stock})` : 'Out of Stock'}
          </Typography>
        </CardContent>
      </CardActionArea>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          size="small"
          color="primary"
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={!product.available}
        >
          Add
        </Button>
        <Button
          size="small"
          color="secondary"
          startIcon={<FlashOnIcon />}
          disabled={!product.available}
        >
          Buy
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;