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