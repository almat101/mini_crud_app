import Fastify from "fastify";
import {db} from "./db/index.js"
import { orders, orderItems } from "./db/schema.js";
import { getRedisClient } from "./redis/redisClient.js"

const server = Fastify({
  logger: true,
});

server.get("/ping", async (request, reply) => {
  reply.type("application/json").code(200);
  return 'pong\n';
});

server.get('/health', (reqquest, reply) => {
  reply.status(200).send({ status: 'ok' });
});

//Dal fronted ricevero un carrello con dentro questo:
// {
//   "user_id": 2, 
//   "total_price": "1599.98",
//   "status": "COMLETED",
//   "items": [
//     { "product_id": 1, "price": "999.99", "quantity": 1 },
//     { "product_id": 2, "price": "599.99", "quantity": 1 }
//   ]
// }
// questi dati andranno a riempide due tabelle ORDERS e ORDER_ITEM tramite una transaction di drizzle
// una transaction e una sequenza di operazioni nel db che sono eseguite come una sola unita
// garantisce:
// atomicita, tutte le operazioni hanno successo o falliscono( non puo andare a buon fine una sola operazione parziale)
// consistenza, il db va da uno stato valido ad un altro

// interfacce: usate per definire la forma di un oggetto ( in questo caso l oggetto che rappresenta la tabella order_item)
interface IOrderItem {
  product_id: number;
  price: string; // DECIMAL di postgres/drizzle diventano stringhe per preservare la precisione aritmetica 
  quantity: number;
}

interface IOrderBody{
  user_id: number;
  total_price: string; // DECIMAL --> string
  status?: "PENDING" | "COMPLETED";
  items: IOrderItem[];
}


//generics definiscono la forma degli oggetti request/response di ogni rotta
server.post<{ Body: IOrderBody }>("/orders", async (request, reply) => {
  //non conviene usare questo modo definendo tutto il body as any;
  // const { user_id, total_price, items }  = request.body as any;
  //usiamo invece un generics per preservare il tipo, abilitare il type-safety e autocompletamento
  // console.log("headers", request.headers);
  // console.log("body", request.body);

  const { user_id, total_price, status, items }  = request.body;

  try {
    const orderID = await db.transaction(
    async (tx) => {
      const [ orderIDReturned ]= await tx.insert(orders).values( { userId: user_id,status: status, totalPrice: total_price }).returning({ insertedId: orders.id });
      
      await tx.insert(orderItems).values( items.map(item=> ({
        orderId: orderIDReturned!.insertedId,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price
      })));
  
      return orderIDReturned!.insertedId;
    }
  );
    reply.code(201).send({ 
      message:"orders created successfully!",
      orderId: orderID,
      itemCount: items.length
    });
    
    // invio messaggio a redis stream (publisher)
    const redis = getRedisClient();

    (await redis).xadd(
      "orders_stream",
      "*", // auto-generate ID
      'order_id', orderID.toString(),
      'products', JSON.stringify(items)
    );


  } catch (error) {
    console.error("Error creating order", error);
    reply.code(500).send({
      error: "Failed to create order!"
    });
  }
  
});

server.listen({ port: 3040 }, (err, address) => {
  if (err) throw err;
  server.log.info(`server listening on ${address}`)
});


// fastify generics
// https://fastify.dev/docs/latest/Reference/TypeScript/#using-generics

// drizzle transaction
// https://orm.drizzle.team/docs/transactions

// drizzle insert + returning
// https://orm.drizzle.team/docs/insert

// publisher tested:
// after a post on /oders I can see this on redis-cli
// 127.0.0.1:6379> XREAD STREAMS orders_stream 0
// 1) 1) "orders_stream"
//    2) 1) 1) "1767783162611-0"
//          2) 1) "order_id"
//             2) "2"
//             3) "products"
//             4) "[{\"product_id\":1,\"price\":\"999.99\",\"quantity\":1},{\"product_id\":3,\"price\":\"9.99\",\"quantity\":1},{\"product_id\":5,\"price\":\"99.99\",\"quantity\":10}]"