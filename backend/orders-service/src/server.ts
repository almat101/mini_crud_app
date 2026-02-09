import server from "./app.js"

// Separating app configuration from server startup allows for better testing.
// Tests can import 'app' without starting the server on a port.

/**
 * Starts the Fastify server.
 * Listens on port 3040 and host 0.0.0.0.
 * Host 0.0.0.0 is required for Docker containers to be accessible, as Fastify defaults to 127.0.0.1 (localhost) which is not exposed outside the container.
 */
const startServer = async () => {
  try {
    await server.listen({ port: 3040, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }  
}  

startServer();


// server.listen({ port: 3040, host: '0.0.0.0' }, (err, address) => {
  //   if (err) throw err;
//   server.log.info(`server listening on ${address}`)
// });