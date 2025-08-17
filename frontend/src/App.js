// import "./App.css";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import React, { useState, useEffect } from "react";

// import PostListPage from "./pages/PostListPage";
// import PostDetailPage from "./pages/PostDetailPage";
// import Header from "./components/Header";
// import LogoutPage from "./pages/LogoutPage";
// import ProfilePage from "./pages/ProfilePage";

// import UserContext from "./context/UserContext";

// function App() {
//   // const clientId = process.env.REACT_APP_CLIENT_ID;

//   const clientId = "722584951999-to2ng8jbe10p2lm2e4ih074k69lkq2sj.apps.googleusercontent.com";

//   const [userInfo, setUserInfo] = useState([]);

//   const verifyToken = async () => {
//     const access_key = localStorage.getItem("access_token");
//     const username = localStorage.getItem("username");

//     fetch("/user/token/verify/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ token: access_key }),
//     }).then((response) => {
//       if (response.ok) {
//         setUserInfo({
//           ...userInfo,
//           access_token: access_key,
//           username: username,
//         });
//       } else {
//         setUserInfo({ ...userInfo, access_token: null, username: null });
//       }
//     });
//   };

//   const updateUserInfo = (value) => {
//     setUserInfo(value);
//   };

//   useEffect(() => {
//     verifyToken();
//   }, []);

//   return (
//     <BrowserRouter>
//       <UserContext.Provider value={{ userInfo, updateUserInfo }}>
//         <GoogleOAuthProvider clientId={clientId}>
//           <div className="App">
//             <Header />
//             <Routes>
//               <Route path="/" exact element={<PostListPage />}></Route>
//               <Route path="/blog/post/:postId/" element={<PostDetailPage />}></Route>
//               <Route path="/logout/" element={<LogoutPage />} />
//               <Route path="/profile/" element={<ProfilePage />} />

//             </Routes>
//           </div>
//         </GoogleOAuthProvider>
//       </UserContext.Provider>
//     </BrowserRouter>
//   );
// }

// export default App;

import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";

import PostListPage from "./pages/PostListPage";
import PostDetailPage from "./pages/PostDetailPage";
import Header from "./components/Header";
import LogoutPage from "./pages/LogoutPage";
import ProfilePage from "./pages/ProfilePage";
import { verifyToken } from "./services/apiService";
import { UserProvider } from "./context/UserContext"; // Updated import

function App() {
  const clientId = "722584951999-to2ng8jbe10p2lm2e4ih074k69lkq2sj.apps.googleusercontent.com";
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const checkAuth = async () => {
      const access_token = localStorage.getItem("access_token");
      const username = localStorage.getItem("username");
      
      if (access_token) {
        const isValid = await verifyToken(access_token);
        setUserInfo({
          access_token: isValid ? access_token : null,
          username: isValid ? username : null,
        });
      }
    };

    checkAuth();
  }, []);

  const updateUserInfo = (token, username) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("username", username);
    setUserInfo({ access_token: token, username });
  };

  return (
    <BrowserRouter>
      <UserProvider value={{ userInfo, updateUserInfo }}> {/* Updated to UserProvider */}
        <GoogleOAuthProvider clientId={clientId}>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" exact element={<PostListPage />} />
              {/* <Route path="/blog/post/:postId/" element={<Post  DetailPage />} /> */}
              <Route path="/logout/" element={<LogoutPage />} />
              <Route path="/profile/" element={<ProfilePage />} />
            </Routes>
          </div>
        </GoogleOAuthProvider>
      </UserProvider> {/* Updated to UserProvider */}
    </BrowserRouter>
  );
}

export default App;