import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useUserContext } from "./UserProvider";
import { BsFillPersonFill } from "react-icons/bs";


function Header() {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const handleProfileClick = () => {
    navigate(user ? "/profile" : "/login");
  };

  return (
    <Navbar data-bs-theme="dark" className="bg-body-tertiary mb-4 px-4" expand="lg" style={{minHeight: '80px'}}>
        <Container>
          <Navbar.Brand href="/" className="d-inline-block">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <img
              alt=""
              src="/src/assets/carlogo.png"
              width="100"
              height="35"
              className="align-top"
            />
            <h4 style={{margin: 0}}>Meets</h4>
          </div>
          </Navbar.Brand>
        </Container>
        <Nav className="me-auto">
          <Nav.Link onClick={handleProfileClick} role="button">
            <BsFillPersonFill className="bi" style={{fontSize: '28px'}} />
          </Nav.Link>
        </Nav>
      </Navbar>
  );
}

export default Header;