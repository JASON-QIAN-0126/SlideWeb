import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: "cypress/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    baseUrl: "http://localhost:3000",
  },
});
