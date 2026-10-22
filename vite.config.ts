import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function videoUploaderPlugin(): Plugin {
  return {
    name: 'video-uploader-plugin',
    configureServer(server) {
      server.middlewares.use('/api/upload-video', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method Not Allowed');
          return;
        }

        try {
          const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
          const rawItemId = url.searchParams.get('itemId') || (req.headers['x-item-id'] as string) || 'lemon';
          const safeItemId = rawItemId.replace(/[^a-zA-Z0-9_-]/g, '_');
          const targetDir = path.resolve(__dirname, 'public/videos/vast');
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          const targetPath = path.join(targetDir, `${safeItemId}.mp4`);
          const fileStream = fs.createWriteStream(targetPath);

          req.pipe(fileStream);

          fileStream.on('finish', () => {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify({
              success: true,
              itemId: safeItemId,
              url: `/videos/vast/${safeItemId}.mp4`,
            }));
          });

          fileStream.on('error', (err) => {
            console.error('Failed to write video file:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          });
        } catch (err: unknown) {
          res.statusCode = 500;
          const msg = err instanceof Error ? err.message : 'Unknown error';
          res.end(JSON.stringify({ success: false, error: msg }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), videoUploaderPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
