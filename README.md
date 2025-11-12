# Mini CRUD App

This project is a full-stack mini CRUD application designed to demonstrate a modular and scalable architecture. It consists of a **frontend** built with React and a **backend** implemented in Node.js with Express. The backend is divided into two services: `auth-service` for authentication and `products-service` for managing products. The application uses PostgreSQL as the database and Docker for containerization.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Backend Overview](#backend-overview)
   - [Auth-Service](#auth-service)
   - [Products-Service](#products-service)
3. [Design Patterns](#design-patterns)
4. [Testing](#testing)
5. [Next Implementations](#next-implementations)
6. [How to Run](#how-to-run)

---

## Project Structure

```
mini_crud_app/
├── backend/
│   ├── auth-service/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── __tests__/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   ├── config/
│   │   ├── init-scripts/
│   │   ├── routes/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── Dockerfile
│   │   ├── package.json
│   ├── products-service/
│   │   ├── products.js
│   │   ├── init-scripts/
│   │   ├── Dockerfile
│   │   ├── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── App.js
│   │   ├── setupTests.js
│   ├── Dockerfile
│   ├── package.json
├── docker-compose.yml
├── .github/
│   ├── workflows/
│       ├── deploy.yml
```

---

## Backend Overview

### Auth-Service

The `auth-service` handles user authentication and authorization. It is designed with a clean architecture, splitting the code into **controllers**, **services**, and **repositories**.

#### Key Features:

- **JWT-based Authentication**: Secure token generation and validation.
- **Password Hashing**: Uses `bcrypt` for hashing passwords.
- **Validation**: Input validation with `Joi`.
- **Database**: PostgreSQL with a connection pool.

#### Code Structure:

1. **Controllers**:

   - Handle HTTP requests and responses.
   - Example: `signup`, `login`, `demoLogin`.
   - File: [`authController.js`](backend/auth-service/controllers/authController.js)

2. **Services**:

   - Contain business logic.
   - Example: `validateSignupData`, `hashPassword`, `generateJwtToken`.
   - File: [`authService.js`](backend/auth-service/services/authService.js)

3. **Repositories**:

   - Handle database interactions.
   - Example: `createUser`, `findUser`, `executePrevQuery`.
   - File: [`authRepository.js`](backend/auth-service/repositories/authRepository.js)

4. **Tests**:
   - **Unit Tests**: Test individual functions in services and repositories.
   - **Integration Tests**: Test the entire flow of controllers.
   - Files: [`authService.unit.test.js`](backend/auth-service/__tests__/unit/authService.unit.test.js), [`authController.integration.test.js`](backend/auth-service/__tests__/integration/authController.integration.test.js)

---

### Products-Service

The `products-service` manages CRUD operations for products. It includes JWT-based authentication to ensure only authorized users can access the endpoints.

#### Key Features:

- **CRUD Operations**: Create, Read, Update, Delete products.
- **JWT Middleware**: Verifies tokens for secure access.
- **Database**: PostgreSQL with a connection pool.

#### Code Structure:

- Single-file implementation in [`products.js`](backend/products-service/products.js).
- Includes routes for all CRUD operations.

**TODO:** Refactor the `products-service` to follow the Controller-Service-Repository pattern for better modularity and maintainability.

---

## Design Patterns

### 1. **Controller-Service-Repository Pattern**

- **Controller**: Handles HTTP requests and delegates logic to services.
- **Service**: Contains business logic and validation.
- **Repository**: Handles database queries.

### 2. **Singleton and Lazy Loading**

- The PostgreSQL connection pool is implemented as a singleton to ensure only one instance is created and shared across the application.
- Lazy loading is used to initialize the pool only when it is first accessed.
- File: [`database.js`](backend/auth-service/config/database.js)

### 3. **AAA Pattern for Testing**

- **Arrange**: Set up the data and environment for the test.
- **Act**: Execute the function or code under test.
- **Assert**: Verify the result matches expectations.
- Example:

  ```js
  test("should hash a password", async () => {
    // Arrange
    const plaintextPassword = "test12345";

    // Act
    const hash = await hashPassword(plaintextPassword);

    // Assert
    expect(hash).toBeDefined();
    expect(hash).not.toBe(plaintextPassword);
  });
  ```

### 4. **Middleware Pattern**

- Used for JWT authentication in both services.
- Decouples authentication logic from route handlers.
- File: [`products.js`](backend/products-service/products.js)

---

## Testing

### Unit Tests

- Focus on individual functions in services and repositories.
- Mock external dependencies like the database.
- Example: [`authService.unit.test.js`](backend/auth-service/__tests__/unit/authService.unit.test.js)

### Integration Tests

- Test the entire flow of controllers, including services and repositories.
- Use `supertest` to simulate HTTP requests.
- Example: [`authController.integration.test.js`](backend/auth-service/__tests__/integration/authController.integration.test.js)

### Mocking the Database

In this project, the database is mocked for both **unit tests** (repositories) and **integration tests** (controllers) to ensure tests are isolated and do not depend on a live database.

#### **Unit Tests (Repositories)**:
- The database queries in the repository layer are mocked using `jest.fn()` to simulate database behavior.
- This ensures that the repository functions can be tested independently of the actual database.

#### **Integration Tests (Controllers)**:
- The database interactions in the controller layer are mocked by replacing the repository functions with mocked implementations.
- This allows testing the entire flow of the controller without requiring a live database.

#### **Example: Mocking the Database in Tests**
Here’s an example of how the database is mocked in the integration tests for the `auth-service`:

```javascript
// Mock the repository module before importing the app
jest.unstable_mockModule("../../repositories/authRepository.js", () => ({
  createUser: jest.fn(),
  executePrevQuery: jest.fn(),
  findUser: jest.fn(),
  testDatabaseConnection: jest.fn(),
}));

// Example of mocking a repository function
findUser.mockResolvedValueOnce({
  rows: [{ id: 1, username: "alex", email: "alex@gmail.com" }],
  rowCount: 1,
});
```

In this example:
1. The `findUser` function is mocked to return a resolved promise with a predefined user object.
2. This allows the controller to execute as if the database query succeeded, without actually querying the database.

---

## Next Implementations

1. **Secure JWT Storage**:

   - Replace local storage with HTTP-only cookies to mitigate XSS attacks.

2. **Role-Based Access Control (RBAC)**:

   - Add roles (e.g., admin, user) to manage permissions.

3. **Rate Limiting**:

   - Implement rate limiting to prevent abuse of endpoints.

4. **Logging and Monitoring**:

   - Add structured logging and monitoring tools like Pino, Winston or Datadog.

5. **API Documentation**:

   - Use Swagger or Postman to document the API.

6. **Testing Enhancements**:
   - Add end-to-end (E2E) tests for the entire application.

---

## How to Run

### Prerequisites

- Docker and Docker Compose installed.
- Node.js and npm installed (for local development).

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/mini_crud_app.git
   cd mini_crud_app
   ```

2. Start the application with Docker:

   ```bash
   docker-compose up --build
   ```

3. Access the application:

   - Frontend (Development): `http://localhost:3000` (React default page)
   - Frontend (Production): Uses a Cloudflared token for secure access.
     - Ensure `REACT_APP_IS_DEV` is set to `true` in development mode.
     - The application does not require register/login to view the main features. You can use the **Live Demo** button on the frontend to explore the application without authentication.
   - Auth-Service: `http://localhost:4030`
   - Products-Service: `http://localhost:4020`

4. Environment Setup:

   - Rename `.env.example` to `.env` and configure the required environment variables.

5. Run Tests:
   - Unit Tests:
     ```bash
     cd backend/auth-service
     npm install
     npm run test:unit
     ```
   - Integration Tests:
     ```bash
     npm run test:integration
     ```
     
   - All Tests:
     ```bash
     npm run test
     ```

---

## License

This project is licensed under the MIT License.
