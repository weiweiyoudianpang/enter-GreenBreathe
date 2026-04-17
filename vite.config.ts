import { defineConfig, PluginOption } from "vite";
import react from '@vitejs/plugin-react';
import { enterDevPlugin, enterProdPlugin } from 'vite-plugin-enter-dev';
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const plugins = [
    react(),
    ...enterProdPlugin(),
  ];
  if (mode === 'development') {
    plugins.push(...enterDevPlugin());
  }
  
  // Chrome Extension build configuration
  const isExtensionBuild = process.env.BUILD_TARGET === 'extension';
  
  if (isExtensionBuild) {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      build: {
        outDir: 'dist-extension',
        emptyOutDir: true,
        rollupOptions: {
          input: {
            options: path.resolve(__dirname, 'options.html'),
            popup: path.resolve(__dirname, 'popup.html'),
            notification: path.resolve(__dirname, 'public/notification.html'),
            background: path.resolve(__dirname, 'src/extension/background.ts'),
            content: path.resolve(__dirname, 'src/extension/content.ts'),
          },
          output: {
            entryFileNames: (chunkInfo) => {
              if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
                return '[name].js';
              }
              return 'assets/[name]-[hash].js';
            },
            chunkFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]',
          },
        },
      },
    };
  }
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: plugins.filter(Boolean) as PluginOption[],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: '/',
    build: {
      outDir: 'dist',
    }
  };
});