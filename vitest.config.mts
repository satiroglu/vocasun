import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom', // Tarayıcı simülasyonu
        globals: true, // describe, it, expect gibi fonksiyonları global yapar
        setupFiles: './src/__tests__/setup.ts', // Başlangıç ayarları
        alias: {
            '@': path.resolve(__dirname, './src'), // @ alias'ını tanıtıyoruz
        },
    },
});