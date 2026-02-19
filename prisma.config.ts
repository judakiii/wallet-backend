import { ConfigService } from "@nestjs/config";
import { defineConfig } from "prisma/config";

const configService = new ConfigService()

export default defineConfig({
  datasource: {
      url: configService.get<string>('DATABASE_URL') || "postgresql://mohammadreza:aa110110@localhost:5432/wallet_db?schema=public"
  },
});