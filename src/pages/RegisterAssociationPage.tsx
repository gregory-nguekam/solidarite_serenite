import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { registerMembre } from "../api/auth";

const typeOptions = ["ASSOCIATION", "GROUPE", "FAMILLE"] as const;

const schema = z.object({
  type: z.enum(typeOptions),
  nom: z.string().min(2).max(50),
  initiales: z.string().min(1).max(50),
  email: z.string().email(),
  telephone: z.string().min(6).max(20),
  numero_rue: z.string().min(1),
  rue: z.string().min(5),
  code_postal: z.string().min(5),
  ville: z.string().min(5),
  complement_adresse: z.string().optional(),
  centreInteret: z.string().max(100).optional(),
  deleguePrincipal: z.string().min(2).max(50),
  delegueAdjoint1: z.string().max(50).optional(),
  delegueAdjoint2: z.string().max(50).optional(),
  delegueAdjoint3: z.string().max(50).optional(),
  siret: z
    .instanceof(File, { message: "Fichier requis" })
    .refine((file) => file.size > 0, "Fichier requis"),
  listeAdherents: z
    .instanceof(File, { message: "Fichier requis" })
    .refine((file) => file.size > 0, "Fichier requis"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterAssociationPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "ASSOCIATION",
    },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("nom", data.nom);
      formData.append("initiales", data.initiales);
      formData.append("email", data.email);
      formData.append("telephone", data.telephone);
      formData.append("adresse.numeroRue", data.numero_rue);
      formData.append("adresse.rue", data.rue);
      formData.append("adresse.codePostal", data.code_postal);
      formData.append("adresse.ville", data.ville);
      if (data.complement_adresse) {
        formData.append("adresse.complement", data.complement_adresse);
      }
      if (data.centreInteret) {
        formData.append("centreInteret", data.centreInteret);
      }
      formData.append("deleguePrincipal", data.deleguePrincipal);
      if (data.delegueAdjoint1) {
        formData.append("delegueAdjoint1", data.delegueAdjoint1);
      }
      if (data.delegueAdjoint2) {
        formData.append("delegueAdjoint2", data.delegueAdjoint2);
      }
      if (data.delegueAdjoint3) {
        formData.append("delegueAdjoint3", data.delegueAdjoint3);
      }
      formData.append("siret", data.siret);
      formData.append("listeAdherents", data.listeAdherents);

      await registerMembre(formData);
      setSuccess(
        "Votre inscription a bien ete prise en compte. Un email a ete envoye pour confirmer que votre inscription est en cours de validation."
      );
    } catch (submitError) {
      const message = submitError instanceof Error && submitError.message
        ? submitError.message
        : "Echec d'inscription.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", mt: 4 }}>
      <Card sx={{ width: "100%", maxWidth: 900 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Inscription Association / Groupe / Famille
          </Typography>
          <Typography sx={{ opacity: 0.8, mb: 3 }}>
            Creez un compte et televersez vos justificatifs.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "grid", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    disablePortal
                    disableClearable
                    options={typeOptions}
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Type"
                        fullWidth
                        error={!!errors.type}
                        helperText={errors.type?.message}
                      />
                    )}
                  />
                )}
              />
              <TextField label="Nom" {...register("nom")} error={!!errors.nom} helperText={errors.nom?.message} />
              <TextField
                label="Initiales"
                {...register("initiales")}
                error={!!errors.initiales}
                helperText={errors.initiales?.message}
              />
              <TextField
                label="Telephone"
                {...register("telephone")}
                error={!!errors.telephone}
                helperText={errors.telephone?.message}
              />
              <TextField
                label="Numero rue"
                {...register("numero_rue")}
                error={!!errors.numero_rue}
                helperText={errors.numero_rue?.message}
              />
              <TextField label="Rue" {...register("rue")} error={!!errors.rue} helperText={errors.rue?.message} />
              <TextField
                label="Complement d'adresse"
                {...register("complement_adresse")}
                error={!!errors.complement_adresse}
                helperText={errors.complement_adresse?.message}
              />
              <TextField
                label="Code postal"
                {...register("code_postal")}
                error={!!errors.code_postal}
                helperText={errors.code_postal?.message}
              />
              <TextField label="Ville" {...register("ville")} error={!!errors.ville} helperText={errors.ville?.message} />
              <TextField label="Email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
              <TextField
                label="Centre d'interet"
                {...register("centreInteret")}
                error={!!errors.centreInteret}
                helperText={errors.centreInteret?.message}
              />
              <TextField
                label="Delegue principal"
                {...register("deleguePrincipal")}
                error={!!errors.deleguePrincipal}
                helperText={errors.deleguePrincipal?.message}
              />
              <TextField
                label="Delegue adjoint 1"
                {...register("delegueAdjoint1")}
                error={!!errors.delegueAdjoint1}
                helperText={errors.delegueAdjoint1?.message}
              />
              <TextField
                label="Delegue adjoint 2"
                {...register("delegueAdjoint2")}
                error={!!errors.delegueAdjoint2}
                helperText={errors.delegueAdjoint2?.message}
              />
              <TextField
                label="Delegue adjoint 3"
                {...register("delegueAdjoint3")}
                error={!!errors.delegueAdjoint3}
                helperText={errors.delegueAdjoint3?.message}
              />
            </Box>

            <Box sx={{ display: "grid", gap: 1 }}>
              <Typography sx={{ fontWeight: 700 }}>SIRET</Typography>
              <Controller
                name="siret"
                control={control}
                render={({ field }) => (
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    ref={field.ref}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      field.onChange(file);
                    }}
                  />
                )}
              />
              {errors.siret && <Typography color="error">{errors.siret.message}</Typography>}
              <Typography sx={{ fontWeight: 700, mt: 1 }}>Liste adherents</Typography>
              <Controller
                name="listeAdherents"
                control={control}
                render={({ field }) => (
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    ref={field.ref}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      field.onChange(file);
                    }}
                  />
                )}
              />
              {errors.listeAdherents && <Typography color="error">{errors.listeAdherents.message}</Typography>}
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? <CircularProgress size={22} /> : "Creer le compte"}
            </Button>
            {success && <Alert severity="success">{success}</Alert>}

            <Typography sx={{ mt: 1, opacity: 0.9 }}>
              Deja un compte ? <Link to="/login">Se connecter</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
