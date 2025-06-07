import React, { useState, useEffect } from "react";
import { Button, IconButton, Typography } from "@mui/material";
import { BsBasket2Fill } from "react-icons/bs";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useAuth } from "../context/GlobalState";
import "./Product.css";
import axios from "axios";
import { toast } from "react-toastify";
import { showAlert } from "../utils/alertService";

const useBasket = (token, userId) => {
  const { dispatch, basket } = useAuth();

  const getBasketData = async () => {
    if (!token || !userId) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userEmail = user?.email;
      if (!userEmail) {
        console.error("User email not found in localStorage");
        dispatch({ type: "SET_BASKET", basket: [] });
        return;
      }

      const response = await axios.get(
        `http://localhost:1337/api/baskets?filters[user][email][$eq]=${encodeURIComponent(
          userEmail
        )}&populate=user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.data) {
        const basketData = response.data.data.map((item) => ({
          id: item.id,
          documentId: item.documentId,
          title: item.title,
          price: item.price,
          // Improved image handling - convert stored imageUrl back to proper format
          image: item.imageUrl || item.image,
          location: item.Locations,
          description: item.describtion,
          contactNumber: item.contactNumber,
          isExchange: item.isExchange,
          exchangeWith: item.exchangeWith,
          productId: item.productId,
        }));
        dispatch({
          type: "SET_BASKET",
          basket: basketData,
        });
        console.log("Basket fetched in useBasket:", basketData);
      } else {
        console.log("No basket items found in useBasket for user:", userEmail);
        dispatch({
          type: "SET_BASKET",
          basket: [],
        });
      }
    } catch (error) {
      console.error("Error fetching basket in useBasket:", error);
      dispatch({
        type: "SET_BASKET",
        basket: [],
      });
    }
  };

  useEffect(() => {
    if (token && userId && basket.length === 0) {
      getBasketData();
    }
  }, [token, userId]);

  const addToBasket = async ({
    id,
    title,
    price,
    image,
    location,
    description,
    contactNumber,
    isExchange,
    exchangeWith,
  }) => {
    const jwt = localStorage.getItem("token");
    const userId = localStorage.getItem("id");

    if (!jwt || !userId) {
      showAlert('error', 'Authentication Required', 'Please log in to add items to your basket.');
      return;
    }

    const isProductInBasket = basket.some((item) => item.productId === id);

    if (isProductInBasket) {
      showAlert('info', 'Already In Basket', 'This product is already in your basket.');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/baskets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            data: {
              title: title || "Unnamed Product",
              price: price ? price.toString() : "0",
              // Store the image URL as a string in a custom field
              imageUrl: image || "",
              // Keep image as empty array for Strapi compatibility
              image: [],
              Locations: location || "",
              describtion: description || "",
              contactNumber: contactNumber || "",
              isExchange: isExchange || false,
              exchangeWith: exchangeWith || "",
              publishedAt: new Date().toISOString(),
              user: userId,
              productId: id,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Strapi Error Details:", errorData);
        throw new Error(errorData.error?.message || "Failed to add to basket");
      }

      const createdBasketItem = await response.json();
      dispatch({
        type: "ADD_TO_BASKET",
        item: {
          id: createdBasketItem.data.id,
          documentId: createdBasketItem.data.documentId,
          title,
          price,
          // Store the actual image URL here
          image: image,
          location,
          description,
          contactNumber,
          isExchange,
          exchangeWith,
          productId: id,
        },
      });

      console.log("Product added to basket with image:", image);
      showAlert('success', 'Success', 'Product added to basket!');
    } catch (error) {
      console.error("Error adding to basket:", error);
      showAlert('error', 'Error', `Failed to add to basket: ${error.message}`);
    }
  };

  const removeFromBasket = async ({ basketItemId }) => {
    if (!token) return;
    try {
      await axios.delete(`http://localhost:1337/api/baskets/${basketItemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch({
        type: "REMOVE_FROM_BASKET",
        id: basketItemId,
      });
      toast.success("Removed from basket successfully!");
    } catch (error) {
      console.error("Error removing from basket:", error);
      toast.error("Failed to remove from basket.");
    }
  };

  return { basket, addToBasket, removeFromBasket };
};

const Product = ({
  id,
  title,
  price,
  image,
  location,
  description,
  contactNumber,
  isExchange,
  exchangeWith,
}) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const { addToBasket } = useBasket(token, userId);

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const message = `Hi, I'm interested in your product: ${title}`;
    window.open(
      `https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handlePhoneCall = (e) => {
    e.stopPropagation();
    window.location.href = `tel:${contactNumber}`;
  };

  // Debug log to see what image URL we're getting
  console.log("Product component received image:", image);

  return (
    <div className="product">
      <img
        src={image || "/placeholder-image.jpg"}
        alt={title}
        onError={(e) => {
          console.log("Product image failed to load:", e.target.src);
          e.target.src = "/placeholder-image.jpg";
        }}
      />
      <div className="product-info">
        <h3>{title}</h3>
        {isExchange ? (
          <p className="exchange-text">Exchange with: {exchangeWith}</p>
        ) : (
          <p className="price">{price === "0" ? "Free" : `${price} EGP`}</p>
        )}
        <p className="location">
          <LocationOnIcon fontSize="small" style={{ fontSize: '16px', opacity: 0.8 }} />
          {location}
        </p>
        <Typography variant="body2" className="description">
          {description}
        </Typography>

        <div className="contact-buttons">
          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={handleWhatsApp}
            className="whatsapp-button"
            fullWidth
            disableElevation
          >
            WhatsApp
          </Button>
          <Button
            variant="contained"
            startIcon={<PhoneIcon />}
            onClick={handlePhoneCall}
            className="call-button"
            fullWidth
            disableElevation
          >
            Call
          </Button>
        </div>

        <Button
          variant="contained"
          startIcon={<BsBasket2Fill />}
          onClick={() => {
            console.log("Adding to basket with image:", image);
            addToBasket({
              id,
              title,
              price,
              image,
              location,
              description,
              contactNumber,
              isExchange,
              exchangeWith,
            });
          }}
          className="basket-button"
          fullWidth
          disableElevation
        >
          Add to List
        </Button>
      </div>
    </div>
  );
};

export default Product;