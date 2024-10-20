export const signupreq = (url: string) => ({
    subject: "Complete Your Failean Account Setup",
    body: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Complete Your Failean Account Setup</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-sizing: border-box;
        }
        .header, .footer {
            background-color: #8A307F;
            color: white;
            text-align: center;
            padding: 10px;
        }
        .content {
            padding: 20px;
        }
        a.activate-button {
            background-color: #8A307F;  /* Changed to match your brand color */
            color: #ffffff;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 20px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }
            .content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>Welcome to Failean</h2>
    </div>

    <div class="content">
        <p>Hello,</p>
        <p>We're excited that you've chosen to join Failean, the platform that supports a smarter approach to entrepreneurship. Before you dive in, please complete your account setup.</p>
        
        <a href="${url}" class="activate-button">Complete Setup</a>

        <p>If this wasn't you, please ignore this email.</p>

        <h3>Your Thoughts Matter</h3>
        <p>We value your insights as we continually strive to improve. Once you've had a chance to use our platform, we'd appreciate your feedback. Feel free to reply to this email with your thoughts.</p>
        
        <p>Best wishes,<br><strong>The Failean Team</strong></p>
    </div>

    <div class="footer">
        <p>Unsubscribe | &copy; 2023 Failean LLC, All rights reserved.</p>
    </div>
</div>
</body>
</html>
  `,
});

export const passreset = (url: string) => ({
    subject: "Reset Your Password - Failean",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Failean</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-sizing: border-box;
        }
        .header, .footer {
            background-color: #8A307F;
            color: white;
            text-align: center;
            padding: 10px;
        }
        .content {
            padding: 20px;
        }
        a.button {
            background-color: #8A307F; /* Updated to match brand color */
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 20px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }
            .content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h2>Password Reset Instructions</h2>
    </div>

    <div class="content">
        <p>Hello,</p>

        <p>We've received a request to reset your Failean account password. If this was you, please click the button below to set up a new password:</p>

        <a href="${url}" class="button">Reset Password</a>

        <p>If you didn't initiate this request, you can safely ignore this email or contact our support.</p>

        <p>Warm regards,<br><strong>The Failean Team</strong></p>
    </div>

    <div class="footer">
        <p>Unsubscribe | &copy; 2023 Failean LLC, All rights reserved.</p>
    </div>
</div>

</body>
</html>
    `,
});

export const websiteSignup = (url: string) => ({
    subject: "Complete Your Registration at Failean",
    body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Your Registration at Failean</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-sizing: border-box;
        }
        .header, .footer {
            background-color: #8A307F;
            color: white;
            text-align: center;
            padding: 10px;
        }
        .content {
            padding: 20px;
        }
        a {
            color: blue;
        }
        a.button {
            background-color: #8A307F; /* Changed to match your brand color */
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 5px;
            display: inline-block;
            margin-bottom: 20px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }
            .content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>Thank You for Choosing Failean</h2>
    </div>

    <div class="content">
        <p>Hello,</p>
        <p>Welcome to Failean, the platform designed to support innovative thinkers and entrepreneurs like you. To get started, please complete your registration by clicking the button below:</p>

        <a href="${url}" class="button">Complete Registration</a>

        <p>If you didn't intend to join us, you can safely ignore this email.</p>

        <h3>We'd Love Your Input</h3>
        <p>Once you've had a chance to use Failean, we'd appreciate hearing your thoughts. Feel free to reply to this email with your feedback.</p>

        <p>Warm regards,<br><strong>The Failean Team</strong></p>
    </div>

    <div class="footer">
        <p>Unsubscribe | &copy; 2023 Failean LLC, All rights reserved.</p>
    </div>
</div>
</body>
</html>
  `,
});

export const waitListReady = (name: string) => ({
    subject: "Early Access Activation: Start Exploring Now",
    body: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Early Access Activation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-sizing: border-box;
        }
        .header, .footer {
            background-color: #8A307F;
            color: white;
            text-align: center;
            padding: 10px;
        }
        .content {
            padding: 20px;
        }
        a {
            color: blue;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 15px;
            }
            .content {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>Start Your Early Access Journey Today</h2>
    </div>

    <div class="content">
        <p>Hello ${name === "Unknown" ? "there" : name},</p>

        <p>We hope this message finds you in good spirits. This is Michael, CEO of Failean LLC, and we're thrilled to announce your early access activation to our anticipated new offering.</p>

        <p>You can begin your journey by signing up at <a href="https://failean.com">failean.com</a>.</p>

        <h3>Complimentary User Credits</h3>
        <p>As a token of appreciation, you will start with 10,000 credits, offering you an extended experience.</p>

        <h3>Feedback Guidelines</h3>
        <ol>
            <li>Discover the features step-by-step.</li>
            <li>Opt for individual prompts for optimal results.</li>
            <li>Share your thoughts on the overall experience.</li>
            <li>If you have any feedback or questions, reply to this email.</li>
        </ol>

        <p>Your input is essential to us, and we're eager to hear from you.</p>

        <p>Best wishes,<br>Michael<br>CEO, Failean LLC</p>
    </div>

    <div class="footer">
        <p>Unsubscribe | &copy; 2023 Failean LLC, All rights reserved.</p>
    </div>
</div>
</body>
</html>
  `,
});
