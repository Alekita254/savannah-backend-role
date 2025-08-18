export const verifyToken = async (access_token) => {
  const response = await fetch("/user/token/verify/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: access_token }),
  });
  return response.ok;
};

export const loginWithGoogle = async (authorizationCode) => {
  const response = await fetch("/user/login-with-google/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code: authorizationCode }),
  });
  if (!response.ok) throw new Error("Google login failed");
  return await response.json();
};

export const fetchProfile = async (access_token) => {
  const response = await fetch("/user/profile/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok && response.status !== 404) {
    throw new Error("Failed to fetch profile data");
  }
  return response.ok ? await response.json() : null;
};

export const saveProfile = async (access_token, profileData) => {
  const formData = new FormData();
  formData.append("first_name", profileData.first_name);
  formData.append("last_name", profileData.last_name);
  formData.append("phone", profileData.phone);
  formData.append("address", profileData.address);
  
  if (profileData.profile_picture) {
    formData.append("profile_picture", profileData.profile_picture);
  }

  const response = await fetch("/user/profile/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to save profile");
  }
  return await response.json();
};

export const fetchCategories = async () => {
  try {
    const response = await fetch("/products/categories/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem('access_token') && {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Create a map of all categories by ID
    const categoryMap = data.reduce((map, category) => {
      map[category.id] = { ...category, children: [] };
      return map;
    }, {});

    // Build the hierarchy (supports up to 4 levels)
    const rootCategories = [];
    
    data.forEach(category => {
      if (category.parent === null) {
        // Level 1 (Root categories)
        rootCategories.push(categoryMap[category.id]);
      } else if (categoryMap[category.parent]) {
        // Level 2-4 (Nested categories)
        categoryMap[category.parent].children.push(categoryMap[category.id]);
        
        // Sort children alphabetically
        categoryMap[category.parent].children.sort((a, b) => 
          a.name.localeCompare(b.name)
        );
      }
    });

    // Sort root categories alphabetically
    rootCategories.sort((a, b) => a.name.localeCompare(b.name));
    
    return rootCategories;
    
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw new Error("Failed to load categories. Please try again later.");
  }
};

// Fetch all products
export const fetchProducts = async (categoryId = null) => {
  try {
    const url = categoryId 
      ? `/products/products/?category=${categoryId}`
      : '/products/products/';
      
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem('access_token') && {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw new Error("Failed to load products. Please try again later.");
  }
};

// Fetch single product by ID
export const fetchProductById = async (productId) => {
  try {
    const response = await fetch(`/products/products/${productId}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem('access_token') && {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch product:", error);
    throw new Error("Failed to load product details. Please try again later.");
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      throw new Error("You need to be logged in to add items to cart");
    }

    const response = await fetch("/products/cart/add/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({ product_id: productId, quantity })
    });

    if (!response.ok) {
      throw new Error(`Failed to add to cart: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCart = async () => {
  try {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      throw new Error("You need to be logged in to view your cart");
    }

    const response = await fetch("/products/cart/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const updateCartItem = async (itemId, quantity) => {
  try {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      throw new Error("You need to be logged in to update your cart");
    }

    const response = await fetch("/products/cart/update/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({ product_id: itemId, quantity })
    });

    if (!response.ok) {
      throw new Error(`Failed to update cart: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
};

export const removeCartItem = async (itemId) => {
  try {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      throw new Error("You need to be logged in to remove items from cart");
    }

    const response = await fetch("/products/cart/remove/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify({ product_id: itemId })
    });

    if (!response.ok) {
      throw new Error(`Failed to remove item from cart: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
};

export const checkoutCart = async (shippingInfo) => {
  try {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      throw new Error("You need to be logged in to checkout");
    }

    const response = await fetch("/products/cart/checkout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      },
      body: JSON.stringify(shippingInfo)
    });

    if (!response.ok) {
      throw new Error(`Checkout failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error during checkout:", error);
    throw error;
  }
};

export const fetchOrders = async () => {
  try {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      throw new Error("You need to be logged in to view your orders");
    }

    const response = await fetch("/products/orders/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};