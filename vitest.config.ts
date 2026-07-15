import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // supabase/tests прогоняет миграции на настоящем Postgres (PGlite в WASM):
    // старт базы медленнее юнит-тестов, но всё ещё секунды и без Docker.
    include: ["src/**/*.test.ts", "supabase/tests/**/*.test.ts"],
  },
});
