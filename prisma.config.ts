import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
      url: process.env.DATABASE_URL || "postgresql://mohammadreza:aa110110@localhost:5432/wallet_db?schema=public"
  },
});