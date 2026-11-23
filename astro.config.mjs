// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';

import icon from 'astro-icon';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
Object.assign(process.env, env);

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: vercel(),
    site: 'https://example.com',
    integrations: [mdx(), sitemap(), icon()],
    vite: {
        plugins: [tailwindcss()],
    },
    fonts: [
        {
            provider: fontProviders.local(),
            name: 'Atkinson',
            cssVariable: '--font-atkinson',
            fallbacks: ['sans-serif'],
            options: {
                variants: [
                    {
                        src: ['./src/assets/fonts/atkinson-regular.woff'],
                        weight: 400,
                        style: 'normal',
                        display: 'swap',
                    },
                    {
                        src: ['./src/assets/fonts/atkinson-bold.woff'],
                        weight: 700,
                        style: 'normal',
                        display: 'swap',
                    },
                ],
            },
        },
    ],
});