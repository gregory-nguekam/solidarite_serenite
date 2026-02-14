import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Link } from "react-router-dom";
import { registerAdherent } from "../api/auth";

const schema = z.object({
  nom: z.string().min(2),
  prenom: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caracteres."),
  password_confirm: z.string().min(6, "Veuillez confirmer le mot de passe."),
  telephone: z.string().min(6),
  numero_rue: z.string().min(1),
  rue: z.string().min(5),
  code_postal: z.string().min(5),
  ville: z.string().min(5),
  complement_adresse: z.string().optional(),
  identite: z
    .instanceof(File, { message: "Fichier requis" })
    .refine((file) => file.size > 0, "Fichier requis"),
  justificatif_domicile: z
    .instanceof(File, { message: "Fichier requis" })
    .refine((file) => file.size > 0, "Fichier requis"),
  rib: z
    .instanceof(File, { message: "Fichier requis" })
    .refine((file) => file.size > 0, "Fichier requis"),
  payment_method: z.enum(["paypal", "card", "transfer"], {
    required_error: "Choisissez un mode de paiement.",
  }),
  adhesion_years: z.coerce.number().int().min(1).max(5),
  card_name: z.string().optional(),
  card_number: z.string().optional(),
  card_expiry: z.string().optional(),
  card_cvc: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.password !== data.password_confirm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["password_confirm"],
      message: "Les mots de passe ne correspondent pas.",
    });
  }

  if (data.payment_method !== "card") return;

  if (!data.card_name || data.card_name.trim().length < 2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["card_name"],
      message: "Le nom sur la carte est requis.",
    });
  }
  if (!data.card_number || data.card_number.replace(/\s+/g, "").length < 12) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["card_number"],
      message: "Le numero de carte est invalide.",
    });
  }
  if (!data.card_expiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.card_expiry)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["card_expiry"],
      message: "La date d'expiration est invalide (MM/AA).",
    });
  }
  if (!data.card_cvc || !/^\d{3,4}$/.test(data.card_cvc)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["card_cvc"],
      message: "Le CVC est invalide.",
    });
  }
});

const bankDetails = {
  titulaire: "Association Serenite Solidarite",
  iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
  bic: "XXXXFRPPXXX",
  banque: "Nom de la banque",
};
const ANNUAL_FEE_EUR = 10;
const MEMBERSHIP_OPTIONS = [1, 2, 3, 4, 5];
const subscriptionFee = 100; // Frais fixes de souscription

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      adhesion_years: 1,
    },
  });
  const paymentMethod = watch("payment_method");
  const adhesionYears = watch("adhesion_years") ?? 1;
  const totalAmount = adhesionYears * ANNUAL_FEE_EUR + subscriptionFee;

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("nom", data.nom);
      formData.append("prenom", data.prenom);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("telephone", data.telephone);
      formData.append("adresse.numeroRue", data.numero_rue);
      formData.append("adresse.rue", data.rue);
      formData.append("adresse.codePostal", data.code_postal);
      formData.append("adresse.ville", data.ville);
      if (data.complement_adresse) {
        formData.append("adresse.complement", data.complement_adresse);
      }
      formData.append("identite", data.identite);
      formData.append("justificatifDomicile", data.justificatif_domicile);
      formData.append("rib", data.rib);
      formData.append("adhesionYears", String(data.adhesion_years));
      formData.append("montantTotal", String(data.adhesion_years * ANNUAL_FEE_EUR));

      //await test()
      await registerAdherent(formData);
      setSuccess(
        "Votre inscription a bien ete prise en compte. Un email a ete envoye pour confirmer que votre inscription est en cours de validation."
      );
    } catch (error) {
      const message = error instanceof Error && error.message
        ? error.message 
        : "Echec d'inscription.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "grid", placeItems: "center", mt: 4 }}>
      <Card sx={{ width: "100%", maxWidth: 720 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Inscription Adherent
          </Typography>
          <Typography sx={{ opacity: 0.8, mb: 3 }}>
            Créez un compte et téléversez vos justificatifs.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: "grid", gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Box sx={{ display: "grid", gap: 3 }}>
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  display: "grid",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>Informations personnelles</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    Renseignez vos coordonnees et votre adresse.
                  </Typography>
                </Box>
                <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                  <TextField label="Nom" {...register("nom")} error={!!errors.nom} helperText={errors.nom?.message} />
                  <TextField label="Prénom" {...register("prenom")} error={!!errors.prenom} helperText={errors.prenom?.message} />
                  <TextField label="Téléphone" {...register("telephone")} error={!!errors.telephone} helperText={errors.telephone?.message} />
                  <TextField label="Email" type="email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} />
                  <TextField
                    label="Mot de passe"
                    type="password"
                    autoComplete="new-password"
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                  <TextField
                    label="Confirmer le mot de passe"
                    type="password"
                    autoComplete="new-password"
                    {...register("password_confirm")}
                    error={!!errors.password_confirm}
                    helperText={errors.password_confirm?.message}
                  />
                  <TextField label="Numéro rue" {...register("numero_rue")} error={!!errors.numero_rue} helperText={errors.numero_rue?.message} />
                  <TextField label="Rue" {...register("rue")} error={!!errors.rue} helperText={errors.rue?.message} />
                  <TextField
                    label="Complément d'adresse"
                    {...register("complement_adresse")}
                    error={!!errors.complement_adresse}
                    helperText={errors.complement_adresse?.message}
                  />
                  <TextField label="Code postal" {...register("code_postal")} error={!!errors.code_postal} helperText={errors.code_postal?.message} />
                  <TextField label="Ville" {...register("ville")} error={!!errors.ville} helperText={errors.ville?.message} />
                  
                </Box>
                <Divider />
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700 }}>Pièce d'identité</Typography>
                    <Controller
                      name="identite"
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
                    {errors.identite && <Typography color="error">{errors.identite.message}</Typography>}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, mt: 1 }}>Justificatif de domicile</Typography>
                    <Controller
                      name="justificatif_domicile"
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
                    {errors.justificatif_domicile && <Typography color="error">{errors.justificatif_domicile.message}</Typography>}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, mt: 1 }}>RIB</Typography>
                    <Controller
                      name="rib"
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
                    {errors.rib && <Typography color="error">{errors.rib.message}</Typography>}
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: { xs: 2, md: 3 },
                  display: "grid",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800 }}>Paiement</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.75 }}>
                    Choisissez le mode de paiement pour valider votre adhesion.
                  </Typography>
                </Box>
                <Box sx={{ display: "grid", gap: 1.5 }}>
                  <FormControl error={!!errors.adhesion_years}>
                    <FormLabel>Durée contribution </FormLabel>
                    <Controller
                      name="adhesion_years"
                      control={control}
                      render={({ field }) => (
                        <RadioGroup
                          value={String(field.value ?? 1)}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                          row
                          sx={{ gap: 2 }}
                        >
                          {MEMBERSHIP_OPTIONS.map((years) => (
                            <FormControlLabel
                              key={years}
                              value={String(years)}
                              control={<Radio />}
                              label={`${years} an${years > 1 ? "s" : ""}`}
                            />
                          ))}
                        </RadioGroup>
                      )}
                    />
                    {errors.adhesion_years && <FormHelperText>{errors.adhesion_years.message}</FormHelperText>}
                  </FormControl>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", display: "grid", gap: 0.5 }}>
                    <Typography variant="body2">Cotisation annuelle: {ANNUAL_FEE_EUR} €</Typography>
                    <Typography variant="body2">Frais d'adhesion: {subscriptionFee} €</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Total a regler: {totalAmount} €
                    </Typography>
                  </Box>
                </Box>
                <FormControl error={!!errors.payment_method}>
                  <FormLabel>Mode de paiement</FormLabel>
                  <Controller
                    name="payment_method"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup value={field.value ?? ""} onChange={field.onChange} row sx={{ gap: 2 }}>
                        <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
                        <FormControlLabel value="card" control={<Radio />} label="Carte bancaire" />
                        <FormControlLabel value="transfer" control={<Radio />} label="Virement" />
                      </RadioGroup>
                    )}
                  />
                  {errors.payment_method && <FormHelperText>{errors.payment_method.message}</FormHelperText>}
                </FormControl>
                {paymentMethod === "card" && (
                  <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                    <TextField
                      label="Nom sur la carte"
                      autoComplete="cc-name"
                      sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}
                      {...register("card_name")}
                      error={!!errors.card_name}
                      helperText={errors.card_name?.message}
                    />
                    <TextField
                      label="Numero de carte"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      inputProps={{ inputMode: "numeric" }}
                      sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}
                      {...register("card_number")}
                      error={!!errors.card_number}
                      helperText={errors.card_number?.message}
                    />
                    <TextField
                      label="Date d'expiration (MM/AA)"
                      autoComplete="cc-exp"
                      placeholder="MM/AA"
                      inputProps={{ inputMode: "numeric" }}
                      {...register("card_expiry")}
                      error={!!errors.card_expiry}
                      helperText={errors.card_expiry?.message}
                    />
                    <TextField
                      label="CVC"
                      autoComplete="cc-csc"
                      placeholder="CVC"
                      inputProps={{ inputMode: "numeric" }}
                      {...register("card_cvc")}
                      error={!!errors.card_cvc}
                      helperText={errors.card_cvc?.message}
                    />
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      Vos informations bancaires seront traitees via un prestataire de paiement securise.
                    </Typography>
                  </Box>
                )}
                {paymentMethod === "transfer" ? (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", display: "grid", gap: 1 }}>
                    <Typography variant="subtitle2">Coordonnees bancaires pour votre virement</Typography>
                    <Box sx={{ display: "grid", gap: 0.5, gridTemplateColumns: { xs: "1fr", md: "auto 1fr" } }}>
                      <Typography sx={{ fontWeight: 700 }}>Titulaire</Typography>
                      <Typography>{bankDetails.titulaire}</Typography>
                      <Typography sx={{ fontWeight: 700 }}>IBAN</Typography>
                      <Typography>{bankDetails.iban}</Typography>
                      <Typography sx={{ fontWeight: 700 }}>BIC</Typography>
                      <Typography>{bankDetails.bic}</Typography>
                      <Typography sx={{ fontWeight: 700 }}>Banque</Typography>
                      <Typography>{bankDetails.banque}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                      Merci d'indiquer votre nom dans la reference du virement.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
                    {!paymentMethod && (
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Selectionnez un mode de paiement pour afficher les details.
                      </Typography>
                    )}
                    {paymentMethod === "paypal" && (
                      <Typography variant="body2">
                        Le paiement PayPal vous redirige vers votre compte pour finaliser votre adhesion.
                      </Typography>
                    )}
                    {paymentMethod === "card" && (
                      <Typography variant="body2">
                        Verifiez vos informations de carte avant de finaliser votre adhesion.
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? <CircularProgress size={22} /> : "Créer le compte"}
            </Button>
            {success && <Alert severity="success">{success}</Alert>}

            <Typography sx={{ mt: 1, opacity: 0.9 }}>
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
