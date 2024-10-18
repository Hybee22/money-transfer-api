# Money Transfer API

This is a RESTful API for a money transfer application built with Node.js, Express, and TypeScript.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed the latest version of [Node.js and npm](https://nodejs.org/en/download/)
* You have a Windows/Linux/Mac machine.
* You have read this guide.

## Installing Money Transfer API

To install the Money Transfer API, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/hybee22/money-transfer-api.git
   ```
2. Navigate to the project directory:
   ```
   cd money-transfer-api
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuring the Application

1. Create a `.env` file in the root directory of the project.
2. Add the following environment variables to the `.env` file:
   ```
   PORT=9000
   JWT_SECRET=your_jwt_secret_here
   DB_HOST=your_database_host
   DB_PORT=your_database_port
   DB_USERNAME=your_database_username
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   SUPER_ADMIN_PASSWORD=your_super_admin_password
   ```
   Replace the placeholders with your actual database credentials and desired JWT secret.

## Running the Application

To run the Money Transfer API, follow these steps:

1. For development:
   ```
   npm run dev
   ```
2. For production:
   ```
   npm run build
   npm start
   ```

The server will start running on `http://localhost:9000` (or the port you specified in the .env file).

## Running Tests

To run the tests for this project, use the following command:

```
npm test
```

This will execute all test files in the project using Jest.

## API Documentation

For detailed API documentation and testing, you can use our Postman collection:

[View API Documentation in Postman](https://documenter.getpostman.com/view/7036082/2sAXxWZpG4)

This collection provides a comprehensive set of API endpoints and examples to help you interact with our service.
