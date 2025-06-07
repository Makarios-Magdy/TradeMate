import React, { useState } from "react";
import "./Login.css";
import { useLoginMutation } from "../redux/product";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/GlobalState";
import axios from "axios";
// Make sure we're not importing any images incorrectly

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [login] = useLoginMutation();
  const { dispatch } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      const result = await login({
        identifier: credentials.email,
        password: credentials.password,
      });
      if (result.data) {
        const { jwt, user } = result.data;
        localStorage.setItem("token", jwt);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("id", user.id.toString()); // Store as 'id' instead of 'strapiUserId'
        console.log("Stored user ID:", localStorage.getItem("id")); // Debug log
        dispatch({ type: "SET_USER", user });

        // Fetch user's basket with Strapi v5 syntax using email
        try {
          const response = await axios.get(
            `http://localhost:1337/api/baskets?filters[user][email][$eq]=${encodeURIComponent(user.email)}&populate=user`,
            {
              headers: {
                Authorization: `Bearer ${jwt}`,
              },
            }
          );

          const basketData = response.data.data
            ? response.data.data.map((item) => ({
                id: item.id,
                title: item.title,
                price: item.price,
                image: item.image,
                location: item.Locations,
                description: item.describtion,
                contactNumber: item.contactNumber,
                isExchange: item.isExchange,
                exchangeWith: item.exchangeWith,
                productId: item.productId || null,
              }))
            : [];
          dispatch({ type: "SET_BASKET", basket: basketData });
          console.log("Basket fetched successfully:", basketData);
        } catch (fetchError) {
          console.error("Error fetching basket after login:", fetchError);
          dispatch({ type: "SET_BASKET", basket: [] });
          alert("Failed to fetch basket. Starting with an empty basket.");
        }

        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h2>Welcome Back</h2>
        <form className="login-form">
          <input
            type="email"
            placeholder="Email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="login-btn primary"
            onClick={() => handleLogin({ email, password })}
          >
            Sign In
          </button>
          <button
            type="button"
            className="login-btn secondary"
            onClick={() => navigate("/signup")}
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;