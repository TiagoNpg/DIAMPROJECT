import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "./UserProvider";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserContext();
  const URL_LOGIN = "http://localhost:8000/api/login/";
  const PROFILE_ENDPOINT = "http://localhost:8000/api/user/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axios.post(
        URL_LOGIN,
        { username, password },
        { withCredentials: true }
      );
      try {
        const profileResponse = await axios.get(PROFILE_ENDPOINT, { withCredentials: true });
        setUser(profileResponse.data);
      } catch {
        setUser(null);
      }
      navigate("/");
    } catch {
      setError("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__media" aria-hidden="true">
          <div className="login-logo">Meets</div>
        </div>

        <div className="login-card__body">
          <form onSubmit={handleLogin} className="login-form">
            <h2 className="login-title">Entrar</h2>

            {error && <div className="login-error">{error}</div>}

            <label className="login-label">Username</label>
            <input
              className="login-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="login-actions">
              <button className="login-link" onClick={handleBack}>
                Voltar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
