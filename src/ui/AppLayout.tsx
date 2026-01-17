import { AppBar, Box, Button, Container, Toolbar } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Footer } from "./Footer";

export function AppLayout() {
  const { user, /*logout*/ } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#52a447",
      }}
    >
      <AppBar position="static" sx={{ bgcolor: "green" }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box
              component="img"
              src="/logo1.png"
              alt="Solidarité & sérénité"
              sx={{ height: 100, width: 100 }}
              onClick={() => {navigate("/"); }}
            />
            <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "right" }}>
              {user && (
                <Box>
                  {/* <Typography sx={{ mr: 2, opacity: 0.9 }}>
                    {user.fullName}
                  </Typography> */}
                  <Button
                    color="inherit"
                    onClick={() => {
                      navigate("/login");
                    }}
                  >
                    Connexion
                  </Button>
                  {/* <Button color="inherit" onClick={() => { logout(); navigate("/login"); }}>
                    Déconnexion
                  </Button> */}
                </Box>
              )}
            </Box>
            <Box
              component="img"
              src="/logo2.png"
              alt="Solidarité & sérénité"
              sx={{ height: 100, width: 100 }}
            />
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
