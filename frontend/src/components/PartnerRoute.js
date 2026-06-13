import { Navigate } from "react-router-dom";

const PartnerRoute = ({ children }) => {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === "partner"
    ? children
    : <Navigate to="/dashboard" />;
};

export default PartnerRoute;