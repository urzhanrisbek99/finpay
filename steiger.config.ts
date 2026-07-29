import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,

  {
    rules: {
      // Слои named "_app"/"_pages", а не "app"/"pages", потому что Next.js
      // резервирует src/app под App Router и src/pages под Pages Router.
      "fsd/typo-in-layer-name": "off",

      "fsd/insignificant-slice": "off",
    },
  },

  {
    files: ["./src/_app/**"],
    rules: {
      "fsd/no-segmentless-slices": "off",
      "fsd/no-segments-on-sliced-layers": "off",
      "fsd/no-ui-in-app": "off",
    },
  },
]);
