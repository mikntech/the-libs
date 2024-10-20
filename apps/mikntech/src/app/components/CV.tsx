import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Card,
  CardContent,
} from "@mui/material";

export default function CV() {
  return (
    <Container maxWidth="lg">
      {/* Contact Information */}
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4">Michael Nusair</Typography>
        <Typography variant="h6">
          Full-Stack Developer & Entrepreneur
        </Typography>
        <Typography>
          <Link href="mailto:MNPCMW6444@gmail.com">MNPCMW6444@gmail.com</Link> |
          <Link href="https://linkedin.com/in/michael-nx" target="_blank">
            {" "}
            LinkedIn
          </Link>
        </Typography>
        <Typography variant="body2">Email: michael@miknteh.com</Typography>
      </Box>

      {/* Experience Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Experience</Typography>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">
              IAF - Full-Stack Web Developer (2022-2024)
            </Typography>
            <Typography variant="body1">
              Developed a real-time aerial picture and air defense control
              system at Ofek 324 Unit. The system is a Web UI based on more than
              30 microservices, using Cesium, DeckGL, AngularJS → React, and
              Redux. I was responsible for implementing a new feature requiring
              4 new services and full integration with UX specifications.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">IAF - Product Manager (2021)</Typography>
            <Typography variant="body1">
              Managed the development and integration process for new systems in
              the air control division, representing hundreds of operational
              users while driving the product forward.
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Ventures Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">My Ventures</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">CubeBox</Typography>
                <Typography variant="body2">
                  Transforms the home buying journey into an engaging and
                  personalized experience using Node, Express, and React.
                </Typography>
                <Link href="https://cubebox.co.il" target="_blank">
                  cubebox.co.il
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Offisito</Typography>
                <Typography variant="body2">
                  A marketplace for office subleasing with UIs for guests,
                  hosts, and admins, built using Nx monorepo, ECS, S3, and
                  MongoDB.
                </Typography>
                <Link href="https://offisito.com" target="_blank">
                  offisito.com
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">CoupleLink</Typography>
                <Typography variant="body2">
                  Controlled chat for couples with an AI bot as the middleman
                  for therapy use, implemented using OpenAI, GraphQL, and
                  MongoDB.
                </Typography>
                <Link href="https://couple-link.com/lp" target="_blank">
                  couple-link.com/lp
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Failean/Scailean - AI Accelerator
                </Typography>
                <Typography variant="body2">
                  Web apps for startup acceleration and business plan generation
                  using AI, with Express, GraphQL, and custom analytics,
                  deployed on AWS and Azure.
                </Typography>
                <Link href="https://t.ly/d-8BY" target="_blank">
                  failean
                </Link>{" "}
                /{" "}
                <Link href="https://t.ly/iDNwf" target="_blank">
                  scailean
                </Link>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Neurobica</Typography>
                <Typography variant="body2">
                  Developed proof of concept for neurotech startup using the
                  MERN stack and BrainJS for ML, managing the R&D team for MVP
                  development.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Skills Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Skills</Typography>
        <Typography variant="body1">
          React, MUI, NodeJS, ExpressJS, GraphQL, TypeScript, Nx (monorepo),
          Redux, RxJS, SSE, WebSocket, MongoDB, Redis, PubSub, Bull, Docker,
          AWS, Azure, GCP, Geocoding, Python, Selenium, and more.
        </Typography>
      </Box>

      {/* Languages Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Languages</Typography>
        <Typography variant="body1">English - Native</Typography>
        <Typography variant="body1">Hebrew - Native</Typography>
      </Box>

      {/* Education Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Education</Typography>
        <Typography variant="body1">
          Open University: Computer Science B.Sc (50% completed)
        </Typography>
        <Typography variant="body1">
          See-Security College: Cybersecurity Intro and Network Administration,
          SOC Tier 1 Certified
        </Typography>
        <Typography variant="body1">LPI: Linux Essentials Certified</Typography>
      </Box>

      {/* About Me Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">About Me</Typography>
        <Typography variant="body1">
          I am a problem solver, full-stack developer, and entrepreneur. Open to
          hands-on roles or leadership positions in web, security research, ML,
          or Web3. I started as a product manager before transitioning into
          development, training through IAF and independent learning.
        </Typography>
      </Box>
    </Container>
  );
}
