import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    typeAware: true,
    typeCheck: true,
    maxWarnings: 0,
  },
  ignorePatterns: ["src/lib/prisma/generated/**"],
});
