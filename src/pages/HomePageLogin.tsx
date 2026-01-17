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

          <Typography sx={{ maxWidth: 820, opacity: 0.85, fontSize: 18 }}>
            Un ensemble d’associations communautaires de l'Ouest se sont regroupées pour mettre en place une mutuelle pour garantir le rapatriement en cas de décès d’un membre ou d’un parent 
          </Typography>

          <Typography sx={{ maxWidth: 820, opacity: 0.85, fontSize: 18 }}>
            Plateforme de gestion des adhésions, associations et groupes, avec accès
            sécurisé selon vos permissions.
          </Typography>

          <Typography sx={{ maxWidth: 1080, opacity: 0.85, fontSize: 18 }}>
            Notre objectif est de fournir plusieurs services : <br />
            - Soutien Financier mettre à disposition de la famille une enveloppe de l’ordre de 10 mil euros pour couvrir les frais de rapatriement <br />
            - ⁠Soutien Organisationnel une enveloppe supplémentaire de l ordre de 2000 euros pour frais d’ organisation de veillées en France. <br />
            - ⁠Soutien Moral à travers les associations Communautaires  <br />
            - ⁠Au fur et à mesure : des services administratifs , logistiques  jusqu’au village. <br />

            Modalité: <br />
            - Frais d’adhésion 100 euros Unique<br />
            - ⁠contribution annuelle 10 euros qui va baisser progressivement <br />


            Comment s inscrit on ? <br />
            L’Inscription  ouverte: <br />
            - chaque camerounais peut adhérer directement <br />
            - ⁠une famille<br />
            - ⁠un groupe<br />
            - ⁠Une association <br />
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
              <CardActionArea component={RouterLink} to="/roles">
                <CardContent>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>
                    Accès par rôle
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    L’interface s’adapte au profil : visiteur, membre,
                    administrateur.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardActionArea component={RouterLink} to="/admin">
                <CardContent>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>
                    Administration & Gestion
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    Consultation des informations et gestion des adhérents selon
                    droits.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardActionArea component={RouterLink} to="/tracabilite">
                <CardContent>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>
                    Traçabilité
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    Base solide pour brancher Spring Boot + JWT et audit des
                    actions.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardActionArea component={RouterLink} to="/register">
                <CardContent>
                  <Typography sx={{ fontWeight: 900, mb: 1 }}>
                    Inscription
                  </Typography>
                  <Typography sx={{ opacity: 0.85 }}>
                    Inscription des adhérent et membres.
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
