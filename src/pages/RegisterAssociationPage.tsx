import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Card, CardContent, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";

const schema = z.object({
  lastName: z.string().min(2),
  firstName: z.string().min(2),
  initials: z.string().max(3),
  email: z.string().email(),
  phone: z.string().min(6),
  street: z.string().min(2),
  zip_code: z.string().min(5),
  hobby: z.string().optional(),
  additional_address_info: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterAssociationPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_: FormData) => {
    // MOCK: on simule juste l’inscription puis redirection login
    navigate("/login");
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", mt: 4 }}>
      <Card sx={{ width: "100%", maxWidth: 720 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Inscription Association / Groupe / Famille
          </Typography>
          <Typography sx={{ opacity: 0.8, mb: 3 }}>
            Créez un compte et téléversez vos justificatifs.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "grid", gap: 2 }}>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
              <TextField label="Nom" {...register("lastName")} error={!!errors.lastName} helperText={errors.lastName?.message}/>
              <TextField label="Prénom" {...register("firstName")} error={!!errors.firstName} helperText={errors.firstName?.message}/>
              <TextField label="Téléphone" {...register("phone")} error={!!errors.phone} helperText={errors.phone?.message}/>
              <TextField label="Email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
              <TextField label="Rue et numéro" {...register("street")} error={!!errors.street} helperText={errors.street?.message} />
              <TextField label="Complément d'adresse" {...register("additional_address_info")} error={!!errors.additional_address_info} helperText={errors.additional_address_info?.message} />
              <TextField label="Code postal" {...register("zip_code")} error={!!errors.zip_code} helperText={errors.zip_code?.message} />
              <TextField label="Centre d'intérêt" {...register("hobby")} error={!!errors.hobby} helperText={errors.hobby?.message} />
  
            </Box>

          
            <Box sx={{ display: "grid", gap: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>Pièce d’identité</Typography>
              <input type="file" accept="image/*,.pdf" />
              <Typography sx={{ fontWeight: 700, mt: 1 }}>Justificatif de domicile</Typography>
              <input type="file" accept="image/*,.pdf" />
              <Typography sx={{ fontWeight: 700, mt: 1 }}>RIB</Typography>
              <input type="file" accept="image/*,.pdf" />
            </Box>

            <Button type="submit" variant="contained" size="large">
              Créer le compte
            </Button>

            <Typography sx={{ mt: 1, opacity: 0.9 }}>
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
