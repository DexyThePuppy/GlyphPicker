// GitHub Pages project URL: https://DexyThePuppy.github.io/GlyphPicker/
// CI sets NUXT_APP_BASE_URL; local defaults to `/`.
const baseURL = process.env.NUXT_APP_BASE_URL || '/'

export default defineNuxtConfig({
  compatibilityDate: '2026-07-31',
  ssr: false,
  nitro: {
    preset: 'github_pages',
  },
  modules: ['@vueuse/nuxt', '@vueuse/motion/nuxt', '@vueuse/sound/nuxt'],
  css: ['~/assets/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  app: {
    baseURL,
    head: {
      title: 'GlyphPicker',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: 'Browse and copy icon glyphs with a weight slider' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg`.replace(/\/{2,}/g, '/') }],
    },
  },
  devServer: { port: 5173 },
})
