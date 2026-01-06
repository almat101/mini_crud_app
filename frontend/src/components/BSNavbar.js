import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Container, Nav, Navbar, NavDropdown, Toast } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const isDev = process.env.REACT_APP_IS_DEV === "true";
const URL = isDev ? "http://localhost:3030/auth/logout" : "/auth/logout";

const BSNavbar = () => {
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");
  const [showToast, setShowToast] = useState(false);

  const { isAuth, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      //token is removed by calling /logout that clear the cookie with the token JWT
      await axios.post(
        `${URL}`,
        //handle login has empty body if i forgot this { empty body}, withCredendial:true is sent as the body and the cookie is not cleared
        {},
        {
          withCredentials: true,
        }
      );
      logout(); // agiorna l'authcontext
      setMessage("Logout successful!");
      setVariant("success");
      setShowToast(true);
      navigate("/login", { replace: true });
    } catch (error) {
      setMessage(error.response?.data?.message || "Logout failed!"); // Mostra un messaggio di errore
      setVariant("danger");
      setShowToast(true);
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={3000}
        autohide
        className="position-fixed bottom-0 end-0 m-3"
        bg={variant}
      >
        <Toast.Body className="text-white">{message}</Toast.Body>
      </Toast>
      <Navbar expand="md" className="bg-body-tertiary" sticky="top">
        <Container>
          <Navbar.Brand>Mini-CRUD app</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {!isAuth && <Nav.Link href="/home">Home</Nav.Link>}
              {!isAuth && <Nav.Link href="/login">Login</Nav.Link>}
              {!isAuth && <Nav.Link href="/signup">Signup</Nav.Link>}
              {isAuth && <Nav.Link href="/products">My products</Nav.Link>}
              {isAuth && <Nav.Link href="/my-home">My home</Nav.Link>}
            </Nav>
            <Nav className="ms-auto">
              {isAuth && (
                <NavDropdown title="Profile" id="profile">
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default BSNavbar;
