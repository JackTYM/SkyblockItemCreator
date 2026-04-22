// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
  ],

  app: {
    head: {
      title: 'Skyblock Item Creator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Design custom items and crafting recipes for Hypixel Skyblock' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  ssr: false,

  nitro: {
    preset: 'cloudflare-pages',
  },
})
