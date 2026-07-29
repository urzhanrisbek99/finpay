import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // supabase/tests прогоняет миграции на настоящем Postgres (PGlite в WASM):
    include: ["src/**/*.test.ts", "supabase/tests/**/*.test.ts"],
  },
});
