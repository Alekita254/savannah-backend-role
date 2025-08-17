import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { useUser } from "../context/UserContext"; 

const LogoutPage = () => {
  const navigate = useNavigate();
  const { updateUserInfo } = useUser();
  useEffect(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    updateUserInfo(null, null);
  }, []);
  
  return <div>LogoutPage</div>;
};

export default LogoutPage;
