import express from "express";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.get("/s", async (req, res) => {
  return res.status(200).send(`
  <html><head>
<script src="https://embeddable-sandbox.cdn.apollographql.com/_latest/embeddable-sandbox.umd.production.min.js"></script> 
<script>
  document.addEventListener("DOMContentLoaded", function() {
    new window.EmbeddedSandbox({
      target: '#embedded-sandbox',
      initialEndpoint: 'http://localhost:6555/graphql',
    });
  });
</script>
</head><body>
 <div style="width: 100%; height: 100%;" id='embedded-sandbox'></div>
</body>
  
 `);
});

export default router;
