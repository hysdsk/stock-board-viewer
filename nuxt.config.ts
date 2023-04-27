import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
    css: [
        "@/assets/styles/main.css"
    ],
    runtimeConfig: {
        datasourcePath: process.env.DATASOURCE_PATH
    }
})
