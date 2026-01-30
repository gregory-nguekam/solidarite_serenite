import { AppBar, Box, Button, Container, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import { useState, type MouseEvent } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Footer } from "./Footer";

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static" sx={{ bgcolor: "green" }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box
              component="img"
              src="/solidarite_serenite.jpeg"
              alt="Solidarité & sérénité"
              sx={{ height: 150, width: 150 }}
              onClick={() => {navigate("/"); }}
            />
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "right" }}>
              {user ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: "white" }}>{user.fullName}</Typography>
                  <Button
                    color="inherit"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    Déconnexion
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Button color="inherit" onClick={handleMenuOpen}>
                    Accès
                  </Button>
                  <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
                    <MenuItem onClick={() => handleNavigate("/login")}>Connexion</MenuItem>
                    <MenuItem onClick={() => handleNavigate("/registerAssociation")}>Inscription membre</MenuItem>
                    <MenuItem onClick={() => handleNavigate("/register")}>Inscription adhérent</MenuItem>
                  </Menu>
                </Box>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
          <Footer />
    </Box>
    
  );
}




