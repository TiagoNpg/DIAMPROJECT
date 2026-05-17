import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const URL_LOGIN = "http://localhost:8000/carmeetsApp/api/login/";
  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post(URL_LOGIN, { username, password }, { withCredentials: true })
      .then(() => {
        console.log("logged in");
        navigate("/");
      })
      .catch(() => console.log("login failed"));
  };
  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
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
      <input type="submit" value="Login" />
      <button onClick={() => navigate("/")}>Voltar</button>
    </form>
  );
}
export default Login;
