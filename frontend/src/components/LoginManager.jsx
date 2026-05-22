import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./UserProvider";
import axios from "axios";

const LoginManager = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserContext();
  const LOGOUT_URL = "http://localhost:8000/carmeetsApp/api/logout/";
  const USER_URL = "http://localhost:8000/carmeetsApp/api/user/";

  useEffect(() => {
    axios
      .get(USER_URL, { withCredentials: true })
      .then((response) => setUser(response.data))
      .catch(() => setUser(null));
  }, [setUser]);

  const logout = () => {
    axios
      .get(LOGOUT_URL, { withCredentials: true })
      .then(() => setUser(null))
      .catch(() => alert("Logout failed"));
  };

  return (
    <>
      {user ? (
        <>
          <p>Olá {user.username}!</p>
          <button onClick={logout}>Logout</button>
          <button className="btn" onClick={() => navigate("/profile")}>
            Profile
          </button>
        </>
      ) : (
        <>
          <p>Olá, não estás logado(a)!</p>
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")}>Signup</button>
        </>
      )}
    </>
  );
};
export default LoginManager;
