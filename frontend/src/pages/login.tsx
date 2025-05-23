import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://form-3-tlgr.onrender.com/api/users/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/page1");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-xl p-8 w-[350px] text-center border-4 border-pink-400"
      >
        <h1 className="text-3xl font-bold text-purple-700 mb-2">Welcome Back!</h1>
        <p className="text-gray-600 mb-6">Please log in to continue.</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded focus:outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-pink-500 text-white font-bold py-2 rounded hover:bg-pink-600"
        >
          Log In
        </button>
        <p className="mt-4 text-sm text-gray-500">
          Don't have an account?{" "}
          <span
            className="text-yellow-600 cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
