# Getting Started

How to run the backend for the application:

1. You will need:
   1. Node version 18.15 or greater
   2. Npm version 9.5 or greater
   3. A package manager, preferably yarn
   4. Connection to a postgres database
      1. This project is configured to run with postgres, but can be modified to accomodate other relational databases as well.
2. Obtain and fill-in the environment variables as specified in .env.example
3. For local development: use `npm run dev`
4. For production:
   1. Obtain a build wiht `npm run build`
   2. Start the application with `npm run start`
