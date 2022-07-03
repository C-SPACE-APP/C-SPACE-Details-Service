const establishConnection = require('./establishConnection')

const initializeDatabase = async () =>
{
    let isSuccessful = false
    const createPostDatabaseQuery = "CREATE DATABASE IF NOT EXISTS PostService;"
    const createPostTagDatabaseQuery = "CREATE DATABASE IF NOT EXISTS PostTagService;"
    const createCommentDatabaseQuery = "CREATE DATABASE IF NOT EXISTS CommentService;"

    const createPostTagTableQuery = "CREATE TABLE IF NOT EXISTS PostTagService.PostTag(postID INT, tagName TEXT);"
    const createPostTableQuery = "CREATE TABLE IF NOT EXISTS Post(postID INT PRIMARY KEY AUTO_INCREMENT, title TEXT, description TEXT, createdAt DATETIME, updatedAt DATETIME,isAnonymous INT);"
    const createCommentTableQuery = "CREATE TABLE IF NOT EXISTS CommentService.Comment(commentID INT PRIMARY KEY AUTO_INCREMENT, comment TEXT, createdAt DATETIME, updatedAt DATETIME);"
    
    let connection
    try
    {
        connection = await establishConnection(false)
        await connection.execute(createPostDatabaseQuery)
        await connection.execute(createPostTagDatabaseQuery)
        await connection.execute(createCommentDatabaseQuery)
        await connection.destroy()
        connection = await establishConnection(false)
        await connection.execute(createPostTableQuery)
        await connection.execute(createPostTagTableQuery)
        await connection.execute(createCommentTableQuery)
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