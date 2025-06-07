import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import "./upload.css";

const Upload = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    category: "",
    isExchangeable: "price",
    exchangeWith: "",
    contactNumber: "",
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Electronics",
    "Books",
    "Clothing",
    "Home Appliances",
    "Sports",
    "Toys",
  ];
  const locations = [
    "Cairo",
    "Alexandria",
    "Giza",
    "Aswan",
    "Luxor",
    "Tanta",
    "Mansoura",
    "Zagazig",
    "Suez",
    "Ismailia",
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return; // Prevent multiple submissions

    // Updated validation to include images
    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.location ||
      !formData.category ||
      !formData.contactNumber ||
      (formData.isExchangeable === "price" && !formData.price) ||
      (formData.isExchangeable === "exchange" && !formData.exchangeWith) ||
      formData.images.length === 0
    ) {
      alert("Please fill in all required fields and upload at least one image");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const productData = {
        data: {
          title: formData.title,
          describtion: formData.description, // Note: API uses "describtion"
          price: formData.isExchangeable === "free" ? "0" : formData.price,
          category: formData.category,
          Locations: formData.location,
          isExchange: formData.isExchangeable === "exchange",
          exchangeWith:
            formData.isExchangeable === "exchange" ? formData.exchangeWith : "",
          contactNumber: formData.contactNumber,
          publishedAt: new Date().toISOString(),
        },
      };

      const response = await fetch("http://localhost:1337/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to create product");
      }

      const createdProduct = await response.json();

      // If we have images, upload them and link to the product
      if (formData.images.length > 0) {
        const imageFormData = new FormData();
        formData.images.forEach((image) => {
          imageFormData.append("files", image);
        });
        // Add reference to the product
        imageFormData.append("ref", "api::product.product");
        imageFormData.append("refId", createdProduct.data.id);
        imageFormData.append("field", "image");

        const imageResponse = await fetch("http://localhost:1337/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (!imageResponse.ok) {
          throw new Error("Failed to upload images");
        }
      }

      alert("Product uploaded successfully!");
      // Clear form
      setFormData({
        title: "",
        description: "",
        price: "",
        location: "",
        category: "",
        isExchangeable: "price",
        exchangeWith: "",
        contactNumber: "",
        images: [],
      });
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to upload product: ${error.message}`);
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <div className="upload">
      <Container className="upload-container" maxWidth="md">
        <div className="upload-form">
          <Typography variant="h4" gutterBottom>
            Upload Product
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <TextField
              className="form-field"
              label="Title *"
              required
              fullWidth
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              error={!formData.title.trim()}
              helperText={!formData.title.trim() ? "Title is required" : ""}
            />

            <TextField
              className="form-field"
              label="Description *"
              required
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              error={!formData.description.trim()}
              helperText={
                !formData.description.trim() ? "Description is required" : ""
              }
            />

            <RadioGroup
              className="form-field"
              row
              value={formData.isExchangeable}
              onChange={(e) =>
                setFormData({ ...formData, isExchangeable: e.target.value })
              }
              required
            >
              <FormControlLabel
                value="price"
                control={<Radio />}
                label="Set Price"
              />
              <FormControlLabel value="free" control={<Radio />} label="Free" />
              <FormControlLabel
                value="exchange"
                control={<Radio />}
                label="Exchange"
              />
            </RadioGroup>

            {formData.isExchangeable === "price" && (
              <TextField
                className="form-field"
                label="Price *"
                required
                type="number"
                fullWidth
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                error={!formData.price}
                helperText={!formData.price ? "Price is required" : ""}
              />
            )}

            {formData.isExchangeable === "exchange" && (
              <TextField
                className="form-field"
                label="What do you want to exchange with? *"
                required
                fullWidth
                value={formData.exchangeWith}
                onChange={(e) =>
                  setFormData({ ...formData, exchangeWith: e.target.value })
                }
                error={!formData.exchangeWith}
                helperText={
                  !formData.exchangeWith ? "Exchange details are required" : ""
                }
              />
            )}

            <TextField
              className="form-field"
              label="Contact Number *"
              required
              fullWidth
              value={formData.contactNumber}
              onChange={(e) =>
                setFormData({ ...formData, contactNumber: e.target.value })
              }
              error={!formData.contactNumber}
              helperText={
                !formData.contactNumber ? "Contact number is required" : ""
              }
            />

            <TextField
              className="form-field"
              select
              label="Location *"
              required
              fullWidth
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              error={!formData.location}
              helperText={!formData.location ? "Location is required" : ""}
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              className="form-field"
              select
              label="Category *"
              required
              fullWidth
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              error={!formData.category}
              helperText={!formData.category ? "Category is required" : ""}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>

            <input
              accept="image/*"
              style={{ display: "none" }}
              id="image-upload"
              multiple
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <Button
                className="form-field upload-button"
                variant="contained"
                component="span"
                fullWidth
              >
                Upload Images
              </Button>
            </label>

            <div className="image-preview-container">
              {formData.images.map((image, index) => (
                <div key={index} className="image-preview-wrapper">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="preview-image"
                  />
                  <IconButton
                    className="remove-image-button"
                    onClick={() => removeImage(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
            </div>

            <Button
              className="form-field upload-button"
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <CircularProgress size={24} color="inherit" />
                  <span>Uploading...</span>
                </div>
              ) : (
                "Upload Product"
              )}
            </Button>
          </Box>
        </div>
      </Container>
    </div>
  );
};

export default Upload;
