import { React, useEffect, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import LoginComponent from "./components/LoginComponent.js";
import Signup from "./components/Signup";
import Home from "./components/Home";
import List from "./components/List";
import Upload from "./components/Upload";
import CheckoutProduct from "./components/CheckoutProduct";
import ProductDetails from "./components/ProductDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AlertManager from "./components/AlertManager";
import "../src/context/GlobalState";
import { useAuth } from "./context/GlobalState";
import { auth } from "./firebase";
import axios from "axios";
import "./App.css";

const App = () => {
  const { dispatch, basket } = useAuth();

  const fetchCart = useCallback(
    async (jwt) => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userEmail = user?.email;
        if (!userEmail) {
          console.error("User email not found in localStorage");
          dispatch({ type: "SET_BASKET", basket: [] });
          return;
        }

        const response = await axios.get(
          `${
            process.env.REACT_APP_API_URL
          }/api/baskets?filters[user][email][$eq]=${encodeURIComponent(
            userEmail
          )}&populate=user`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
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
              productId: item.productId,
            }))
          : [];
        dispatch({
          type: "SET_BASKET",
          basket: basketData,
        });
      } catch (error) {
        console.error("Error fetching cart:", error);
        dispatch({
          type: "SET_BASKET",
          basket: [],
        });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        const jwt = localStorage.getItem("token"); // Use Strapi JWT, not Firebase
        dispatch({ type: "SET_USER", user: authUser });
        if (jwt) {
          fetchCart(jwt);
        }
      } else {
        dispatch({ type: "SET_USER", user: null });
        dispatch({ type: "CLEAR_BASKET" });
      }
    });

    return () => unsubscribe();
  }, [dispatch, fetchCart]);

  useEffect(() => {
    const saveCart = async () => {
      const jwt = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const userEmail = user?.email;
      const userId = user?.id; // Get user ID directly from user object
      if (!jwt || !basket || basket.length === 0 || !userEmail || !userId)
        return;

      try {
        const response = await axios.get(
          `${
            process.env.REACT_APP_API_URL
          }/api/baskets?filters[user][email][$eq]=${encodeURIComponent(
            userEmail
          )}`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          }
        );

        for (const item of response.data.data || []) {
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/baskets/${item.id}`,
            {
              headers: { Authorization: `Bearer ${jwt}` },
            }
          );
        }

        for (const item of basket) {
          console.log("Saving basket item with user ID:", userId); // Debug log
          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/baskets`,
            {
              data: {
                title: item.title || "",
                price: item.price ? item.price.toString() : "0",
                image: [],
                Locations: item.location || "",
                describtion: item.description || "",
                contactNumber: item.contactNumber || "",
                isExchange: item.isExchange || false,
                exchangeWith: item.exchangeWith || "",
                user: userId, // Use user ID, not username
                productId: item.productId,
              },
            },
            {
              headers: {
                Authorization: `Bearer ${jwt}`,
                "Content-Type": "application/json",
              },
            }
          );
        }
      } catch (error) {
        console.error("Error saving cart:", error);
        if (error.response) {
          console.log("Error details:", error.response.data);
        }
      }
    };

    const timeoutId = setTimeout(saveCart, 1000);
    return () => clearTimeout(timeoutId);
  }, [basket]);

  return (
    <div className="App">
      <AlertManager />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Header />
              <Home />
            </>
          }
        />
        <Route
          path="/list"
          element={
            <>
              <Header />
              <List />
            </>
          }
        />
        <Route
          path="/upload"
          element={
            <>
              <Header />
              <Upload />
            </>
          }
        />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </div>
  );
};

export default App;
