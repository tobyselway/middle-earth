import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  devtools: { enabled: true },
  
  ssr: false,

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/apollo',
  ],

  apollo: {
    clients: {
      default: {
        httpEndpoint: process.env.API_URL ?? 'http://127.0.0.1:6473/query',
      },
    },
  },
});
