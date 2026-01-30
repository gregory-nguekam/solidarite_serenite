import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../api/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});
const resetSchema = z.object({
  email: z.string().email(),
});

type FormData = z.infer<typeof schema>;
type ResetFormData = z.infer<typeof resetSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/homeLogin");
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : "Échec de connexion.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setResetError(null);
    setResetMessage(null);
    setResetLoading(true);
    try {
      await requestPasswordReset(data.email);
      setResetMessage("Si un compte existe pour cet email, un lien de reinitialisation a ete envoye.");
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : "Impossible d'envoyer le lien de reinitialisation.";
      setResetError(message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", mt: 6 }}>
      <Card sx={{ width: "100%", maxWidth: 460 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Connexion
          </Typography>
          <Typography sx={{ opacity: 0.8, mb: 3 }}>
            Accédez à votre espace membre.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
            />
            <TextField
              label="Mot de passe"
              type="password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button type="button" variant="text" size="small" onClick={() => setShowReset((prev) => !prev)}>
                Mot de passe oublie ?
              </Button>
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? <CircularProgress size={22} /> : "Se connecter"}
            </Button>

            <Typography sx={{ mt: 1, opacity: 0.9 }}>
              Pas de compte ? <Link to="/register">Créer un compte</Link>
            </Typography>

            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Astuce démo : admin@demo.com → ADMIN, member@demo.com → MEMBER, autre → VISITOR
            </Typography>
          </Box>
          {showReset && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                display: "grid",
                gap: 1.5,
              }}
            >
              <Typography variant="subtitle2">Reinitialiser le mot de passe</Typography>
              <Typography variant="body2" sx={{ opacity: 0.75 }}>
                Entrez votre email pour recevoir un lien de reinitialisation.
              </Typography>
              {resetError && <Alert severity="error">{resetError}</Alert>}
              {resetMessage && <Alert severity="success">{resetMessage}</Alert>}
              <Box component="form" onSubmit={handleSubmitReset(onResetSubmit)} sx={{ display: "grid", gap: 1.5 }}>
                <TextField
                  label="Email"
                  {...registerReset("email")}
                  error={!!resetErrors.email}
                  helperText={resetErrors.email?.message}
                  autoComplete="email"
                />
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button type="submit" variant="outlined" disabled={resetLoading}>
                    {resetLoading ? <CircularProgress size={20} /> : "Envoyer le lien"}
                  </Button>
                  <Button
                    type="button"
                    variant="text"
                    disabled={resetLoading}
                    onClick={() => {
                      setShowReset(false);
                      setResetError(null);
                      setResetMessage(null);
                    }}
                  >
                    Annuler
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
