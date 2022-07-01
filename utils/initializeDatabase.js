const establishConnection = require('./establishConnection')

const initializeDatabase = async () =>
{
    let isSuccessful = false
    const createPostDatabaseQuery = "CREATE DATABASE IF NOT EXISTS PostService;"
    const createPostTagDatabaseQuery = "CREATE DATABASE IF NOT EXISTS PostTagService;"
    const createPostTagTableQuery = "CREATE TABLE IF NOT EXISTS PostTag.PostTag(postID INT, tagName TEXT);"
    const createPostTableQuery = "CREATE TABLE IF NOT EXISTS PostService.Post(postID INT PRIMARY KEY AUTO_INCREMENT, title TEXT, description TEXT, createdAt DATETIME, updatedAt DATETIME);"
    let connection
    try
    {
        connection = await establishConnection(false)
        await connection.execute(createPostDatabaseQuery)
        await connection.execute(createPostTagDatabaseQuery)
        await connection.destroy()
        connection = await establishConnection(false)
        await connection.execute(createPostTableQuery)
        await connection.execute(createPostTagTableQuery)
        isSuccessful = true
        console.log("Database initialization successful")
    }
    catch(err)
    {
        console.log("Failed to initialize database.")
        console.log("Terminating program")
        console.log(`Error message: ${err}`)
    }
    await connection.destroy()
    return isSuccessful? true:false
}

module.exports = initializeDatabase