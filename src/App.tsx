import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AppLayout } from "./ui/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AssociationsPage from "./pages/AssocationsPage";
import AssociationDetailsPage from "./pages/AssociationDetailsPage";
import { Alert, Box, CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import HomePage from "./pages/HomePage";
import HomePageLogin from "./pages/HomePageLogin";
import RegisterAssociationPage from "./pages/RegisterAssociationPage";

const theme = createTheme({
  palette: {
    primary: {
      main: "#52a447",
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="*" element={<HomePage />} />
              <Route path="/homeLogin" element={<HomePageLogin />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/registerAssociation" element={<RegisterAssociationPage />} />
            </Route>
            <Route
              path="/app"
              element={
                <ProtectedRoute minRole="VISITOR">
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="associations" element={<AssociationsPage />} />
              <Route path="associations/:id" element={<AssociationDetailsPage />} />
            </Route>

            <Route
              path="/unauthorized"
              element={
                <Box sx={{ p: 4 }}>
                  <Alert severity="warning">Accès non autorisé.</Alert>
                </Box>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
