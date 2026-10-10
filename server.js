import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {resolvePublicFile} from './server-path.js';

const root = resolve(import.meta.dirname);
const port = Number(process.env.VSV_PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8'
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const target = resolvePublicFile(root, pathname);
    if (!target) throw new Error('Chemin non public');
    const data = await readFile(target);
    res.writeHead(200, {
      'Content-Type': types[extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  } catch {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8'});
    res.end('Introuvable');
  }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'VSV est déjà lancé ou le port 4173 est occupé. Fermez la précédente fenêtre de lancement et réessayez.'
    : 'Impossible de lancer VSV : ' + error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => {
  console.log(`VSV : ouvrez http://localhost:${port} — Ctrl+C pour arrêter.`);
});
