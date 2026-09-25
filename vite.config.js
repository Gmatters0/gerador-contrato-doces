import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento, serve api/*.js como a Vercel faria em produção.
function apiLocal(env) {
  Object.assign(process.env, env);
  return {
    name: 'api-local',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const m = /^\/api\/([a-z]+)(?:\?.*)?$/.exec(req.url ?? '');
        if (!m) return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.js`);
          await mod.default(req, res);
        } catch (e) {
          console.error(e);
          res.statusCode = 404;
          res.end();
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), apiLocal(loadEnv(mode, process.cwd(), ''))],
  build: { chunkSizeWarningLimit: 2000 },
}));
