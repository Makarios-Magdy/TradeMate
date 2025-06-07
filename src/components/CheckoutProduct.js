import React, { useEffect } from "react";
import { Button, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useAuth } from "../context/GlobalState";
import axios from "axios";
import { showAlert } from "../utils/alertService";
import "./CheckoutProduct.css";

const CheckoutProduct = ({
  id,
  documentId,
  title,
  price,
  image,
  location,
  description,
  contactNumber,
  isExchange,
  exchangeWith,
}) => {
  const { dispatch, basket } = useAuth();
  const jwt = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = localStorage.getItem("id");

  // Function to properly format image URL
  const getImageUrl = (imageData) => {
    // If it's already a full URL (starts with http), return as is
    if (typeof imageData === "string" && imageData.startsWith("http")) {
      return imageData;
    }

    // If it's a string but relative path
    if (typeof imageData === "string" && imageData) {
      return imageData.startsWith("/")
        ? `${process.env.REACT_APP_API_URL}${imageData}`
        : `${process.env.REACT_APP_API_URL}/${imageData}`;
    }

    // If it's an array (Strapi format)
    if (Array.isArray(imageData) && imageData.length > 0) {
      const url = imageData[0].url;
      return url.startsWith("http")
        ? url
        : `${process.env.REACT_APP_API_URL}${url}`;
    }

    // If it's an object with url property
    if (imageData && typeof imageData === "object" && imageData.url) {
      return imageData.url.startsWith("http")
        ? imageData.url
        : `${process.env.REACT_APP_API_URL}${imageData.url}`;
    }

    // Default placeholder
    return "/placeholder-image.jpg";
  };

  // Fetch the user's basket when the component mounts
  useEffect(() => {
    const fetchBasket = async () => {
      if (!jwt || !userId) {
        console.error("No JWT token or user ID found");
        dispatch({ type: "SET_BASKET", basket: [] });
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/baskets?filters[user][id][$eq]=${userId}&populate=user`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        const basketData = response.data.data
          ? response.data.data.map((item) => ({
              id: item.id,
              documentId: item.documentId,
              title: item.title,
              price: item.price,
              // Use imageUrl first (our custom field), then fallback to image array
              image:
                item.imageUrl ||
                (item.image?.[0]?.url
                  ? item.image[0].url.startsWith("http")
                    ? item.image[0].url
                    : `${process.env.REACT_APP_API_URL}${item.image[0].url}`
                  : "/placeholder-image.jpg"),
              location: item.Locations,
              description: item.describtion,
              contactNumber: item.contactNumber,
              isExchange: item.isExchange,
              exchangeWith: item.exchangeWith,
              productId: item.productId || null,
            }))
          : [];
        dispatch({ type: "SET_BASKET", basket: basketData });
        console.log("Basket fetched in CheckoutProduct:", basketData);
      } catch (fetchError) {
        console.error("Error fetching basket in CheckoutProduct:", fetchError);
        dispatch({ type: "SET_BASKET", basket: [] });
        alert("Failed to fetch basket. Please try again.");
      }
    };

    fetchBasket();
  }, [jwt, userId, dispatch]);

  const removeFromList = async () => {
    if (!jwt) {
      showAlert('error', 'Authentication Required', 'Please log in to remove items from your basket.');
      return;
    }

    if (!documentId) {
      console.error("Missing documentId for item:", { id, title });
      showAlert('error', 'Error', 'Cannot remove item: Missing document ID.');
      return;
    }

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/baskets/${documentId}`,
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      );

      dispatch({
        type: "REMOVE_FROM_BASKET",
        id: id,
      });

      showAlert('success', 'Success', 'Product removed from basket!');
    } catch (error) {
      console.error("Error removing from basket:", error);
      showAlert('error', 'Error', 'Failed to remove product from basket. Please try again.');
    }
  };

  return (
    <div className="checkout-product">
      <img
        src={getImageUrl(image)}
        alt={title}
        onError={(e) => {
          console.log("Image failed to load:", e.target.src);
          e.target.src = "/placeholder-image.jpg";
        }}
      />
      <div className="product-details">
        <Typography variant="h6">{title}</Typography>
        {isExchange ? (
          <Typography variant="body1">Exchange with: {exchangeWith}</Typography>
        ) : (
          <Typography variant="body1">
            {price === "0" ? "Free" : `${price} EGP`}
          </Typography>
        )}
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <LocationOnIcon fontSize="small" sx={{ fontSize: '16px', opacity: 0.8 }} />
          {location}
        </Typography>
        <Typography variant="body2">Description: {description}</Typography>
        <div className="contact-buttons">
          <Button
            variant="contained"
            startIcon={<WhatsAppIcon />}
            onClick={(e) => {
              e.stopPropagation();
              const message = `Hi, I'm interested in your product: ${title}`;
              window.open(
                `https://wa.me/${contactNumber}?text=${encodeURIComponent(
                  message
                )}`,
                "_blank"
              );
            }}
            className="whatsapp-button"
            disableElevation
          >
            WhatsApp
          </Button>
          <Button
            variant="contained"
            startIcon={<PhoneIcon />}
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${contactNumber}`;
            }}
            className="call-button"
            disableElevation
          >
            Call
          </Button>
        </div>
        <Button
          variant="contained"
          onClick={removeFromList}
          className="remove-button"
          disableElevation
          sx={{ fontWeight: 500 }}
        >
          Remove from List
        </Button>
      </div>
    </div>
  );
};

export default CheckoutProduct;
