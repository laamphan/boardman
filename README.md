# Repository Structure

This document provides an overview of the structure of the repository.

## Root Directory

- Configuration files

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
    - _db.ts_ : Type definitions related to the database.
    - _dnd.ts_ : Type definitions for React drag-and-drop.
    - _firebase.d.ts_ : Type definitions for Firebase.
  - **main.tsx**: Entry point for the client-side application.
  - **App.tsx**: Main component for the client-side application.
  - **firebase.ts**: Firebase configuration.

- **README.md**: Provides an overview and setup instructions for the client-side application.
- Configuration files

## ENV Variables

- Examples are provided in `.env.example` files in the root and client directories.
- For mailing, this repository uses `nodemailer` and Brevo SMTP server. Set these variables in the root directory `.env` file accordingly:
  - `NODEMAILER_SENDER`
  - `NODEMAILER_USER`
  - `NODEMAILER_PASS`
- For Firebase, set the following variables in the root directory `.env` file:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`
  - `FIREBASE_DATABASE_URL`
- and in the client directory `.env` file (don't forget to change config in client's `firebase.ts`):
  - `VITE_FIREBASE_API_KEY`

## How to Run

- Clone the repository
- Run `pnpm install` in root & client directory to install dependencies
- Run `pnpm dev` in root & client directory to start the server and client-side application

## Screenshots

- https://docs.google.com/presentation/d/1osZkcShKD8SDjth-5KAqz-rJMU_fwEBuNYYcBdRgMlE/edit?usp=sharing

## Notes

- If you want to use `npm` or `yarn`, remove `pnpm-lock.yaml` and replace `pnpm` with the respective package manager in the scripts.
- For using Github API, sign in with Github to avoid being rate-limited.

For more details, refer to the respective files and directories mentioned above.
