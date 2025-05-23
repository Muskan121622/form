export const getUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn("No token found in localStorage.");
    return null;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("Decoded token payload:", payload);
    return payload.id; // or payload.userId depending on your backend
  } catch (err) {
    console.error("Error decoding token:", err);
    return null;
  }
};

