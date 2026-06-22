import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.SUPABASE_DATABASE_URL || "postgresql://postgres:Aditya%409942180655@db.lvdxuaoafxesoqlmywap.supabase.co:5432/postgres";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
});

