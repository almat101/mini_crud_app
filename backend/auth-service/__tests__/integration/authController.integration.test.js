import { describe, expect, jest, test } from "@jest/globals";

// Mock the repository module before importing app.js
jest.unstable_mockModule("../../repositories/authRepository.js", () => ({
  createUser: jest.fn(),
  executePrevQuery: jest.fn(),
  findUser: jest.fn(),
  // .mockResolvedValueOnce({
  //   rows: [{ Id: 1, username: "alex", email: "alex@gmail.com" }],
  //   rowCount: 1,
  // }),
  testDatabaseConnection: jest.fn(),
  // .mockResolvedValueOnce({}),
}));

jest.unstable_mockModule("../../services/authService.js", () => ({
  validateSignupData: jest.fn(),
  comparePasswords: jest.fn(),
  // .mockResolvedValueOnce(true),
  generateJwtToken: jest.fn(),
  // .mockResolvedValueOnce("token"),
  hashPassword: jest.fn(),
  validateUserCredentials: jest.fn(),
  validateJwtPayload: jest.fn(),
  // .mockResolvedValueOnce({
  //   userId: 1,
  //   username: "alex",
  //   email: "alex@gmail.com",
  // }),
}));

import request from "supertest";

const { createUser, executePrevQuery, findUser, testDatabaseConnection } =
  await import("../../repositories/authRepository.js");

const {
  validateSignupData,
  comparePasswords,
  validateUserCredentials,
  validateJwtPayload,
  generateJwtToken,
  hashPassword,
} = await import("../../services/authService.js");
const { default: app } = await import("../../app.js");

describe("Integration test for /signup", () => {
  beforeEach(() => {
    //mockReset resets the mock implementation for grant isolation in each tests
    createUser.mockReset();
    executePrevQuery.mockReset();
    findUser.mockReset();
    testDatabaseConnection.mockReset();
    validateSignupData.mockReset();
    comparePasswords.mockReset();
    validateUserCredentials.mockReset();
    validateJwtPayload.mockReset();
    generateJwtToken.mockReset();
    hashPassword.mockReset();
  });

  test("POST /signup should return 201 and the new created user", async () => {
    // Successful signup:
    // - validateSignupData resolves (valid input)
    // - hashPassword resolves (password hashed successfully)
    // - executePrevQuery resolves (no existing user found)
    // - createUser resolves (user created in database)
    validateSignupData.mockResolvedValueOnce({
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    });
    hashPassword.mockResolvedValueOnce("hashed_pasword");
    executePrevQuery.mockResolvedValueOnce({ row: [], rowCount: 0 });
    createUser.mockResolvedValueOnce({
      rows: [{ id: "1", username: "alex", email: "alex@gmail.com" }],
      rowCount: 1,
    });
    //arrange
    const mockSignupBody = {
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    };

    //act
    const response = await request(app)
      .post("/auth/signup")
      .send(mockSignupBody);

    //assert (successfull signup all function are called and resolve to a valid value)
    expect(validateSignupData).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledTimes(1);
    expect(executePrevQuery).toHaveBeenCalledTimes(1);
    expect(createUser).toHaveBeenCalledTimes(1);
    expect(createUser).toHaveBeenCalledWith(
      "alex",
      "alex@gmail.com",
      expect.any(String)
    );
    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      message: "User created",
      user: {
        username: "alex",
        email: "alex@gmail.com",
        id: "1",
      },
    });
  });

  test("POST /signup should return 500 if createUser fails", async () => {
    // Error on signup:
    // - validateSignupData resolves (valid input)
    // - hashPassword resolves (password hashed successfully)
    // - executePrevQuery resolves (no existing user found)
    // - createUser reject
    validateSignupData.mockResolvedValueOnce({
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    });
    hashPassword.mockResolvedValueOnce("hashed_pasword");
    executePrevQuery.mockResolvedValueOnce({ row: [], rowCount: 0 });
    createUser.mockRejectedValueOnce();

    hashPassword.mockResolvedValueOnce("hashed_pasword");
    executePrevQuery.mockResolvedValueOnce({ row: [], rowCount: 0 });
    createUser.mockResolvedValueOnce({
      rows: [{ id: "1", username: "alex", email: "alex@gmail.com" }],
      rowCount: 1,
    });
    //arrange
    const mockSignupBody = {
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    };

    //act
    const response = await request(app)
      .post("/auth/signup")
      .send(mockSignupBody);

    //assert (successfull signup all function are called and resolve to a valid value)
    expect(validateSignupData).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledTimes(1);
    expect(executePrevQuery).toHaveBeenCalledTimes(1);
    expect(createUser).toHaveBeenCalledTimes(1);

    expect(response.statusCode).toBe(500);
    expect(response.body).toMatchObject({ message: "Internal server error" });
  });

  test("POST /signup should return 409 if the username or email already exist in the database", async () => {
    // Error on signup:
    // - validateSignupData resolves (valid input)
    // - hashPassword resolves (password hashed successfully)
    // - executePrevQuery resolves (founding the same user so it goes to 409 same user)
    validateSignupData.mockResolvedValueOnce({
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    });
    hashPassword.mockResolvedValueOnce("hashed_pasword");
    executePrevQuery.mockResolvedValueOnce({
      rows: [{ id: "1", username: "alex", email: "alex@gmail.com" }],
      rowCount: 1,
    });
    //arrange
    const mockSignupBody = {
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    };

    //act
    const response = await request(app)
      .post("/auth/signup")
      .send(mockSignupBody);

    // assert;
    expect(validateSignupData).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledTimes(1);
    expect(executePrevQuery).toHaveBeenCalledTimes(1);
    expect(createUser).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toBe(409);
    expect(response.body).toMatchObject({
      message: "Username or Email already exists",
    });
  });

  test("POST /signup should return 500 if executePrevQUery fails", async () => {
    // Error on signup:
    // - validateSignupData resolves (valid input)
    // - hashPassword resolves (password hashed successfully)
    // - executePrevQuery rejects
    validateSignupData.mockResolvedValueOnce({
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    });
    hashPassword.mockResolvedValueOnce("hashed_pasword");
    executePrevQuery.mockRejectedValueOnce();
    //arrange
    const mockSignupBody = {
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    };

    //act
    const response = await request(app)
      .post("/auth/signup")
      .send(mockSignupBody);

    // assert;
    expect(validateSignupData).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledTimes(1);
    expect(executePrevQuery).toHaveBeenCalledTimes(1);
    expect(createUser).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toBe(500);
    expect(response.body).toMatchObject({ message: "ExecutePrevQuery Error" });
  });

  test("POST /signup should return 400 if validateSignupData fails", async () => {
    // Error on signup:
    // - validateSignupData rejects (valid input)
    validateSignupData.mockRejectedValueOnce();

    //arrange
    const mockSignupBody = {
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    };

    //act
    const response = await request(app)
      .post("/auth/signup")
      .send(mockSignupBody);

    // assert;
    // expect(validateSignupData).toHaveBeenCalledTimes(1);
    // expect(createUser).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({ message: "Validation Error" });
  });

  test("POST /signup should return 500 if hashPassword fails", async () => {
    //Error on signup:
    // - validateSignupData rejects
    validateSignupData.mockResolvedValueOnce({
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    });
    //mock that reject the promise
    hashPassword.mockRejectedValueOnce();

    //arrange
    const mockSignupBody = {
      username: "alex",
      password: "test12ciao",
      repeat_password: "test12ciao",
      email: "alex@gmail.com",
    };

    //act
    const response = await request(app)
      .post("/auth/signup")
      .send(mockSignupBody);

    // assert;
    expect(validateSignupData).toHaveBeenCalledTimes(1);
    expect(hashPassword).toHaveBeenCalledTimes(1);
    expect(createUser).toHaveBeenCalledTimes(0);
    expect(response.statusCode).toBe(500);
    expect(response.body).toMatchObject({ message: "Hashing Error" });
  });
});
