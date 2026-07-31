export default defineNuxtConfig({
  compatibilityDate: '2026-07-31',
  ssr: false,
  modules: ['@vueuse/nuxt', '@vueuse/motion/nuxt', '@vueuse/sound/nuxt'],
  css: ['~/assets/main.css'],
  components: [{ path: '~/components', pathPrefix: false }],
  app: {
    head: {
      title: 'GlyphPicker',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'description', content: 'Browse and copy icon glyphs with a weight slider' },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  devServer: { port: 5173 },
})
