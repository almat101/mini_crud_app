import { describe, expect, jest, test } from "@jest/globals";

// Mock the repository module before importing app.js
jest.unstable_mockModule("../repositories/authRepository.js", () => ({
  createUser: jest.fn().mockResolvedValue({
    rows: [{ id: "1", username: "alex", email: "alex@gmail.com" }],
    rowCount: 1,
  }),
  executePrevQuery: jest.fn().mockResolvedValue({ row: [], rowCount: 0 }),
  findUser: jest.fn().mockResolvedValue({
    rows: [{ Id: 1, username: "alex", email: "alex@gmail.com" }],
    rowCount: 1,
  }),
  testDatabaseConnection: jest.fn().mockResolvedValue({}),
}));

//TODO
// if executePrevQuery resolve to this obj we get 409 duplicate user or email
//{
//    row: [{ id: 3, username: "alex", email: "alex@gmail.com" }],
//   rowCount: 1,
//  }

import request from "supertest";
const { createUser } = await import("../repositories/authRepository.js");
const { default: app } = await import("../app.js");

describe("Unit test for /signup", () => {
  test("POST /signup should return 201 and the new user created in the database", async () => {
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

    //assert
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
});
