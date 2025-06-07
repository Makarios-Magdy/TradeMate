import { useEffect } from "react";
import axios from "axios";

export const getBasketTotal = (basket) =>
  basket.reduce((amount, item) => {
    return amount + item.price;
  }, 0);

export const initialState = {
  basket: [],
  user: null,
};

const AppReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_BASKET":
      return {
        ...state,
        basket: [...state.basket, action.item],
      };
    case "REMOVE_FROM_BASKET":
      return {
        ...state,
        basket: state.basket.filter((item) => item.id !== action.id),
      };
    case "SET_BASKET":
      return {
        ...state,
        basket: action.basket,
      };
    case "CLEAR_BASKET":
      return {
        ...state,
        basket: [],
      };
    case "SET_USER":
      return {
        ...state,
        user: action.user,
      };
    default:
      return state;
  }
};

export default AppReducer;
