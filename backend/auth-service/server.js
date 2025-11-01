import app from "./app.js";

const PORT = 3030;

app.listen(PORT, () => {
  console.log(`Auth app listening on port ${PORT}`);
  console.log(`
          Route available:
          '/auth/signup (POST)
          '/auth/login' (POST)
          `);
});
