import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Button, 
  TextField,
  Divider,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { Link } from 'react-router-dom';
import { 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  checkoutCart 
} from '../services/apiService';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const cartData = await getCart();
        setCart(cartData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      const updatedCart = await updateCartItem(itemId, newQuantity);
      setCart(updatedCart);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      const updatedCart = await removeCartItem(itemId);
      setCart(updatedCart);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      // In a real app, you would collect shipping info first
      const shippingInfo = {
        shipping_address: "123 Main St",
        shipping_city: "Nairobi",
        shipping_country: "Kenya",
        payment_method: "M-Pesa"
      };
      const order = await checkoutCart(shippingInfo);
      alert(`Order #${order.id} placed successfully!`);
      setCart(null); // Clear cart after successful checkout
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
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

  if (!cart || cart.items.length === 0) return (
    <Box p={3} textAlign="center">
      <Typography variant="h5" gutterBottom>
        Your cart is empty
      </Typography>
      <Button 
        component={Link} 
        to="/products" 
        variant="contained" 
        color="primary"
      >
        Continue Shopping
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src={item.product.image}
                          alt={item.product.name}
                          sx={{ width: 60, height: 60, objectFit: 'contain', mr: 2 }}
                        />
                        <Typography>{item.product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      KES {parseFloat(item.product.price).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton 
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={updatingItems[item.id] || item.quantity <= 1}
                          size="small"
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={updatingItems[item.id] ? '...' : item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 1;
                            handleQuantityChange(item.id, value);
                          }}
                          inputProps={{
                            style: { 
                              textAlign: 'center', 
                              width: 50,
                              padding: '6px'
                            }
                          }}
                          variant="outlined"
                          size="small"
                          disabled={updatingItems[item.id]}
                        />
                        <IconButton 
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={updatingItems[item.id]}
                          size="small"
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      KES {parseFloat(item.subtotal).toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingItems[item.id]}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Subtotal:</Typography>
              <Typography>KES {parseFloat(cart.total).toFixed(2)}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Shipping:</Typography>
              <Typography>KES 0.00</Typography> {/* Adjust as needed */}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">KES {parseFloat(cart.total).toFixed(2)}</Typography>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<ShoppingCartCheckoutIcon />}
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;
