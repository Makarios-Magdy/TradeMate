import React, { useState, useEffect } from "react";
import "./Home.css";
import Product from "./Product";
import { useGetproductByNameQuery } from "../redux/product";
import { useAuth } from "../context/GlobalState";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Home = () => {
  const categories = [
    "All",
    "Electronics",
    "Books",
    "Clothing",
    "Home Appliances",
    "Sports",
    "Toys",
  ];
  const egyptCities = [
    "All",
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

  const user = JSON.parse(localStorage.getItem("user"));
  const { basket } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useGetproductByNameQuery("products?populate=*");

  // Extract search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("search") || "";
    setSearchQuery(query);
  }, [location.search]);

  // Auto-detect user's city with GPS
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
        );
        const json = await res.json();
        const city =
          json.address.city || json.address.town || json.address.village;
        if (egyptCities.includes(city)) {
          setSelectedLocation(city);
        }
      },
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  // Filter products
  useEffect(() => {
    if (data && data.data) {
      try {
        const rawProducts = data.data.map((item) => {
          const imageUrl = item.image?.[0]?.url || "";
          return {
            id: item.id,
            title: item.title || "Untitled",
            price: item.price || "0",
            category: item.category || "All",
            location: item.Locations || "Cairo",
            image: imageUrl.startsWith("http")
              ? imageUrl
              : `http://localhost:1337${imageUrl}`,
            description: item.describtion,
            contactNumber: item.contactNumber,
            isExchange: item.isExchange,
            exchangeWith: item.exchangeWith,
          };
        });

        const filtered = rawProducts.filter((product) => {
          const categoryMatch =
            selectedCategory === "All" || product.category === selectedCategory;
          const locationMatch =
            selectedLocation === "All" || product.location === selectedLocation;
          const searchMatch =
            searchQuery === "" ||
            product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
          return categoryMatch && locationMatch && searchMatch;
        });

        setFilteredProducts(filtered);
      } catch (error) {
        console.error("Error processing products:", error);
        setFilteredProducts([]);
      }
    }
  }, [data, selectedCategory, selectedLocation, searchQuery]);

  // Fetch recommendations from the Python API using GET
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!basket || basket.length === 0) {
        setRecommendedProducts([]);
        return;
      }

      setIsLoadingRecommendations(true);
      try {
        // Construct productIds query parameter
        const productIds = basket
          .map((item) => item.productId)
          .filter((id) => id)
          .join(",");
        const response = await axios.get(
          `http://localhost:5000/recommendations?productIds=${encodeURIComponent(productIds)}`
        );

        const recommendations = response.data.recommendations || [];
        setRecommendedProducts(recommendations);
        console.log("Recommendations from API:", recommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        alert("Failed to fetch recommendations. Please try again later.");
        setRecommendedProducts([]);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [basket]);

  return (
    <div className="home">
      <section className="welcome-section">
        <h2>Welcome {user ? user.username : "Guest"}</h2>
        <p>Welcome to our website! Feel free to explore our amazing items.</p>

        <div className="filter-bar">
          <div>
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location">Location:</label>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {egyptCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="items-container">
        <div className="home-row">
          {isLoading ? (
            <p>Loading products...</p>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Product
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                image={product.image}
                location={product.location}
                category={product.category}
                description={product.description}
                contactNumber={product.contactNumber}
                isExchange={product.isExchange}
                exchangeWith={product.exchangeWith}
              />
            ))
          ) : (
            <p>No products found.</p>
          )}
        </div>

        {basket && basket.length > 0 && (
          <div className="recommendations-section">
            <h3>Recommended for You</h3>
            {isLoadingRecommendations ? (
              <p>Loading recommendations...</p>
            ) : recommendedProducts.length > 0 ? (
              <div className="home-row">
                {recommendedProducts.map((product) => (
                  <Product
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    image={product.image}
                    location={product.location}
                    category={product.category}
                    description={product.description}
                    contactNumber={product.contactNumber}
                    isExchange={product.isExchange}
                    exchangeWith={product.exchangeWith}
                  />
                ))}
              </div>
            ) : (
              <p>No recommendations available.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;