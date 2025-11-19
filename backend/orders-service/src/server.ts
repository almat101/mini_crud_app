import Fastify from "fastify";

const server = Fastify({
  logger: true,
});

server.get("/ping", async (request, reply) => {
  reply.type("application/json").code(200);
  return 'pong\n';
});

server.listen({ port: 3000 }, (err, address) => {
  if (err) throw err;
  server.log.info(`server listening on ${address}`)
});
