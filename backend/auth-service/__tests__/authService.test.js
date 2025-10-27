import { generateJwtToken, hashPassword, comparePasswords, validateJwtPayload } from "../services/authService.js";
import jwt from 'jsonwebtoken'



describe('unit test for generateJwtToken', () => {
    test('should generate a valid JWT token', () => {
        //Arrange
        const payload = { 
            userId : 1,
            username : "alex",
            email : "alex@gmail.com"
        };
        const secret = "secret_test"
        const options = {expiresIn: '1h'}

        //Act
        const token = generateJwtToken(payload, secret, options)

        //Assert
        expect(token).toBeDefined()
        expect(typeof token).toBe('string')
        
        //Verify
        const decoded = jwt.verify(token,secret);
        expect(decoded).toMatchObject(payload)  
    })
})


describe('unit test for validateJwtPayload', () => {
    test('should not generate a valid JWT token with invalid paylod', () => {
        //Arrange
        const payload = { 
            userId : 'ciao',
            username : "alex",
            email : "alex@gmail.com"
        };
        const secret = "secret_test"
        const options = {expiresIn: '1h'}

        //Act and assert
        expect(() => validateJwtPayload(payload,secret,options)).toThrow("Invalid payload")

    })
})

test('should return true for a valid payload', () => {
    // Arrange
    const payload = { 
        userId: 1,
        username: "alex",
        email: "alex@gmail.com"
    };
    const secret = "secret_test";
    const options = { expiresIn: '1h' };

    // Act
    const ret = validateJwtPayload(payload, secret, options);

    // Assert
    expect(ret).toBe(true);
});

test('should validate a valid payload without throwing an error', () => {
    // Arrange
    const payload = { 
        userId: 1,
        username: "alex",
        email: "alex@gmail.com"
    };
    const secret = "secret_test";
    const options = { expiresIn: '1h' };
    
    // assert + Act & Assert
    expect(() => validateJwtPayload(payload, secret, options)).not.toThrow();
    

});


describe('Unit test for hashPassword', () => {
    test('should hash a password from plaintext and verify it matches the plaintext password',async () => {
        //Arrange
        const plaintextPassword = "1teStPasSw0rD2"

        //Act
        const hash = await hashPassword(plaintextPassword)

        //Assert
        expect(hash).toBeDefined()
        expect(typeof hash).toBe('string')
        expect(hash).not.toBe(plaintextPassword)
        

        //Verify
        const is_the_same = await comparePasswords(plaintextPassword, hash)
        expect(is_the_same).toBe(true)

    })

    test('should not hash a password that is empty',async () => {
        //Arrange
        const plaintextPassword = ""

        //Act e assert
        await expect(hashPassword(plaintextPassword)).rejects.toThrow("Password cannot be empty")

    })


    test('should not hash a password that is too short',async () => {
    //Arrange
    const plaintextPassword = "ciao"

    //Act e assert
    await expect(hashPassword(plaintextPassword)).rejects.toThrow( "Password must be at least 8 characters long and contain only letters and numbers.")

    })
})

// use case:
// funzioni sincrone: expect(() => ...).toThrow(...)
// funzione asincronce: await expect(...).rejects.toThrow(...)