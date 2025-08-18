import React, { useState, useEffect } from 'react';
import { fetchOrders } from '../services/apiService';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Button
} from '@mui/material';
import OrderCard from '../components/OrderCard';
import RefreshIcon from '@mui/icons-material/Refresh';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await fetchOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box p={3}>
      <Alert severity="error">{error}</Alert>
      <Button 
        variant="outlined" 
        startIcon={<RefreshIcon />} 
        onClick={loadOrders}
        sx={{ mt: 2 }}
      >
        Try Again
      </Button>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Orders
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {orders.length} order{orders.length !== 1 ? 's' : ''} placed
        </Typography>
      </Paper>

      {orders.length > 0 ? (
        orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))
      ) : (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You haven't placed any orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            When you place an order, it will appear here
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            href="/products"
          >
            Browse Products
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default OrdersPage;