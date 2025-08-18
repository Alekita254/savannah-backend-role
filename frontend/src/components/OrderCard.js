import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar
} from '@mui/material';
import { format } from 'date-fns';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const statusMap = {
  'P': { label: 'Processing', color: 'warning' },
  'S': { label: 'Shipped', color: 'info' },
  'D': { label: 'Delivered', color: 'success' },
  'C': { label: 'Cancelled', color: 'error' }
};

const OrderCard = ({ order }) => {
  const orderDate = new Date(order.created_at);
  const statusInfo = statusMap[order.status] || { label: 'Unknown', color: 'default' };

  return (
    <Card elevation={3} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingBagIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Order #{order.id}
            </Typography>
          </Box>
          <Box>
            <Chip 
              label={statusInfo.label} 
              color={statusInfo.color} 
              size="small" 
              variant="outlined"
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {format(orderDate, 'MMMM do, yyyy - h:mm a')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Shipping to: {order.shipping_address}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={item.product.image}
                        alt={item.product.name}
                        sx={{ width: 40, height: 40, mr: 2 }}
                      />
                      <Typography variant="body2">
                        {item.product.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    KES {parseFloat(item.price).toFixed(2)}
                  </TableCell>
                  <TableCell align="right">
                    {item.quantity}
                  </TableCell>
                  <TableCell align="right">
                    KES {(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="h6">
            Order Total: KES {parseFloat(order.total).toFixed(2)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
