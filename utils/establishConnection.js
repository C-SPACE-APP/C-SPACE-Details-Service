const mysql = require('mysql2/promise');

require('dotenv').config()
const establishConnection = async (hasDatabase) =>
{   

    
    if (hasDatabase)
    {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: `${process.env.DB_USERNAME}`,
            password: `${process.env.DB_PASSWORD}`
        });
    }
    else
    {
        connection = await mysql.createConnection({
            host: 'localhost',
            user: `${process.env.DB_USERNAME}`,
            password: `${process.env.DB_PASSWORD}`
        });
    }
    return connection 
}

module.exports =  establishConnection