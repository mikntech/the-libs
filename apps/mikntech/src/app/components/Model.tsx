import {
  Box,
  CardActions,
  Container,
  Grid2,
  Typography,
  useTheme,
} from "@mui/material";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import { cloneElement } from "react";
import { grey } from "@mui/material/colors";
import CardContent from "@mui/material/CardContent";

// CardComponent for Pricing Tiers
const CardComponent = ({ tier, theme }) => (
  <Card
    sx={{
      p: 2,
      display: "flex",
      flexDirection: "column",
      gap: 4,
      backgroundColor: theme.palette.mode === "dark" ? grey[900] : grey[100],
      boxShadow: 3,
      color: theme.palette.text.primary,
    }}
  >
    <CardContent>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
        }}
      >
        {cloneElement(tier.icon, {
          sx: {
            color:
              theme.palette.mode === "dark"
                ? tier.icon.props.sx?.color || "primary.light"
                : tier.icon.props.sx?.color || "primary.main",
          },
        })}
        <Typography component="h3" variant="h6">
          {tier.title}
        </Typography>
      </Box>

      <Divider sx={{ my: 1, opacity: 0.8, borderColor: "divider" }} />

      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
        }}
      >
        <Grid2
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          height="100px"
          marginBottom="-50px"
        >
          <Grid2 height="50%">
            <Typography component="h3" variant="h5">
              {tier.hours} hours/month:
            </Typography>
          </Grid2>
          <Grid2 height="50%">
            <Typography component="h3" variant="h4">
              {tier.price} ₪/h
            </Typography>
          </Grid2>
        </Grid2>
      </Box>
    </CardContent>

    <CardActions>
      <Button fullWidth variant={tier.buttonVariant} color={tier.buttonColor}>
        {tier.buttonText}
      </Button>
    </CardActions>
  </Card>
);

// Pricing Tiers Data
const tiers = [
  {
    title: "Consultation",
    hours: "3-10",
    price: "599",
    buttonText: "Get Started",
    buttonVariant: "outlined",
    buttonColor: "primary",
    icon: <WorkIcon />,
  },
  {
    title: "Mentorship",
    hours: "11-30",
    price: "499",
    buttonText: "Get Started",
    buttonVariant: "outlined",
    buttonColor: "primary",
    icon: <SchoolIcon />,
  },
  {
    title: "Mentorship",
    hours: "31-50",
    price: "399",
    buttonText: "Get Started",
    buttonVariant: "outlined",
    buttonColor: "primary",
    icon: <SchoolIcon />,
  },
  {
    title: "Contribution",
    hours: "51-100",
    price: "349",
    buttonText: "Get Started",
    buttonVariant: "outlined",
    buttonColor: "primary",
    icon: <VolunteerActivismIcon />,
  },
  {
    title: "Contribution",
    hours: "101-150",
    price: "299",
    buttonText: "Get Started",
    buttonVariant: "outlined",
    buttonColor: "primary",
    icon: <VolunteerActivismIcon />,
  },
];

// Main Pricing Component
export default function Pricing() {
  const theme = useTheme();

  return (
    <Container
      id="pricing"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 3, sm: 6 },
      }}
    >
      {/* Pricing Section */}
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
        }}
      >
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: theme.palette.text.primary }}
        >
          Pricing
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          Unlock the full potential of your project through efficient, modular
          development. Whether you need consultation, mentorship, or
          contributions to specific modules, we provide shared, reusable code to
          accelerate development while minimizing costs.
        </Typography>
      </Box>

      <Grid2
        container
        spacing={3}
        sx={{ alignItems: "center", justifyContent: "center", width: "100%" }}
      >
        {tiers.map((tier) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={tier.title + tier.hours}>
            <CardComponent tier={tier} theme={theme} />
          </Grid2>
        ))}
      </Grid2>

      {/* @the-libs and Flexible Model Section */}
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
          mt: 4,
        }}
      >
        <Typography component="h3" variant="h5" gutterBottom>
          @the-libs: Scalable, Shared, and Efficient
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          At the core of our service is flexibility and cost efficiency. You
          only pay for the hours you need, benefiting from shared libraries. Our
          approach ensures maximum code in libraries and minimal in
          applications, allowing for faster, more adaptable solutions.
          <br />
          <br />
          We offer <b>five pricing tiers</b> with two flexible IP models,
          designed to minimize costs and adapt to your unique project. Whether
          self-funded, pre-funded, or in early R&D/POC stages, our shared
          module-based service reduces development time.
        </Typography>
      </Box>

      {/* Contract Section */}
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
          mt: 6,
        }}
      >
        <Typography component="h3" variant="h5" gutterBottom>
          Contract & Model Details
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          Our model is designed with flexibility in mind, offering two distinct
          approaches to hours management and intellectual property (IP) control.
          <br />
          <br />
          The <b>Consultation/Mentorship</b> model focuses on dedicating all
          hours to team meetings, reviews, interviews, and collaborative
          sessions. In this model, direct access to the code repository is not
          required, ensuring a streamlined and structured development process
          guided by expert input.
          <br />
          <br />
          Alternatively, the <b>Contribution</b> model offers a more hands-on
          approach, where all hours are spent directly within the
          customer&apos;s Git workflow. This enables tighter integration with
          ongoing development efforts. Post-delivery, the work can be further
          refined and made generic on our time, with the possibility of being
          open-sourced, subject to specific branding and confidentiality
          requirements.
        </Typography>
      </Box>

      {/* @the-libs Section */}
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
          mt: 4,
        }}
      >
        <Typography component="h3" variant="h5" gutterBottom>
          @the-libs: Scalable, Shared, and Efficient
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          At the heart of our development process is a set of reusable
          libraries, carefully designed to maximize efficiency and minimize
          redundancy. These libraries follow a{" "}
          <b>blackbox package/product-oriented</b> approach, meaning you can
          focus on the core functionality while shared features are abstracted
          into well-maintained modules.
          <br />
          <br />
          Our libraries are built with the majority of code residing in shared
          libraries, leaving minimal project-specific code in the applications.
          This structure promotes scalability, efficiency, and faster
          development cycles across multiple projects.
          <br />
          <br />
          <b>Key Maintenance Principles</b>:
          <br />
          <b>Never Contain Commercial Secrets</b>: Libraries are clean, free of
          confidential business data, making them safe for wide reuse without
          risking proprietary information.
          <br />
          <b>Minor Updates for Flexibility</b>: Designed for minimal disruption,
          allowing seamless updates without requiring major rewrites.
          <br />
          <b>Blackbox-Oriented Development</b>: Each library functions as a
          &quot;blackbox&quot; module. Users interact only with the exposed API,
          ensuring ease of use.
          <br />
          <b>Focused on Shared Features</b>: Prioritized by shared, reusable
          components across applications, ensuring efficiency and consistency.
          <br />
          <b>No Branded Info</b>: All code is generic, without any branding,
          allowing reuse across projects without custom modifications.
        </Typography>
      </Box>
    </Container>
  );
}
