import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Container, Paper, Grid } from '@mui/material';
import { useAuth } from '../context/GlobalState';
import axios from 'axios';
import './Product.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dispatch, basket } = useAuth();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/products/${id}?populate=*`
        );
        if (response.data && response.data.data) {
          const productData = response.data.data;
          const imageUrl = productData.attributes.image?.data?.[0]?.attributes?.url || '';
          
          setProduct({
            id: productData.id,
            title: productData.attributes.title || 'Untitled',
            price: productData.attributes.price || '0',
            category: productData.attributes.category || 'Uncategorized',
            location: productData.attributes.Locations || 'Unknown',
            image: imageUrl.startsWith('http')
              ? imageUrl
              : `${process.env.REACT_APP_API_URL}${imageUrl}`,
            description: productData.attributes.describtion || '',
            contactNumber: productData.attributes.contactNumber || '',
            isExchange: productData.attributes.isExchange || false,
            exchangeWith: productData.attributes.exchangeWith || '',
          });
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const addToBasket = async () => {
    if (!token) {
      alert('Please log in to add items to your basket.');
      navigate('/login');
      return;
    }

    const isProductInBasket = basket.some((item) => item.productId === product.id);

    if (isProductInBasket) {
      alert('This product is already in your basket.');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/baskets`,
        {
          data: {
            title: product.title || 'Unnamed Product',
            price: product.price ? product.price.toString() : '0',
            imageUrl: product.image || '',
            image: [],
            Locations: product.location || '',
            describtion: product.description || '',
            contactNumber: product.contactNumber || '',
            isExchange: product.isExchange || false,
            exchangeWith: product.exchangeWith || '',
            publishedAt: new Date().toISOString(),
            user: user.id,
            productId: product.id,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdBasketItem = response.data;
      dispatch({
        type: 'ADD_TO_BASKET',
        item: {
          id: createdBasketItem.data.id,
          title: product.title,
          price: product.price,
          image: product.image,
          location: product.location,
          description: product.description,
          contactNumber: product.contactNumber,
          isExchange: product.isExchange,
          exchangeWith: product.exchangeWith,
          productId: product.id,
        },
      });

      alert('Product added to basket!');
    } catch (error) {
      console.error('Error adding to basket:', error);
      alert(`Failed to add to basket: ${error.message}`);
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const message = `Hi, I'm interested in your product: ${product.title}`;
    window.open(
      `https://wa.me/${product.contactNumber}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  };

  const handlePhoneCall = () => {
    if (!product) return;
    window.location.href = `tel:${product.contactNumber}`;
  };

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Typography variant="h5">Loading product details...</Typography>
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <Typography variant="h5">Product not found</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 10, mb: 5 }}>
      <Button variant="contained" onClick={handleBack} sx={{ mb: 3 }}>
        Back to Home
      </Button>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <img 
              src={product.image || '/placeholder-image.jpg'} 
              alt={product.title}
              style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              {product.title}
            </Typography>
            
            {product.isExchange ? (
              <Typography variant="h5" color="primary" gutterBottom>
                Exchange with: {product.exchangeWith}
              </Typography>
            ) : (
              <Typography variant="h5" color="primary" gutterBottom>
                {product.price === '0' ? 'Free' : `${product.price} EGP`}
              </Typography>
            )}
            
            <Typography variant="subtitle1" gutterBottom>
              Location: {product.location}
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Category: {product.category}
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              {product.description}
            </Typography>
            
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant="contained" 
                color="primary"
                fullWidth
                onClick={addToBasket}
              >
                Add to List
              </Button>
              
              <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleWhatsApp}
              >
                Contact via WhatsApp
              </Button>
              
              <Button
                variant="contained"
                color="info"
                fullWidth
                onClick={handlePhoneCall}
              >
                Call Seller
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetails;