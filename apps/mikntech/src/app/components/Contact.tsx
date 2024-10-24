import { Box, Container, Grid, TextField, Typography } from "@mui/material";
import { useState } from "react";
import Button from "@mui/material/Button";

const Contact = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Contact Me</Typography>

        <form
          action="https://formsubmit.co/michael@mikntech.com" // Replace with your email address
          method="POST"
        >
          <Grid container spacing={2}>
            {/* Name Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                variant="outlined"
                name="name" // This is important for FormSubmit to capture the field
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>

            {/* Email Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                name="email" // Name attribute for FormSubmit
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>

            {/* Message Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message (Optional)"
                variant="outlined"
                multiline
                rows={4}
                name="message" // Name attribute for FormSubmit
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Optional: Calendly Link */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Schedule a Meeting</Typography>
          <a
            href="https://calendly.com/your-calendly-username" // Replace with your Calendly link
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a time with me on Calendly
          </a>
        </Box>
      </Box>
    </Container>
  );
};

export default Contact;
