import express from 'express'
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv'
import { Pool } from 'pg'
import cors from 'cors';
import jwt from 'jsonwebtoken'


const app = express();
const port = 3020;

dotenv.config();
// console.log(process.env)


app.use(cors({
  origin : ['http://localhost:3000','http://localhost'], //cors per il frontend per sviluppo locale e per nginx in produzione
  methods : [ 'GET', 'POST', 'PATCH', 'DELETE'],
  // credentials: true, 
  }
));

// Middleware to authenticate requests using JWT, verify token, and extract user info
function JWT_middleware_decode(req, res, next) {
  //estraggo il token dall headers della richiesta
  let token = req.headers.authorization?.split(' ')[1];
  if (!token)
    return res.status(401).json({ message: "Unauthorized token" });
  try {
      //Uso JWT verify per verificare il token
      let decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded === null || decoded === undefined)
          return res.status(401).json({ "message": "Unauthorized: Invalid or expired token" });
      req.user = decoded;
  } catch (error) {
      return res.status(401).json({ message : "Internal token", error_message: error})
  }
  // Passa al prossimo middleware
  next();
}



//libreria di node per leggere i file .env ( su python si usa os.environ.get("ENV_VARIABLE"))
// dotenv.config({ path: '/home/ale/Desktop/express_project_1/.env' })

const pool = new Pool({
  host: process.env.POSTGRES_HOST_PRODUCTS,
  user:  process.env.POSTGRES_USER_PRODUCTS,
  database: process.env.POSTGRES_DB_PRODUCTS,
  password: process.env.POSTGRES_PASSWORD_PRODUCTS,
  port: process.env.POSTGRES_PORT_PRODUCTS,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60
});

//                                                             ":method :url :status :response-time ms\ - :res[content-length]"
// middleware logger utile per stampare info sulla richiesta es "GET /about 200 1.896 ms - 34" 
app.use(morgan('dev'));

// middleware che aggiunge vari header di sicurezza alla risposta HTTP
app.use(helmet());

// middleware impostato a livello globale
// serve per parsare il corpo(body) delle richieste in entrata quando sono in formato JSON
app.use(express.json());


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Nuove rotte per testare le operazione CRUD

// GET per recuperare tutti i prodotti (READ) 
// Aggiunta del middleware per verificare la validita del token JWT
app.get('/api/products', JWT_middleware_decode, async (req,res) =>
{
    // Devo creare una rotta get che esegua semplicemente la query che ho scritto sotto nel testPool
    // Ma devo gestire eventuali errori o il fatto che il db sia vuoto o spento
    try {
        let userId = req.user.userId;
        console.log(userId)
        const result = await pool.query(`SELECT * from products WHERE user_id = $1`, [userId]);
        res.status(200).json(result.rows);
    } catch(err) {
            res.status(500).json({ message: 'Errore interno del server. Riprova più tardi.' });
    }
});

//get per recuperare tutti i prodotti scraped da selenium
app.get('/api/scraped_products', JWT_middleware_decode, async (req,res) =>
{
    try {
        const result = await pool.query(`SELECT * from scraped_products`);
        res.status(200).json(result.rows);
    } catch(err) {
            res.status(500).json({ message: 'Errore interno del server. Riprova più tardi.' });
    }
});


//GET per recuperare un prodotto specifico (READ)
// aggiunta middleware JWT
app.get('/api/products/:id',JWT_middleware_decode, async (req,res) =>
{
    try {
        let id = parseInt(req.params.id);
        if(isNaN(id))
          return res.status(400).json({message: 'Bad Request, id is not a number.'});
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if(result.rowCount == 0)
          return res.status(404).json({message: 'Not found'})
        res.status(200).json(result.rows);
    } catch(err) {
        res.status(500).json({ message: 'Errore interno del server. Riprova più tardi.' });
    };
});

//POST per create un nuovo prodotto (CREATE)
app.post('/api/products',JWT_middleware_decode, async (req, res) => {
  try {
    let product = req.body; // req.body parse the JSON to a JS object
    console.log(product);
    if (!product.name || product.name.trim() === "")
      return res.status(400).json({ error: "Product name required" })
    if (!product.price || isNaN(product.price)) // this is a number so we need to use isNaN 
      return res.status(400).json({ error: "Price must be a valid number" })
    if (!product.category || product.category.trim() === "")
      return res.status(400).json({ error: "Category name required" })
    if (!product.user_id || isNaN(product.user_id)) // add user_id for taking the products of a specific user
      return res.status(400).json({ error: "user_id must be a valid number" })
    const text = 'Insert INTO products (name, price, category, user_id) VALUES ($1, $2, $3, $4) RETURNING *';
    // This is a simple SQL query that uses placeholders ($1, $2, $3, $4) to prevent SQL injection.
    const values = [product.name, product.price, product.category, product.user_id];
    // 'values' is an array containing the data to be inserted into the database.
    const result = await pool.query( text, values); 
    return res.status(201).send({ message: "Product created" , product: result.rows[0] });
  } catch(err) {
    res.status(500).json({ message: 'Errore interno del server. Riprova più tardi.' });
  }
});

//PATCH per aggiornare un prodotto esistente (UPDATE)
app.patch('/api/products/:id', JWT_middleware_decode, async(req, res) => {
  try {
    let id = parseInt(req.params.id); //parse the id to a number 
    if (isNaN(id)) // if parseInt fails check for Nan
        return res.status(400).send("Id is not a number");
    let product = req.body; // body checks
    if (!('name' in product) && !('price' in product) && !('category' in product) && !('user_id' in product)) // at least one of this exist
      return res.status(400).json({ error: "Update at leas one value" });
    if (('name' in product) && product.name.trim() === "") //exist and is not empty
      return res.status(400).json({ message: 'Name must be a valid string'});
    if(('price' in product) && isNaN(product.price))
      return res.status(400).json({ message: 'Price must be a valid number'});
    if (('category' in product) && product.category.trim() === "")
      return res.status(400).json({ message: 'Category must be a valid string'});
    if(('user_id' in product) && isNaN(product.user_id))
      return res.status(400).json({ message: 'user_id must be a valid number'});

    //UPDATE QUERY PG STYLE 
    const field = [];
    const value = [];

    if ('name' in product)
    {
      value.push(product.name);
      field.push("name = $" + (value.length));
    }
    if ('price' in product) {
      value.push(product.price);
      field.push("price = $" + (value.length));
    }
    if ('category' in product)
    {
      value.push(product.category)
      field.push("category = $" + (value.length));
    }
    if ('user_id' in product)
    {
      value.push(product.user_id)
      field.push("user_id = $" + (value.length));
    }

    value.push(id); // need this also

    const text = `UPDATE products SET ${field.join(', ')} WHERE id = $${value.length} RETURNING * `;
    const result = await pool.query(text, value);
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Product not found'});
    return res.status(200).json({ message: 'Product updated!' , product: result.rows[0]})

  } catch(err) {
    res.status(500).json({ message: 'Errore interno del server. Riprova più tardi.' });
  }
});

// DELETE per cancellare un prodotto dato l'id specifico
app.delete('/api/products/:id', JWT_middleware_decode, async (req, res) => {
  try 
  {   
    let id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).send("Id is not a number");
    const result = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING *`, [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'No Product deleted'});
    // return res.status(204).send( "Product deleted"); // this could be ok too
    return res.status(200).json({ message: "Product deleted", product: result.rows[0]})
  } catch(err) {
    res.status(500).json({ message: 'Errore interno del server. Riprova più tardi.' });
  }
});

// Vecchie rotto per testare
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// })

// //Query string con /user/search va messo prima di req.parmas ( /user/:id)  per evitare che express esequa prima la rotta con il parametro
// //La query string sono coppie chiave valore che vengono aggiunte dopo un '?' e separati tramite '&' es /products/search?chiave=valore&chiave2=valore2 
// app.get('/test/products/search', (req,res) =>
// {
//   console.log(req.query);
//   res.send(`req.query.name ${req.query.name} req.query.category ${req.query.category} req.query.price ${req.query.price}`);
// })

// // Parametro nella richiesta (req.params) questo parametro e' un valore dinamico che puo' essere catturato con req.params
// app.get('/test/products/:id', (req,res) => 
// {
//   let id = req.params.id;
//   let isDigit = /^[0-9]+$/.test(id);
//   let type = typeof req.params.id;
//   if (isDigit) {
//     res.send(`req.params is: ${req.params.id}, type is ${type}, is digit? ${isDigit}`);
//   } else {
//     res.status(400).send("Error ID is not a digit!");
//   }
// })

// app.get('/about',(req,res)=>
// {
//   // richiesta GET qui res.json e' usato per Serializzare JSON per la Risposta (Output) (prende un oggeto javascript e lo serializza in un JSON)
//   // (il JSON e' hardcodato direttamente, in realta' andrebbe preso da un database)
//   res.json({message : "success", test : "lol"});
// })

// app.get('/plain',(req,res) =>
// {
//   //  res.set modifca l'header e lo cambia in text/plain
//   res.set('Content-Type','text/plain');
//   // res.send invia semplice testo (se imoposta nell header) puo anche inviare oggetti JSON 
//   res.send('Plain text sended!');
// })

// // test prima POST
// app.post('/data', (req,res) =>
// {
//   // richiesta POST 
//   // dentro express.json() ce del codice che intercetta la richiesta HTTP che contiene anche il body come oggetto JSON, legge il corpo e lo parsa in oggetto javascript 
//   // e lo inserisce dentro req.body, dopo questo chiama next() per passare al prossimo middleware. req.body diventa un oggetto javascript grazie ad express.json().
//   // se non viene usato express.json() con app.use(express.json()); il body sara' undefined.
//   // Anche in questa POST il codice e' hardcoded, in realta' andrebbero effettuati controlli sul tipo di oggetto, se ha i campi necessari ecc e poi aggiunto al database.
//   console.log('Dati ricevuti nel corpo della richiesta:', req.body);
//   res.status(201);
//   res.json({
//     message: "dati ricevuti",
//     data: req.body
//   });
// });


//async function testPool_startServer() {
 // try {
    
    // const client = await pool.connect(); // Qui pool.connect() e usato per acqusire una connessione
    // const result = await client.query('SELECT NOW()') // viene eseguita una query che mostra l'ora attuale del db
    // console.log(result);
    //client.release(); //Necessario il rilascio del client al pool

    // Test con await pool.query():
    // Non ha bisogno di acquisire una connessione e di rilasciarla, per eseguire una semplice query.
    //const result = await pool.query('SELECT $1::text as name', ['Lenovo T14']);
    //const result = await pool.query('SELECT * FROM products WHERE id = $1', [2]);
    //const result = await pool.query('SELECT * FROM products');
    //console.log(result.rows);


    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
      console.log(`
        Route available:
        '/api/products         (GET) return all JSON value from DB (READ)
        '/api/products/:id     (GET) return a JSON of the specific id request from DB (READ)
        '/api/products         (POST) send JSON object and STORE it into DB (CREATE)
        '/api/products/:id     (PATCH) update the JSON object stored into the DB from the given id (UPDATE)
        '/api/products/:id     (DELETE) delete a product in the DB from the given id (DELETE)
        `)
      })
      // } catch (err) {
        //   console.error('Errore critico all\'avvio del server o del database:', err.stack);
        //   process.exit(1);
        // }
        //};
        
        //testPool_startServer();
        