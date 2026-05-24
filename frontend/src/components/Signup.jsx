import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const SIGNUP_URL = "http://localhost:8000/carmeetsApp/api/signup/";
  const CSRF_URL = "http://localhost:8000/carmeetsApp/api/csrf/";

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.get(CSRF_URL, { withCredentials: true });
    const csrfToken = getCookie("csrftoken");

    axios
      .post(
        SIGNUP_URL,
        { username, password },
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      )
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
