import { Button, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { associations } from "../api/mock";
import { useAuth } from "../auth/AuthContext";
import { hasAtLeastRole } from "../auth/roles";

export default function AssociationsPage() {
  const { user } = useAuth();
  const canManage = user ? hasAtLeastRole(user.role, "MEMBER") : false;

  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
        Associations / Groupes / Familles
      </Typography>

      <Grid container spacing={2}>
        {associations.map((a) => (
          <Grid size={{ xs: 12, md: 6 }} key={a.id}>
            <Card>
              <CardContent>
                <Typography sx={{ fontWeight: 800 }}>{a.name}</Typography>
                <Typography sx={{ opacity: 0.8 }}>{a.city} • {a.membersCount} membres</Typography>
                <Chip sx={{ mt: 1 }} label={a.type} />

                <Typography sx={{ mt: 2, opacity: 0.9 }}>{a.description}</Typography>

                <Button component={Link} to={`/app/associations/${a.id}`} sx={{ mt: 2 }}>
                  Consulter
                </Button>

                {canManage && (
                  <Button variant="contained" sx={{ mt: 2, ml: 1 }}>
                    Gérer les adhérents
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
