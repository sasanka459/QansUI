import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import {Nav, Navbar, Button,NavDropdown } from 'react-bootstrap';
// import { LinkContainer } from 'react-router-bootstrap';
import { Link } from "react-router-dom";

export const NavigationBar = () => {
    const { instance } = useMsal();

    const handleLoginRedirect = () => {
      instance.loginPopup({
        scopes: ["api://fd32341b-7f1b-437f-8a65-3e8d609ca291/access_as_user"], // API scope
      }).catch(error => {
        console.error("Login failed:", error);
      });
        // instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    const handleLogoutRedirect = () => {
        instance.logoutRedirect().catch((error) => console.log(error));
    };

    /**
     * Most applications will need to conditionally render certain components based on whether a user is signed in or not.
     * msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will
     * only render their children if a user is authenticated or unauthenticated, respectively.
     */
    return (
        <>
            <Navbar bg="primary" variant="dark" className="navbarStyle">
                <a className="navbar-brand" href="/">
                    Microsoft identity platform
                </a>
                <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
          {/* <LinkContainer to="/about">
        <Nav.Link>About</Nav.Link>
      </LinkContainer> */}
      <Link to="/about" >
      About
    </Link>
    <Nav.Link as={Link} to="/about">
      About
    </Nav.Link>
    <Nav.Link  href="/about">
      About
    </Nav.Link>
            <Nav.Link href="#features">Features</Nav.Link>
            
            <NavDropdown title="Dropdown" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          </Navbar.Collapse>
                <AuthenticatedTemplate>
                    <div className="collapse navbar-collapse justify-content-end">
                        <Button variant="warning" onClick={handleLogoutRedirect}>
                            Sign out
                        </Button>
                    </div>
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <div className="collapse navbar-collapse justify-content-end">
                        <Button onClick={handleLoginRedirect}>Sign in</Button>
                    </div>
                </UnauthenticatedTemplate>
            </Navbar>
        </>
    );
};