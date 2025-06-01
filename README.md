# DataWow API

This is a NestJS application for managing concerts and reservations.

## Prerequisites

* Node.js (v18.x or later recommended)
* npm (usually comes with Node.js)

## Setup

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <your-repository-url>
    cd datawow-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the development server:**
    ```bash
    npm run start:dev
    ```
    The application will be running on `http://localhost:3000` by default.

## Testing the Application

1.  **Run unit tests:**
    ```bash
    npm run test
    ```
    This command will execute all `*.spec.ts` files in the `src` directory using Jest.

2.  **Run unit tests with coverage:**
    ```bash
    npm run test:cov
    ```
    This will generate a coverage report in the `coverage` directory.

## API Endpoints

(You can add a brief overview of your main API endpoints here later, for example:)

### Concerts

*   `POST /concerts` - Create a new concert
*   `GET /concerts` - Get all concerts
*   `GET /concerts/:id` - Get a specific concert by ID
*   `DELETE /concerts/:id` - Delete a concert by ID

### Reservations

*   `POST /reservations` - Create a new reservation
*   `GET /reservations` - Get all active reservations (requires `userId` in query)
*   `GET /reservations/logs` - Get all reservation logs (admin)
*   `DELETE /reservations/:id` - Cancel a reservation (requires `userId` in body)

## Project Structure (Brief Overview)

```
datawow-api/
├── src/
│   ├── concerts/               # Concerts module
│   │   ├── dto/                # Data Transfer Objects for concerts
│   │   ├── interfaces/         # Interfaces for concerts
│   │   ├── concerts.controller.ts
│   │   ├── concerts.module.ts
│   │   ├── concerts.service.ts
│   │   └── concerts.service.spec.ts
│   ├── reservations/           # Reservations module
│   │   ├── dto/                # Data Transfer Objects for reservations
│   │   ├── interfaces/         # Interfaces for reservations
│   │   ├── reservations.controller.ts
│   │   ├── reservations.module.ts
│   │   ├── reservations.service.ts
│   │   └── reservations.service.spec.ts
│   ├── app.module.ts         # Root module
│   └── main.ts               # Application entry point
├── test/
│   └── ...                   # End-to-end tests
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── nest-cli.json
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

## Further Help

For more information on NestJS, check out the [NestJS documentation](https://docs.nestjs.com/).
