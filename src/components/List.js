import React from 'react';
import { useAuth } from "../context/GlobalState";
import CheckoutProduct from './CheckoutProduct';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import "./List.css";

const Items = () => {
  const { user, basket } = useAuth();

  return (
    <div className='list'>
      <div className="list-header">
        <div className="list-header-content">
          <h3>Hello, {user?.email}</h3>
          <div className="basket-info">
            <h2 className="list-title">Your Shopping List</h2>
            <div className="basket-counter">
              <ShoppingBasketIcon />
              <span>{basket.length} {basket.length === 1 ? 'item' : 'items'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="list-content">
        <div className="products-container">
          {basket.length > 0 ? (
  basket.map((item) => (
    <CheckoutProduct
      key={item.id}
      id={item.id}
      documentId={item.documentId} // Ensure documentId is passed
      title={item.title}
      image={item.image}
      price={item.price}
      location={item.location}
      description={item.description}
      contactNumber={item.contactNumber}
      isExchange={item.isExchange}
      exchangeWith={item.exchangeWith}
    />
  ))
) : (
  <div className="empty-basket">
    <ShoppingBasketIcon className="empty-basket-icon" />
    <p>Your shopping list is empty</p>
    <p className="empty-basket-subtitle">
      Browse our products and add items to your list
    </p>
  </div>
)}
        </div>
      </div>
    </div>
  );
}

export default Items;