import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Container, Nav, Navbar, NavDropdown} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BSNavbar = () => {
  const { isAuth, logout, deleteId } = useContext(AuthContext);

  const navigate = useNavigate();

    const handleLogout = () => {
        //for future improvement maybe calling a backend endpoing /logout 
        try {
          // remove token from local storage
          logout();
          // delete id from local storage
          deleteId();
          navigate('/login', { replace: true });
        } catch (error) {
          console.error('Logout failed:', error);
        }

    }

  return (
    <Navbar expand="md" className="bg-body-tertiary" sticky='top'>
      <Container>
        <Navbar.Brand>Mini-CRUD app</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isAuth && <Nav.Link href="/login">Login</Nav.Link>}
            {!isAuth && <Nav.Link href="/signup">Signup</Nav.Link>}
            {isAuth && <Nav.Link href="/products">Products</Nav.Link>}
          </Nav>
          <Nav className="ms-auto">
              {isAuth && (
            <NavDropdown title="Profile" id="profile">
              <NavDropdown.Item onClick={handleLogout} >Logout</NavDropdown.Item>
            </NavDropdown>
          )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default BSNavbar;