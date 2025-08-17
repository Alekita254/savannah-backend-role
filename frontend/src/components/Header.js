import React, { useContext } from "react";
import UserContext from "../context/UserContext";
import { Link } from "react-router-dom";
import GoogleLoginButton from "../components/GoogleLoginButton";
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
} from "@mui/material";
import {
  ShoppingCart,
  Person,
  Home,
  ShoppingBasket,
  Category,
  ExitToApp,
  Favorite,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";

const Header = () => {
  const { userInfo } = useContext(UserContext);
  const cartItemCount = 3;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [categoryAnchorEl, setCategoryAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const categoryOpen = Boolean(categoryAnchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCategoryClick = (event) => {
    setCategoryAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setCategoryAnchorEl(null);
  };

  return (
    <AppBar position="static" color="default" elevation={0}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          >
            Savannah Backend Role
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          <Button component={Link} to="/" startIcon={<Home />}>
            Home
          </Button>
          <Button component={Link} to="/products" startIcon={<ShoppingBasket />}>
            Products
          </Button>
          <Button
            aria-controls="category-menu"
            aria-haspopup="true"
            onClick={handleCategoryClick}
            startIcon={<Category />}
          >
            Categories
          </Button>
          <Menu
            id="category-menu"
            anchorEl={categoryAnchorEl}
            open={categoryOpen}
            onClose={handleClose}
          >
            <MenuItem component={Link} to="/category/electronics" onClick={handleClose}>
              Electronics
            </MenuItem>
            <MenuItem component={Link} to="/category/clothing" onClick={handleClose}>
              Clothing
            </MenuItem>
            <MenuItem component={Link} to="/category/books" onClick={handleClose}>
              Books
            </MenuItem>
            <Divider />
            <MenuItem component={Link} to="/categories" onClick={handleClose}>
              All Categories
            </MenuItem>
          </Menu>

          {userInfo.access_token && (
            <Button component={Link} to="/orders">
              My Orders
            </Button>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton component={Link} to="/cart" color="inherit">
            <Badge badgeContent={cartItemCount} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {userInfo.access_token ? (
            <>
              <Button
                aria-controls="user-menu"
                aria-haspopup="true"
                onClick={handleClick}
                startIcon={<Person />}
                endIcon={
                  <Avatar sx={{ width: 24, height: 24, ml: 1 }}>
                    {userInfo?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                }
              >
                {userInfo?.username}
              </Button>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  My Profile
                </MenuItem>
                <MenuItem component={Link} to="/orders" onClick={handleClose}>
                  <ListItemIcon>
                    <ShoppingBasket fontSize="small" />
                  </ListItemIcon>
                  My Orders
                </MenuItem>
                <MenuItem component={Link} to="/wishlist" onClick={handleClose}>
                  <ListItemIcon>
                    <Favorite fontSize="small" />
                  </ListItemIcon>
                  Wishlist
                </MenuItem>
                <Divider />
                <MenuItem component={Link} to="/logout" onClick={handleClose}>
                  <ListItemIcon>
                    <ExitToApp fontSize="small" />
                  </ListItemIcon>
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