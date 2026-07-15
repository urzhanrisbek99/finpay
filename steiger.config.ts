import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

// Линтер архитектуры FSD. Включён в CI, поэтому отключения ниже — осознанные,
// с причиной у каждого. Всё остальное (порядок слоёв, обход публичных API,
// именование срезов) работает и падает сборку.
export default defineConfig([
  ...fsd.configs.recommended,

  {
    rules: {
      // Слои named "_app"/"_pages", а не "app"/"pages", потому что Next.js
      // резервирует src/app под App Router и src/pages под Pages Router.
      // Подчёркивание — вынужденный обход, а не опечатка.
      "fsd/typo-in-layer-name": "off",

      // Правило требует слить срез, на который ссылаются один раз. У нас одно
      // действие пользователя = один срез (add-card, show-cvv, remove-card...),
      // и каждый по определению используется одной страницей. Слияние
      // превратило бы фичи в свалку внутри страниц.
      "fsd/insignificant-slice": "off",
    },
  },

  {
    // Слой app по FSD не делится на срезы: providers/styles/ui — это сегменты.
    // Steiger из-за подчёркивания видит "_app" то как слой, то как срезанный
    // слой, и требует сегментировать сегменты. Правила ниже к unsliced-слою
    // неприменимы.
    files: ["./src/_app/**"],
    rules: {
      "fsd/no-segmentless-slices": "off",
      "fsd/no-segments-on-sliced-layers": "off",
      // AppShell/AppSkeleton — композиция уровня приложения, ей место здесь,
      // а не в widgets: они собирают каркас, а не предметную область.
      "fsd/no-ui-in-app": "off",
    },
  },
]);
