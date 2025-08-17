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
  // Add all profile fields
  formData.append("first_name", profileData.first_name);
  formData.append("last_name", profileData.last_name);
  formData.append("phone_number", profileData.phone_number);
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