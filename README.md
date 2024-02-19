# Rock Paper Scissors Lizard Spock

Implement the Rock Paper Scissors Lizard Spock Contract as a full-stack application

## Solution Summary

1. Players sign-in-with ethereum and can then either create or join a game
2. Create a game using the contract abi and bytecode.
   1. Get a cryptographically strong salt from the backend
   2. Store in the front-end app's memory (zustand-store)
3. Validate the transaction hash, and create a record of the created game with minimal data in a database
4. Display a list of created games. Authenticated 'joiners' can view a list of games and 'play' games they are selected for.
5. Use sockets to update players of the opponents actions
6. Solve or timeout (when available) game and mark the corresponding record as complete.
   1. Solve by using the saved (in the front-end app's memory) salt and move.

## Security Considerations

- As we cannot modify the smart-contract, security is centered around keeping the salt secure
- Generate a [cryptographically strong random salt](https://nodejs.org/api/crypto.html#cryptorandombytessize-callback)
- Provide and handle it
- Basically a trade-off between security and convenience

### Options Possible

#### 1. Completely Manually

Security: Very High --- Convenience: Very Low

1. The salt is handled entirely by the user and never interacts with the system

#### 2. Front-End Memory Only - Implemented

Security: High --- Convenience: Medium

1. A salt is generated securely and persists in the user's front end.
2. Will be lost if user navigates or closes tab

#### 3. Front-End Memory Plus Local-Storage

Security: High --- Convenience: High

1. A salt is generated securely and persists in the user's front end and browser's localStorage.
2. Can persist accross navigations and tab-closes
3. This is a good default.
4. I was aiming for a combination of this and Option 4, but ultimately delivered 2 due to time constraints

#### 4. Front-End Plus Database

Security: Medium --- Convenience: Very High

1. A salt is generated securely and persists in the user's front end and the backend database.
2. App usable from anywhere
3. Slightly lower security due to traffic of salt and another vector of attack available, i.e. database

## Backend - Personal Observations

I was initially implementing option 4, which was my main motivation for setting up Sign-in-with-ethereum for this exercise. However, I scaled back and ended up going with option 2 due to time-constraints.

## Backend - Possible Improvements

1. In a ripple-based project, I got signed transaction from the users and handled and submitted them from the backend. I feel like a similar strategy could be used here for good effect. Will have to check if and how ethereum implements such a flow.

2. Currently, some properties are transient (in-memory), such as:
   1. Socket Identifiers
   2. IV used in socket identifier creation
   3. These could be shifted to database
   4. Scaled up adapter for sockets to be used in production under high load

2. Implement Option-4 of course
