import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Form, Button, Alert } from "react-bootstrap";
import "./Signup.css";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    setError("");
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.get(CSRF_URL, { withCredentials: true });
      const csrfToken = getCookie("csrftoken");

      const res = await axios.post(
        SIGNUP_URL,
        { username, password },
        {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrfToken,
          },
        }
      );

      console.log("Signup successful!", res.data.msg);
      navigate("/");
    } catch (err) {
      console.error("Signup failed", err?.response?.data || err.message);
      setError(err?.response?.data?.msg || "Signup failed. Try a different username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <Card className="signup-card" style={{ maxWidth: "500px", margin: "50px auto" }}>
        <Card.Header className="signup-card__header" style={{ background: "linear-gradient(135deg, #7c3aed, #aa3bff)", color: "white", textAlign: "center" }}>
          <h2>Sign Up</h2>
        </Card.Header>
        <Card.Body className="signup-card__body">
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signupUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="signupPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="signupConfirm">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Form.Group>
          </Form>
        </Card.Body>
        <Card.Footer className="signup-card__footer" style={{ textAlign: "center" }}>
          <Button variant="primary" type="submit" onClick={handleSubmit} disabled={loading} style={{ width: "100%", background: "linear-gradient(135deg, #7c3aed, #aa3bff)", border: "none" }}>
            {loading ? "Signing up..." : "Submit"}
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Signup;
