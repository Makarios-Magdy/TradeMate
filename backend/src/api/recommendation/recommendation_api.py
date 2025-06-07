from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Initialize Flask app
app = Flask(__name__)
# Enable CORS for all routes, allowing requests from any origin
CORS(app)
# Alternatively, restrict to specific origins:
# CORS(app, resources={r"/recommendations": {"origins": "http://localhost:3000"}})

# Fetch products from Strapi CMS API and convert to DataFrame
def fetch_products():
    try:
        # Request all products with all fields populated
        response = requests.get("http://localhost:1337/api/products?populate=*")
        response.raise_for_status()
        products = response.json()["data"]
        # Transform the data into a list of product dictionaries
        product_list = []
        for item in products:
            image_url = item["image"][0]["url"] if item["image"] else ""
            product_list.append({
                "id": item["id"],
                "title": item["title"],
                "category": item["category"] or "All",
                "location": item["Locations"],
                "price": item["price"],
                "image": f"http://localhost:1337{image_url}" if image_url else "",
                "description": item["describtion"],
                "contactNumber": item["contactNumber"],
                "isExchange": item["isExchange"],
                "exchangeWith": item["exchangeWith"]
            })
        # Return as a pandas DataFrame for easy processing
        return pd.DataFrame(product_list)
    except Exception as e:
        print(f"Error fetching products: {e}")
        return pd.DataFrame()

# Simple content-based recommendation algorithm using TF-IDF and cosine similarity
def advanced_recommendations(basket, products_df):
    # Create a TF-IDF matrix for product descriptions
    tfidf = TfidfVectorizer(stop_words="english")
    tfidf_matrix = tfidf.fit_transform(products_df["description"].fillna(""))
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

    # Get indices of basket items in the DataFrame
    basket_ids = [item["productId"] for item in basket]
    basket_indices = products_df[products_df["id"].isin(basket_ids)].index

    # Aggregate similarity scores for all products compared to basket items
    sim_scores = cosine_sim[basket_indices].sum(axis=0)
    # Exclude products already in the basket
    sim_scores = [(score, idx) for idx, score in enumerate(sim_scores) if products_df.iloc[idx]["id"] not in basket_ids]
    # Sort by similarity score and select top 3 recommendations
    sim_scores = sorted(sim_scores, reverse=True)[:3]

    # Return recommended products as a list of dictionaries
    recommended_indices = [idx for _, idx in sim_scores]
    return products_df.iloc[recommended_indices].to_dict(orient="records")

# GET endpoint for recommendations (accepts product IDs as query parameter)
@app.route("/recommendations", methods=["GET"])
def recommend_get():
    try:
        # Get product IDs from query parameters
        product_ids = request.args.get("productIds", "")
        if not product_ids:
            return jsonify({"recommendations": []}), 200

        # Parse product IDs into a list of integers
        basket = [{"productId": int(pid)} for pid in product_ids.split(",") if pid.isdigit()]
        if not basket:
            return jsonify({"recommendations": []}), 200

        # Fetch products from Strapi
        products_df = fetch_products()
        if products_df.empty:
            return jsonify({"error": "Failed to fetch products"}), 500

        # Generate recommendations
        recommendations = advanced_recommendations(basket, products_df)
        
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return jsonify({"error": str(e)}), 500

# POST endpoint for recommendations (accepts basket as JSON body)
@app.route("/recommendations", methods=["POST"])
def recommend_post():
    try:
        # Get the basket from the request body
        basket = request.json.get("basket", [])
        
        # Fetch products from Strapi
        products_df = fetch_products()
        if products_df.empty:
            return jsonify({"error": "Failed to fetch products"}), 500

        # Generate recommendations
        recommendations = advanced_recommendations(basket, products_df)
        
        return jsonify({"recommendations": recommendations})
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return jsonify({"error": str(e)}), 500

# Run the Flask app on port 5000 in debug mode
if __name__ == "__main__":
    app.run(port=5000, debug=True)