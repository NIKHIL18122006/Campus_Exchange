import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initSocket } from './socket/index.js';

const server = http.createServer(app);
initSocket(server);

server.listen(env.port, () => console.log(`API running on port ${env.port}`));