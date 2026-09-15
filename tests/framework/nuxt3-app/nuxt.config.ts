// SPA-only: maplibre needs a real DOM + worker, so no SSR/prerender.
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  css: ['bkoi-gl/style.css'],
  runtimeConfig: {
    public: {
      // Populated from NUXT_PUBLIC_BARIKOI_API_KEY at build time.
      barikoiApiKey: '',
    },
  },
})
