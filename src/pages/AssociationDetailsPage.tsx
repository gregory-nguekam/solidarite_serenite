import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { associations } from "../api/mock";
import { useAuth } from "../auth/AuthContext";
import { hasAtLeastRole } from "../auth/roles";

export default function AssociationDetailsPage() {
  const { id } = useParams();
  const assoc = associations.find(a => a.id === id);
  const { user } = useAuth();

  if (!assoc) return <Alert severity="error">Association introuvable</Alert>;

  const canSeeSensitive = user ? hasAtLeastRole(user.role, "MEMBER") : false;
  const isAdmin = user ? hasAtLeastRole(user.role, "ADMIN") : false;

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>{assoc.name}</Typography>
        <Typography sx={{ opacity: 0.8 }}>{assoc.type} • {assoc.city} • {assoc.membersCount} membres</Typography>

        <Typography sx={{ mt: 2 }}>{assoc.description}</Typography>

        <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {canSeeSensitive ? (
            <>
              <Button variant="contained">Voir la liste des adhérents</Button>
              <Button variant="outlined">Ajouter un adhérent</Button>
            </>
          ) : (
            <Alert severity="info" sx={{ width: "100%" }}>
              Certaines actions sont réservées aux membres connectés.
            </Alert>
          )}

          {isAdmin && <Button color="error" variant="contained">Supprimer l’entité</Button>}
        </Box>
      </CardContent>
    </Card>
  );
}
