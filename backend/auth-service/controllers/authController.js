import {
  executePrevQuery,
  createUser,
  findUser,
} from "../repositories/authRepository.js";
import {
  validateUserCredentials,
  comparePasswords,
  generateJwtToken,
  hashPassword,
  validateSignupData,
  validateJwtPayload,
} from "../services/authService.js";

// funzione che gestisce la logica di registrazione utente
// riceve dati dal fronted trasformati da oggetto JS a oggetto JSON con AXIOS
// valida i dati con la libreria JOI
// se i dati sono ok (cripta la password)
// eseque una query sql per inserirli nel db
export const signup = async (req, res) => {
  // Primo try catch usato per validate il body con la libreria joi
  let validateUser;
  try {
    let userJoi = req.body;
    //verifica che l input sia valido in base allo schema Joi signup
    validateUser = await validateSignupData(userJoi);
  } catch (err) {
    res.status(400).json({ message: "Validation Error", error: err.details });
    return;
  }

  // Secondo try catch per criptare la password e salvare tutto lo user  nel DB
  try {
    // hasha la password con  bcrypt
    const hash = await hashPassword(validateUser.password);

    // esegue una query preventiva per controllare se un utente o email sono gia presenti nel db
    const prev_query = await executePrevQuery(
      validateUser.username,
      validateUser.email,
    );

    if (prev_query.rowCount == 1)
      // prev_query.rowCount ritorna uno se c'e una corrispondenza, ossia se esiste gia un utente con lo stesso user e/o email
      return res
        .status(409)
        .json({ message: "Username or Email already exists" });

    // Inserimento dello user nel db
    const result = await createUser(
      validateUser.username,
      validateUser.email,
      hash,
    );

    return res
      .status(201)
      .send({ message: "User created", product: result.rows[0] });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// funzione che gestisce la logica di login utente (riceve credenziali dal fronted, valida dati, cerca utente nel db eseguendo una query, se le credenziali sono corrette genera e restituisce un token JWT e risponde con successo o con errore 401)
// Ricevi il JSON.
// Valida i dati con Joi.
// Cerca l'utente nel database.
// Se l'utente non esiste, restituisci errore 401.
// Confronta la password con l'hash salvato.
// Se la password non coincide, restituisci errore 401.
// Genera un JWT se tutto è corretto.
// Restituisci il token JWT al client.
export const login = async (req, res) => {
  let validateUserLogin;
  try {
    let userJoiLogin = req.body;

    //verifica che l input sia valido in base allo schema Joi login
    validateUserLogin = await validateUserCredentials(userJoiLogin);
  } catch (err) {
    res.status(400).json({ message: "Validation Error", error: err.details });
    return;
  }

  try {
    // cerca l'utente che fa login in base all'email
    const query = await findUser(validateUserLogin.email);
    if (query.rowCount == 0)
      return res.status(401).json({ message: "Unauthorized user" });
    const userFound = query.rows[0];

    //Usa bcrypt.compare per confrontare la password in plaintext con la password hashata
    const compared_password = await comparePasswords(
      validateUserLogin.password,
      userFound.password_hash,
    );

    // 401 se non coincidono
    if (!compared_password)
      return res.status(401).json({ message: "Unauthorized wrong password" });

    // creazione del payload con i dati da includere nel token jwt
    const payload = {
      userId: userFound.id,
      username: userFound.username,
      email: userFound.email,
    };
    try {
      //validazion payload con Joi schema
      validateJwtPayload(payload);
      // Generazione token JWT con jsonwebtoken
      // const token =  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }); //scadenza 7giorni dopo devo implementare al logout una blacklist dei token
      const token = generateJwtToken(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      // Restituzione del token al browser con ritorno 200 ok
      res
        .status(200)
        .json({ message: "Login succesful", token: token, id: userFound.id });
    } catch (error) {
      res.status(400).json({ message: error.message });
      return;
    }
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
