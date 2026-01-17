import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Card, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate("/app/associations");
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message
        : "Échec de connexion.";
      setError(message);
    } finally {
      setLoading(false);
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
        </CardContent>
      </Card>
    </Box>
  );
}
