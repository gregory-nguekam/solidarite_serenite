import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function HomePage() {
  return (
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Stack spacing={4} alignItems="center" textAlign="left">
          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
            Solidarité et Sérénité
          </Typography>

          <Typography sx={{ maxWidth: 1080, opacity: 0.85, fontSize: 18 }}>
            Un ensemble d’associations communautaires de l'Ouest se sont regroupées pour mettre en place une mutuelle pour garantir le rapatriement en cas de décès d’un membre ou d’un parent
          </Typography>


          {/* <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
            >
              Se connecter
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              size="large"
            >
              Créer un compte
            </Button>
          </Stack> */}

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ width: "100%", mt: 3 }}
          >
            <Card sx={{ flex: 1 }}>
              <CardActionArea component={RouterLink} to="/login">
                <CardContent>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>
                    Connexion
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    Vous pourrez vous connecter en tant que responsable que membre ou adhérent
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardActionArea component={RouterLink} to="/register">
                <CardContent>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>
                    Inscription membre
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    Inscription d'une association, d'un groupe ou d'une famille.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardActionArea component={RouterLink} to="/registerAssociation">
                <CardContent>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>
                    Inscription direct
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    Inscription d'une personne physique. Vous pourrez par la suite être affilié à une association ou un groupe..
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Stack>
        </Stack>
      </Container>


    </Box>
  );
}
