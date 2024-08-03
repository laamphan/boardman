# Repository Structure

This document provides an overview of the structure of the repository.

## Root Directory

- Config files

## Directories

### api - Backend

- **controllers**: Logic for handling API requests.
- **db**: Firebase configuration.
- **routes**: API routes.
- **utils**: Utility functions.
- **index.ts**: Entry point for the server.

### client - Frontend

- **src**: Source code for the client-side application.

  - **components**: React components.
  - **lib**: Utility functions.
  - **pages**: React pages.
  - **redux**: Redux store, actions, and reducers.
  - **types**: TypeScript type definitions.
    - [db.ts](client/src/types/db.ts): Type definitions related to the database.
    - [dnd.ts](client/src/types/dnd.ts): Type definitions for React drag-and-drop.
    - [firebase.d.ts](client/src/types/firebase.d.ts): Type definitions for Firebase.
  - **main.tsx**: Entry point for the client-side application.
  - **App.tsx**: Main component for the client-side application.
  - **firebase.ts**: Firebase configuration.



- **README.md**: Provides an overview and setup instructions for the client-side application.

## Scripts

- **dev**: Starts the development server using nodemon.
- **start**: Starts the production server.
- **build**: Installs dependencies and builds the client-side application.

## Dependencies

- **cookie-parser**: Middleware for parsing cookies.
- **cors**: Middleware for enabling CORS.
- **dotenv**: Loads environment variables from a `.env` file.
- **express**: Web framework for Node.js.
- **firebase**: Firebase client SDK.
- **firebase-admin**: Firebase Admin SDK.
- **jsonwebtoken**: Library for working with JSON Web Tokens.
- **nodemailer**: Module for sending emails.
- **nodemon**: Utility for automatically restarting the server during development.
- **uuidv4**: Library for generating UUIDs.

## DevDependencies

- **@types**: TypeScript type definitions for various libraries.
- **ts-node**: TypeScript execution environment for Node.js.
- **typescript**: TypeScript language.

## Notes

- The client-side application is built using React, TypeScript, and Vite.
- The API interacts with GitHub to fetch repository information.

For more details, refer to the respective files and directories mentioned above.
