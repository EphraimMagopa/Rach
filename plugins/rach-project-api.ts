/**
 * Vite dev server plugin that provides HTTP read/write access to
 * ~/.rach/projects/active.json. This enables browser-mode project
 * sync without Electron IPC.
 *
 * GET  /rach-api/project → returns active.json contents
 * PUT  /rach-api/project → writes body to active.json
 */
import type { Plugin } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const PROJECT_DIR = join(homedir(), '.rach', 'projects');
const ACTIVE_PATH = join(PROJECT_DIR, 'active.json');

export function rachProjectApi(): Plugin {
  return {
    name: 'rach-project-api',
    configureServer(server) {
      server.middlewares.use('/rach-api/project', (req, res) => {
        if (req.method === 'GET') {
          try {
            if (!existsSync(ACTIVE_PATH)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: 'active.json not found' }));
              return;
            }
            const content = readFileSync(ACTIVE_PATH, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
        } else if (req.method === 'PUT') {
          let body = '';
          req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              mkdirSync(PROJECT_DIR, { recursive: true });
              writeFileSync(ACTIVE_PATH, body, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
        }
      });
    },
  };
}
