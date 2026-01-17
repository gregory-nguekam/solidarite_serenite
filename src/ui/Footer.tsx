import {
  Box,
  Container,
  Grid,
  IconButton,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { Link as RouterLink } from "react-router-dom";

type FooterLink = { label: string; to: string; highlight?: boolean };

const usefulLinks: FooterLink[] = [
  { label: "Inscription", to: "/register", highlight: true },
  { label: "FAQ", to: "/faq" },
  { label: "Contactez-nous", to: "/contact" },
];

export function Footer() {
  const footerLinkSx = { lineHeight: 1.2, py: 0.2 };

  return (
    <Box
      component="footer"
      sx={{
        mt: 0,
        mb: 0,
        bgcolor: "green",
        borderTop: "1px solid rgba(25, 45, 90, 0.12)",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 2, md: 3 } }}
      >
        <Grid
          container
          spacing={{ xs: 3, md: 5 }}
          alignItems="flex-start"
          sx={{
            justifyContent: { xs: "flex-start", md: "space-evenly" },
          }}
        >
          {/* LEFT - Social icons */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography sx={{ fontWeight: 800, color: "#000000", mb: 1 }}>
              Suivez-nous
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                aria-label="WhatsApp"
                href="https://www.whatsapp.com"
                target="_blank"
                rel="noreferrer"
                sx={{
                  bgcolor: "rgba(25, 45, 90, 0.06)",
                  "&:hover": { bgcolor: "rgba(25, 45, 90, 0.12)" },
                }}
              >
                <WhatsAppIcon />
              </IconButton>
              <IconButton
                aria-label="Telegram"
                href="https://telegram.org"
                target="_blank"
                rel="noreferrer"
                sx={{
                  bgcolor: "rgba(25, 45, 90, 0.06)",
                  "&:hover": { bgcolor: "rgba(25, 45, 90, 0.12)" },
                }}
              >
                <TelegramIcon />
              </IconButton>
              <IconButton
                aria-label="Facebook"
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                sx={{
                  bgcolor: "rgba(25, 45, 90, 0.06)",
                  "&:hover": { bgcolor: "rgba(25, 45, 90, 0.12)" },
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="LinkedIn"
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                sx={{
                  bgcolor: "rgba(25, 45, 90, 0.06)",
                  "&:hover": { bgcolor: "rgba(25, 45, 90, 0.12)" },
                }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                aria-label="YouTube"
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
                sx={{
                  bgcolor: "rgba(25, 45, 90, 0.06)",
                  "&:hover": { bgcolor: "rgba(25, 45, 90, 0.12)" },
                }}
              >
                <YouTubeIcon />
              </IconButton>
            </Stack>
          </Grid>

          {/* CENTER - Useful links */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography sx={{ fontWeight: 800, color: "", mb: 1 }}>
              Liens utiles
            </Typography>

            <Stack spacing={0.8}>
              {usefulLinks.map((l) => (
                <MuiLink
                  key={l.label}
                  component={RouterLink}
                  to={l.to}
                  underline="none"
                  sx={{
                    fontWeight: 700,
                    color: l.highlight ? "#d4583a" : "#000000",
                    "&:hover": { textDecoration: "underline" },
                    width: "fit-content",
                    ...footerLinkSx,
                  }}
                >
                  {l.label}
                </MuiLink>
              ))}
            </Stack>
          </Grid>

          {/* RIGHT - Contact */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography sx={{ fontWeight: 800, color: "#000000", mb: 1 }}>
              Contact
            </Typography>

            <Stack spacing={1.4}>

              <Stack direction="row" spacing={1.2} alignItems="center">
                <PhoneIcon sx={{ color: "#5a6b8a" }} />
                <MuiLink
                  href="tel:+3310277495"
                  underline="none"
                  sx={{ fontWeight: 800, color: "#000000", ...footerLinkSx }}
                >
                  +33 1 86 86 00 28
                </MuiLink>
              </Stack>

              <Stack direction="row" spacing={1.2} alignItems="center">
                <EmailIcon sx={{ color: "#5a6b8a" }} />
                <Typography sx={{ fontWeight: 800, color: "#000000" }}>
                  &nbsp;
                  <MuiLink
                    href="mailto:contact@retourserein.org"
                    underline="none"
                    sx={{ fontWeight: 800, color: "#000000", ...footerLinkSx }}
                  >
                    contact@retourserein.org
                  </MuiLink>
                </Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
