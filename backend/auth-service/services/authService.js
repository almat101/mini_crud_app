import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

//schema per /login
const schema_login = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','org','edu','gov', 'io', 'co', 'it', 'us', 'uk'] } }),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
})

// schema per /signup
const schema_signup = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),

    repeat_password: Joi.ref('password'),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net','org','edu','gov', 'io', 'co', 'it', 'us', 'uk'] } })
        .required()
})
    .with('password', 'repeat_password');



// validateUserLogin = await schema_login.validateAsync(userJoiLogin)
export async function validateUserCredentials(user) {
    try {
        return await schema_login.validateAsync(user)
    } catch (error) {
        console.error("Error on validateUserCredential: ", error)
        throw new Error("Invalid signup data. Please check your input.");
    }
}

export const comparePasswords = async (plaintextPassword, hashedPassword) => {
    return bcrypt.compare(plaintextPassword, hashedPassword);
};

export const generateJwtToken = (payload, secret, options) => {
    return jwt.sign(payload, secret, options);
};


// Per prima cosa geniaramo un Salt ( che e' una stringa causale che andra aggiunta alla password prima di hasharla)
// const saltRounds = 10;
// const salt = await bcrypt.genSalt(saltRounds); // Generate salt
// const hash = await bcrypt.hash(validateUser.password, salt); // adesso abbiamo la password hashata e la possiamo salvare nel db
export const hashPassword = async (plaintextPassword) => {
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(plaintextPassword, salt);
        return hash;
    } catch (error) {
        console.error("Error hashing password:", error);
        throw error
    }
};

// validateUser = await schema_signup.validateAsync(userJoi);
// validateUser = await validateSignupData(userJoi);

export async function validateSignupData(user) {
    try {
        return await schema_signup.validateAsync(user)
    } catch (error) {
        console.error("Error on validateUserCredential: ", error)
        throw error
    }
}