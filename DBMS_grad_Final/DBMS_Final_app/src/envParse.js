/*James Letts
Database Management Systems
12/04/2026
Final Project*/

require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    SI_SECRET_KEY: process.env.SI_SECRET_KEY,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PATH: process.env.DB_PATH,
    DB_CONNECTION_LIMIT: process.env.DB_CONNECTION_LIMIT,
    DB_QUEUE_LIMIT: process.env.DB_QUEUE_LIMIT_LIMIT
}