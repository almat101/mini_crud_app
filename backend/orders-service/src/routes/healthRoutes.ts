
import type { FastifyInstance } from 'fastify';

export default function healthRoutes(server:FastifyInstance) {
  server.get('/', { logLevel: 'silent' }, (request, reply) => {
    reply.status(200).send({ status: 'ok' });
  });
}

// } server.get("/ping", { logLevel: 'silent' }, async (request, reply) => {
//   reply.type("application/json").code(200);
//   return 'pong\n';
// });
