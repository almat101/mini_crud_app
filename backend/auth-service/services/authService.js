import Joi from "joi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//schema per /login
const schema_login = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: {
      allow: ["com", "net", "org", "edu", "gov", "io", "co", "it", "us", "uk"],
    },
  }),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{8,}$")),
});

// schema per /signup
const schema_signup = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),

  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{8,}$")).required(),

  repeat_password: Joi.ref("password"),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: {
        allow: [
          "com",
          "net",
          "org",
          "edu",
          "gov",
          "io",
          "co",
          "it",
          "us",
          "uk",
        ],
      },
    })
    .required(),
}).with("password", "repeat_password");

// payload shema
const jwtPayloadSchema = Joi.object({
  userId: Joi.number().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
});

export async function validateUserCredentials(user) {
  try {
    return await schema_login.validateAsync(user);
  } catch {
    throw new Error("Invalid login data. Please check your input.");
  }
}

export const comparePasswords = async (plaintextPassword, hashedPassword) => {
  return bcrypt.compare(plaintextPassword, hashedPassword);
};

//TODO modify all test
export const generateAccessToken = (payload) => {
  return jwt.sign({ ...payload, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: "15m", //short lived token
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "7d", // long lived token
  });
};

// Per prima cosa geniaramo un Salt ( che e' una stringa causale che andra aggiunta alla password prima di hasharla)
// const saltRounds = 10;
// const salt = await bcrypt.genSalt(saltRounds); // Generate salt
// const hash = await bcrypt.hash(validateUser.password, salt); // adesso abbiamo la password hashata e la possiamo salvare nel db
export const hashPassword = async (plaintextPassword) => {
  if (!plaintextPassword || plaintextPassword.trim() === "") {
    throw new Error("Password cannot be empty");
  }

  //validazione password con la stessa regex dello schema Joi di signup e login
  const passwordRegex = /^[a-zA-Z0-9]{8,}$/;
  if (!passwordRegex.test(plaintextPassword)) {
    throw new Error(
      "Password must be at least 8 characters long and contain only letters and numbers."
    );
  }

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plaintextPassword, salt);
    return hash;
  } catch {
    throw new Error("Error hashing password.");
  }
};

export async function validateSignupData(user) {
  try {
    return await schema_signup.validateAsync(user);
  } catch {
    throw new Error("Invalid signup data. Please check your input.");
  }
}

export const validateJwtPayload = (payload) => {
  const { error } = jwtPayloadSchema.validate(payload);
  if (error) {
    throw new Error("Invalid payload");
  }
  return true;
};
