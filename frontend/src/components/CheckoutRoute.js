import { Navigate } from "react-router-dom";

const CheckoutRoute = ({ children }) => {
  const cart = JSON.parse(
    localStorage.getItem("cart")
  ) || {};

  const hasItems = Object.values(cart).some(qty => qty > 0)

  if(!hasItems){
    return <Navigate to="/book-laundry"/>
  }

  return children;

};

export default CheckoutRoute;