import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useUserContext } from "./UserProvider";
import { BsFillPersonFill } from "react-icons/bs";
import ThemeToggle from "./ThemeToggle";


function Header() {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const handleProfileClick = () => {
    navigate(user ? "/profile" : "/login");
  };

  const handleAdminClick = () => {
    navigate("/admin");
  };

  return (
    <Navbar className="mb-4 px-4" expand="lg" style={{minHeight: '80px', backgroundColor: 'var(--header-bg)'}}>
        <Container>
          <Navbar.Brand href="/" className="d-inline-block">
           <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
             <img
               alt=""
               src="/src/assets/carlogo.png"
               width="100"
               height="35"
               className="align-top"
               color={'var(--text-h)'}
             />
             <h4 style={{margin: 0, color: 'var(--text-h)'}}>Meets</h4>
           </div>
          </Navbar.Brand>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <ThemeToggle />
            </div>
        </Container>
        <Nav className="me-auto">
          {user && user.profile === 'admin' && (
            <Nav.Link onClick={handleAdminClick} role="button" style={{marginRight: '15px'}}>
              <span style={{fontSize: '14px', color: 'var(--color-moon-icon)', fontWeight: 'bold'}}>⚙️ Admin</span>
            </Nav.Link>
          )}
          <Nav.Link onClick={handleProfileClick} role="button">
            <BsFillPersonFill className="bi" style={{fontSize: '28px', color: 'var(--color-moon-icon)'}} />
          </Nav.Link>
        </Nav>
      </Navbar>
  );
}

export default Header;