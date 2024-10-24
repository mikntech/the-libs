import { Grid2, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: "100%",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
        ...theme.applyStyles("dark", {
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
        }),
      })}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: "center", width: { xs: "100%", sm: "70%" } }}
        >
          <Typography
            variant="h1"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              fontSize: "clamp(3rem, 10vw, 3.5rem)",
              whiteSpace: { xs: "normal", sm: "nowrap" }, // Wrap on small screens, no-wrap on larger
            }}
          >
            Don’t&nbsp;buy&nbsp;dreams.&nbsp;
            <Typography
              component="span"
              variant="h1"
              sx={(theme) => ({
                fontSize: "inherit",
                color: "primary.main",
                whiteSpace: { xs: "normal", sm: "nowrap" }, // Same here
                ...theme.applyStyles("dark", {
                  color: "primary.light",
                }),
              })}
            >
              Build them.
            </Typography>
          </Typography>

          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%" },
            }}
            variant="h6"
          >
            We don’t sell dreams—we provide the tools to build them!
          </Typography>
          <Grid2 container direction="column" rowSpacing={2}>
            <Grid2 width="100%">
              <Box sx={{ boxShadow: 3, p: 3, borderRadius: 2 }}>
                <Typography variant="h6" textAlign="center">
                  @the-libs
                </Typography>
                <Typography textAlign="center">
                  Our open-source boilerplate code is freely accessible, ready
                  for you to use.
                </Typography>
              </Box>
            </Grid2>
            <Grid2 width="100%">
              <Box sx={{ boxShadow: 3, p: 3, borderRadius: 2 }}>
                <Typography variant="h6" textAlign="center">
                  MikNTech
                </Typography>
                <Typography textAlign="center">
                  If you are seeking efficient service, our experts are here to
                  guide you step by step, offering flexible, budget-friendly
                  solutions.
                </Typography>
              </Box>
            </Grid2>
          </Grid2>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: "100%", sm: "350px" } }}
          >
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ minWidth: "fit-content" }}
            >
              Explore @the-libs
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ minWidth: "fit-content" }}
            >
              Learn More About MikNTech
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
