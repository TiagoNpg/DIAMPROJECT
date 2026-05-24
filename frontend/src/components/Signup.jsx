import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const SIGNUP_URL = "http://localhost:8000/api/signup/";
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(SIGNUP_URL, { username, password })
      .then((response) => {
        console.log("Signup successful!", response.data.msg);
        navigate("/");
      })
      .catch((err) => console.log("Signup failed...", err.response.data.msg));
  };
  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <label>Username:</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <label>Password:</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input type="submit" value="Signup" />
    </form>
  );
};
export default Signup;
