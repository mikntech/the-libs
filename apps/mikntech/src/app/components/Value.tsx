import { Box, Container, Typography, useTheme } from "@mui/material";

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
      {/* Tailored Solutions Section */}
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
          mt: 4,
        }}
      >
        <Typography component="h3" variant="h5" gutterBottom>
          Tailored Solutions for Self-Funded, Pre-Funded, and R&D Projects
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          Our service is designed to meet the diverse needs of projects at
          various stages of funding and development. Whether you are
          self-funded, pre-funded, or in the early stages of R&D, we offer
          flexible solutions that maximize value while minimizing costs.
          Leveraging shared libraries, reusable code, and cost-effective pricing
          models, we ensure that your project gets exactly what it needs without
          exceeding your budget.
          <br />
          <br />
          With a focus on pre-built modules and tech stack similarity, we enable
          faster development and a more predictable project lifecycle. Whether
          you&apos;re managing tight budgets, testing multiple startup ideas, or
          need a minimal upfront investment, our service ensures you pay only
          for the hours worked, allowing for maximum flexibility and control.
          <br />
          <br />
          The perfect solution for any low-budget project, especially those that
          can take advantage of pre-implemented modules and existing technology
          stacks, our offerings are tailored to ensure you can bring your ideas
          to market quickly and affordably.
        </Typography>
      </Box>

      {/* Your Benefits Section */}
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
          mt: 4,
        }}
      >
        <Typography component="h3" variant="h5" gutterBottom>
          Your Benefits
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          When you choose our service, you unlock a variety of benefits tailored
          to meet your project&apos;s needs. Here are some key reasons why our
          model stands out:
          <br />
          <br />
          <b> Equity-Free Engagement</b>: We operate on an equity-free basis,
          meaning you retain complete control over your project and ownership
          unless explicitly arranged otherwise. This model offers flexibility
          and peace of mind, with the option for lower custom pricing if equity
          is part of the agreement.
          <br />
          <br />
          <b> Pay Only for Hours, Benefit from Shared Libraries</b>: You only
          pay for the hours worked, ensuring cost efficiency. Additionally, you
          benefit from our shared, reusable libraries, which drastically reduce
          development time and cost by leveraging pre-built modules and
          solutions.
          <br />
          <br />
          <b> Flexible IP Models</b>: With two distinct Intellectual Property
          (IP) models, you have the flexibility to choose what best suits your
          project needs. You can opt for direct control over your codebase or a
          more collaborative approach where we help manage and maintain the
          development process.
          <br />
          <br />
          <b> Multiple Pricing Tiers</b>: Our pricing is designed to fit
          projects of all sizes and budgets, with 5 flexible tiers that adjust
          based on your specific needs and the scope of work required. This
          allows you to choose the right level of engagement at a predictable
          cost.
          <br />
          <br />
          <b> Cost Minimization & Negotiable Pricing</b>: We focus on minimizing
          your costs by using shared libraries and negotiated pricing models.
          Our approach is highly customizable, allowing for price negotiation
          depending on the project scale and specific requirements.
          <br />
          <br />
          <b> Predictable Planning</b>: Hours can be planned and set 1 month in
          advance, allowing for a clear, predictable workflow. This scheduling
          flexibility helps you budget effectively and ensures that the work
          progresses at a steady, reliable pace.
        </Typography>
      </Box>

      {/* Case Studies Section */}
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
          mt: 6,
        }}
      >
        <Typography component="h3" variant="h5" gutterBottom>
          Case Studies: Real Projects, Real Solutions
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: theme.palette.text.secondary }}
        >
          Discover how our tailored services have helped founders across various
          industries and stages of development. Each case illustrates our
          ability to deliver flexible, cost-effective solutions while
          maintaining high-quality standards.
        </Typography>

        {/* Case Nick */}
        <Box mt={4}>
          <Typography component="h4" variant="h6" gutterBottom>
            Nick: Real Estate Agent Creating Housing Marketplace
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            <b>Challenge</b>: Nick aims to create a marketplace where users can
            directly purchase housing through the platform. He needs real-time
            customization, chat, and payment processing without exceeding his
            budget.
            <br />
            <b>Solution & Benefits</b>:
            <br />
            - Pre-built chat modules and Autodesk/payment integrations
            drastically reduce development time and costs.
            <br />
            - Cost-effective development by paying only for hours worked,
            allowing Nick to allocate resources efficiently.
            <br />
            - Faster time to market, gaining early traction against competitors.
            <br />
            - Flexible, part-time development contributions ensure cost control
            and scalability.
            <br />
            <b>Value</b>: Reduced costs, faster launch, and a cutting-edge
            platform without sacrificing quality or flexibility.
          </Typography>
        </Box>

        {/* Case Luke */}
        <Box mt={4}>
          <Typography component="h4" variant="h6" gutterBottom>
            Luke: Cyber Defense Specialist Validating Startup Ideas
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            <b>Challenge</b>: Luke has five startup ideas to validate before
            returning to a full-time job. His main focus is a GraphQL
            auto-testing tool, but he needs efficient and cost-effective
            development.
            <br />
            <b>Solution & Benefits</b>:
            <br />
            - Custom auto-testing logic developed exclusively for Luke while
            using existing backend modules.
            <br />
            - Scalable architecture from the start with Architecture Plus.
            <br />
            - Cost-efficient validation via contribution mode, paying only for
            tailored core logic.
            <br />
            - Rapid iteration for multiple ideas within his timeline.
            <br />
            <b>Value</b>: Quick, affordable validation with a strong foundation
            for scalability, ensuring minimal financial risk and maximum
            opportunity for success.
          </Typography>
        </Box>

        {/* Case Roy */}
        <Box mt={4}>
          <Typography component="h4" variant="h6" gutterBottom>
            Roy: Serial Entrepreneur Managing Multiple Ventures
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            <b>Challenge</b>: Roy manages multiple ventures but has no budget
            for one specific project. He needs to build a marketplace without
            upfront costs, while managing a volunteer team.
            <br />
            <b>Solution & Benefits</b>:
            <br />
            - Leveraging pre-built marketplace modules like payments to avoid
            direct development costs.
            <br />
            - Roy pays for team management services only, overseeing volunteers
            without contributing directly to development.
            <br />
            - He also pays for recruitment interviews, allowing volunteers to
            work under the managed team structure.
            <br />
            <b>Value</b>: Zero-budget venture management using existing modules
            and volunteer teams, paying only for management and recruitment
            services.
          </Typography>
        </Box>

        {/* Case Daniel */}
        <Box mt={4}>
          <Typography component="h4" variant="h6" gutterBottom>
            Daniel: Non-Technical Founder Creating AI Couple Therapy App
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            <b>Challenge</b>: Daniel, with no tech background, wants to create
            an AI-based couple therapy app using generative AI and chat modules.
            <br />
            <b>Solution & Benefits</b>:
            <br />
            - Pre-built chat and generative AI modules, with Daniel focusing on
            writing prompts.
            <br />
            - Minimal tech involvement, requiring only setup, deployment, and
            simple application creation.
            <br />
            - Cost-effective, non-contribution model that keeps development
            costs low.
            <br />
            <b>Value</b>: Daniel launches an AI-driven app without deep tech
            knowledge, focusing on marketing and prompt creation with minimal
            setup costs.
          </Typography>
        </Box>

        {/* Case Eitan */}
        <Box mt={4}>
          <Typography component="h4" variant="h6" gutterBottom>
            Eitan: Diver Creating a Diving Club Management SaaS
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            <b>Challenge</b>: Eitan has built a no-code POC for a diving club
            management platform. Now, he needs to develop a code-based MVP to
            scale the product.
            <br />
            <b>Solution & Benefits</b>:
            <br />
            - Transitioning from no-code POC to a code-based MVP using
            contribution mode.
            <br />
            - Cost-efficient development by paying only for hours worked and
            leveraging pre-built modules.
            <br />
            - A scalable MVP ready to attract more diving clubs and expand the
            platform.
            <br />
            <b>Value</b>: Efficiently evolving from a POC to a scalable MVP with
            controlled costs and a foundation for future growth.
          </Typography>
        </Box>

        {/* Case U */}
        <Box mt={4}>
          <Typography component="h4" variant="h6" gutterBottom>
            Client U: Full Offer for a Fully Designed Mockup
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary }}
          >
            <b>Challenge</b>: Client U needs a fully designed mockup of their
            product, ready for implementation.
            <br />
            <b>Solution & Benefits</b>:
            <br />
            - We offer a complete design package, preparing a fully functional
            mockup that’s ready for development.
            <br />
            <b>Value</b>: A polished, functional design ready for
            implementation, with no additional design work required.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
