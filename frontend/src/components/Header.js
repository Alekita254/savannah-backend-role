import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Box,
  Avatar,
  ListItemIcon,
  ListItemText,
  Collapse,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  ShoppingCart,
  Person,
  Home,
  ShoppingBasket,
  Category,
  ExitToApp,
  Favorite,
  ExpandMore,
  ExpandLess
} from "@mui/icons-material";
import { useUser } from "../context/UserContext";
import { fetchCategories } from "../services/apiService";
import GoogleLoginButton from "../components/GoogleLoginButton";



const CategoryMenuItem = ({ category, depth = 0, onClose }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children.length > 0;
  const maxDepth = 4; // Maximum depth level

  return (
    <>
      <MenuItem
        sx={{ 
          pl: 2 + depth * 2,
          minWidth: 250,
          ...(depth >= maxDepth && { backgroundColor: '#f5f5f5' }) // Visual cue for max depth
        }}
        onClick={() => {
          if (!hasChildren) onClose();
        }}
      >
        <ListItemText primary={category.name} />
        {hasChildren && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        )}
      </MenuItem>
      
      {hasChildren && depth < maxDepth && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ ml: 2 }}>
            {category.children.map((child) => (
              <CategoryMenuItem 
                key={child.id} 
                category={child} 
                depth={depth + 1}
                onClose={onClose}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
};

const Header = () => {
  const { userInfo } = useUser();
  const [categories, setCategories] = useState([]);
  const [categoryAnchor, setCategoryAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left side - Logo/Brand */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ textDecoration: "none", color: "inherit" }}
          >
            Savannah Store (Backend Dev Role)
          </Typography>
        </Box>

        {/* Center - Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          <Button component={Link} to="/" startIcon={<Home />}>
            Home
          </Button>
          <Button component={Link} to="/products" startIcon={<ShoppingBasket />}>
            Products
          </Button>
          
          <Button
            startIcon={<Category />}
            onClick={(e) => setCategoryAnchor(e.currentTarget)}
            disabled={loading}
          >
            Categories
            {loading && <CircularProgress size={14} sx={{ ml: 1 }} />}
          </Button>

          <Menu
            anchorEl={categoryAnchor}
            open={Boolean(categoryAnchor)}
            onClose={() => setCategoryAnchor(null)}
            PaperProps={{
              style: {
                maxHeight: '70vh',
                width: '300px',
                overflow: 'auto',
              },
            }}
          >
            {error ? (
              <Alert severity="error" sx={{ mx: 2, my: 1 }}>
                {error}
              </Alert>
            ) : (
              <>
                {categories.map((category) => (
                  <CategoryMenuItem
                    key={category.id}
                    category={category}
                    onClose={() => setCategoryAnchor(null)}
                  />
                ))}
                <Divider />
                <MenuItem 
                  component={Link} 
                  to="/categories" 
                  onClick={() => setCategoryAnchor(null)}
                  sx={{ fontWeight: 'bold' }}
                >
                  Browse All Categories
                </MenuItem>
              </>
            )}
          </Menu>

          {userInfo.access_token && (
            <Button component={Link} to="/orders">
              My Orders
            </Button>
          )}
        </Box>

        {/* Right side - User/Cart */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton component={Link} to="/cart">
            <Badge badgeContent={userInfo.cartCount || 0} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {userInfo.access_token ? (
            <>
              <Button
                startIcon={<Person />}
                endIcon={
                  <Avatar sx={{ width: 24, height: 24, ml: 1 }}>
                    {userInfo.username?.charAt(0).toUpperCase()}
                  </Avatar>
                }
                onClick={(e) => setUserAnchor(e.currentTarget)}
              >
                {userInfo.username}
              </Button>
              <Menu
                anchorEl={userAnchor}
                open={Boolean(userAnchor)}
                onClose={() => setUserAnchor(null)}
              >
                <MenuItem component={Link} to="/profile">
                  <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem component={Link} to="/orders">
                  <ListItemIcon><ShoppingBasket fontSize="small" /></ListItemIcon>
                  Orders
                </MenuItem>
                <MenuItem component={Link} to="/wishlist">
                  <ListItemIcon><Favorite fontSize="small" /></ListItemIcon>
                  Wishlist
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/logout">
                  <ListItemIcon><ExitToApp fontSize="small" /></ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
                <>
              <Button component={Link} to="/login" variant="outlined">
                Login
              </Button>
              <GoogleLoginButton />
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;