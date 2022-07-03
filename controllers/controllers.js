const establishConnection = require('../utils/establishConnection')
const axios = require('axios')

const createPost = async (req,res) => {
    const reqLength = Object.keys(req.body).length
    const {title, description,userID} = req.body
    let postPayload
    
    // request validation, if either title,description, or username is not included in the request parameters,
    // the request will fail.
    if(reqLength != 3 || !title || !description || !userID)
        return res.status(400).json({message:"Bad request"})
    
    let connection = await establishConnection(true)
    try
    {
        postPayload = await connection.execute("INSERT INTO PostService.Post VALUES (0,?,?,NOW(),NOW())",[title,description])
        postID = postPayload[0]["insertId"]
        // axios call to interaction (creating new data for interaction)
        await axios({
            method: 'post',
            data:{
                userID:userID,
                postID:postID
            },
            url: 'http://localhost:3005/createPostInteraction/'
        })
    }
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()
    return res.status(200).json({returnData:postPayload,message:"Successfully created post!"}) 
}

const getPostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // use this when using the like keyword
    const searchQuery = query? `%${query}%`:`%`

    // use this instead when using the regex equivalent
    // const searchQuery = query? `(\s){0,}${query}(\s){0,}`:`.*`
    
    let connection = await establishConnection(true)
    try
    {
        //query that uses the like keyword
        postArr = await connection.execute("SELECT * FROM InteractionService.interaction LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title LIKE ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL ORDER BY InteractionService.Interaction.postID ASC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
        
        // query that uses regex
        //postArr = await connection.execute("SELECT * FROM InteractionService.interaction LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title REGEXP ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL ORDER BY InteractionService.Interaction.postID ASC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


const getHotPostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // use this when using the like keyword
    const searchQuery = query? `%${query}%`:`%`

    // use this instead when using the regex equivalent
    // const searchQuery = query? `(\s){0,}${query}(\s){0,}`:`.*`
    
    let connection = await establishConnection(true)
    try
    {
        //query that uses the like keyword
        postArr = await connection.execute("SELECT * FROM InteractionService.vote RIGHT JOIN InteractionService.interaction ON InteractionService.vote.interactionID = InteractionService.interaction.interactionID LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title LIKE ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL GROUP BY InteractionService.vote.voteID ORDER BY (COUNT(CASE WHEN InteractionService.vote.vote = 1 THEN 1 ELSE NULL END) - COUNT(CASE WHEN InteractionService.vote.vote = 0 THEN 1 ELSE NULL END)) / TIMESTAMPDIFF(MINUTE,PostService.post.createdAt,NOW()) DESC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
        
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


const getNewPostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // use this when using the like keyword
    const searchQuery = query? `%${query}%`:`%`

    // use this instead when using the regex equivalent
    // const searchQuery = query? `(\s){0,}${query}(\s){0,}`:`.*`
    
    let connection = await establishConnection(true)
    try
    {
        //query that uses the like keyword
        postArr = await connection.execute("SELECT * FROM InteractionService.interaction LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title LIKE ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL GROUP BY InteractionService.interaction.interactionID ORDER BY PostService.post.createdAt DESC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
        
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


const getTopPostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // use this when using the like keyword
    const searchQuery = query? `%${query}%`:`%`

    // use this instead when using the regex equivalent
    // const searchQuery = query? `(\s){0,}${query}(\s){0,}`:`.*`
    
    let connection = await establishConnection(true)
    try
    {
        //query that uses the like keyword
        postArr = await connection.execute("SELECT * FROM InteractionService.vote RIGHT JOIN InteractionService.interaction ON InteractionService.vote.interactionID = InteractionService.interaction.interactionID LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title LIKE ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL GROUP BY InteractionService.vote.voteID ORDER BY COUNT(CASE WHEN InteractionService.vote.vote = 1 THEN 1 ELSE NULL END) - COUNT(CASE WHEN InteractionService.vote.vote = 0 THEN 1 ELSE NULL END) DESC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
        
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


const getActivePostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // use this when using the like keyword
    const searchQuery = query? `%${query}%`:`%`
    
    let connection = await establishConnection(true)
    try
    {
        //query that uses the like keyword
        postArr = await connection.execute("SELECT * FROM PostService.post RIGHT JOIN InteractionService.interaction ON PostService.post.postID = InteractionService.interaction.postID INNER JOIN CommentService.`comment` ON InteractionService.interaction.commentID = CommentService.`comment`.commentID WHERE InteractionService.interaction.commentID IS NOT NULL AND TIMESTAMPDIFF(HOUR,CommentService.`comment`.createdAt,NOW())  <= 24 AND PostService.post.title LIKE ? GROUP BY InteractionService.interaction.postID ORDER BY COUNT(InteractionService.interaction.postID) DESC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
        
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


const getPostOne = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    // request validation, if postID is not included in the request parameters,
    // the request will fail.
    if(reqLength != 1 || !postID)
        return res.status(400).json({
            message:"Bad request"
        })
    
    let connection = await establishConnection(true)
    
    try
    {
        postArr = await connection.execute("SELECT * FROM PostService.post WHERE PostService.post.postID = ? LIMIT 1",[postID])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


const associatePostWithTag = async (req,res) => {
    const reqLength = Object.keys(req.body).length
    const {postID,tagNameArray} = req.body
    let postPayload,duplicateChecker
    
    // request validation, if either title,description, or username is not included in the request parameters,
    // the request will fail.
    if(reqLength != 2 || !postID || !tagNameArray)
        return res.status(400).json({message:"Bad request"})

    if(tagNameArray.isArray)
        if(tagNameArray.length === 0)
            return res.status(400).json({message:"Request body has an array of tag ID with length zero"})
    else
        return res.status(400).json({message:"tagNameArray is not an array"})
    
    let connection = await establishConnection(false)
    try
    {
        for(let iterator = 0; iterator < tagNameArray.length; iterator++)
        {
            duplicateChecker = await connection.execute("SELECT * FROM PostTagService.PostTag WHERE PostTagService.PostTag.postID = ? AND PostTagService.PostTag.tagName = ?",[postID,tagNameArray[iterator]])
            if(duplicateChecker[0].length > 0)
                return res.status(403).json({message:"Selected post has a duplicate tag associated with it"})
            postPayload = await connection.execute("INSERT INTO PostTagService.PostTag VALUES (?,?)",[postID,tagNameArray[iterator]])
        }
            
    }
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()
    return res.status(200).json({returnData:postPayload,message:"Successfully associated post with tag(s)!"}) 
}

const getTagsPerPost = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    let tagNameArray
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if(reqLength != 1 || !postID)
        return res.status(400).json({
            message:"Bad request"
        })
    
    let connection = await establishConnection(false)
    
    try
    {
        postArr = await connection.execute("SELECT tagName FROM PostTagService.PostTag WHERE PostTagService.PostTag.postID = ?",[postID])
        tagNameArray = postArr[0].map(
            (value) =>
            {
                return value["tagName"]
            })
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:tagNameArray})
    else
        res.status(200).json({returnData:false})
}


const getPostsPerTag = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    let tagNameArray
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if(reqLength != 1 || !postID)
        return res.status(400).json({
            message:"Bad request"
        })
    
    let connection = await establishConnection(false)
    
    try
    {
        postArr = await connection.execute("SELECT * FROM PostTagService.PostTag INNER JOIN InteractionService.interaction ON PostTagService.posttag.postID = InteractionService.interaction.postID WHERE PostTagService.posttag.tagName = ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL",[postID])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:tagNameArray})
    else
        res.status(200).json({returnData:false})
}


const getTagCountByTagName = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {tagName} = req.params
    let returnValue, tagCount
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if(reqLength != 1 || !tagName)
        return res.status(400).json({
            message:"Bad request"
        })
    
    let connection = await establishConnection(false)
    
    try
    {
        returnValue = await connection.execute("SELECT COUNT(PostTagService.PostTag.tagName) AS tagCount FROM PostTagService.PostTag WHERE PostTagService.PostTag.tagName = ? GROUP BY PostTagService.PostTag.tagName",[tagName])
        tagCount = returnValue[0][0]["tagCount"]
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (tagCount)
        res.status(200).json({returnData:tagCount})
    else
        res.status(200).json({returnData:false})
}


const createComment = async (req,res) => {
    const reqLength = Object.keys(req.body).length
    const {comment,postID,userID,isReply,parentID} = req.body
    let postPayload
    
    // request validation, if either title,description, or username is not included in the request parameters,
    // the request will fail.
    if( (reqLength != 4 && reqLength != 5) || !comment || !postID || !userID || isReply === null)
        return res.status(400).json({message:"Bad request"})

    if(reqLength == 5 && !parentID && isReply)
        return res.status(400).json({message:"parentID does not exist"})

    if(isReply)
        IDOfCommentToReply = parentID
    else
        IDOfCommentToReply = null

    let connection = await establishConnection(false)
    try
    {
        commentPayload = await connection.execute("INSERT INTO CommentService.Comment VALUES (0,?,NOW(),NOW())",[comment])
        commentID = commentPayload[0]["insertId"]
        // axios call to interaction (creating new data for interaction)
        await axios({ 
            method: 'post',
            data:{
                userID:userID,
                postID:postID,
                commentID:commentID,
                parentID:IDOfCommentToReply,
            },
            url: 'http://localhost:3005/createCommentInteraction/'
        })
    }
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()
    return res.status(200).json({returnData:postPayload,message:"Successfully created comment!"}) 
}


const getCommentsByPost = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    let commentArr
    // request validation, if either username or password is not included in the request parameters,
    // the request will fail.
    if( reqLength != 1 || !postID)
        return res.status(400).json({
            message:"Bad request"
        })
    
    
    let connection = await establishConnection(false)
    try
    {
        //query that uses the like keyword
        commentArr = await connection.execute("SELECT * FROM InteractionService.interaction JOIN CommentService.\`comment\` ON InteractionService.interaction.commentID = CommentService.\`comment\`.commentID WHERE InteractionService.interaction.commentID IS NOT NULL AND InteractionService.interaction.postID = ?",[postID])   
    }
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (commentArr)
        res.status(200).json({returnData:commentArr})
    else
        res.status(200).json({returnData:false})
}


const editPostOne = async (req,res) => {
    const reqLength = Object.keys(req.body).length
    const {postID,title,description} = req.body
    // request validation, if postID is not included in the request parameters,
    // the request will fail.
    if(reqLength != 3 || !postID || !title || !description)
        return res.status(400).json({
            message:"Bad request"
        })
    
    let connection = await establishConnection(true)
    
    try
    {
        await connection.execute("UPDATE PostService.post SET title = ?, description = ?, updatedAt = NOW() WHERE PostService.post.postID = ?",[title,description,postID])
        postArr = await connection.execute("SELECT * FROM PostService.post WHERE PostService.post.postID = ?",[postID])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}



const deletePostOne = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    // request validation, if postID is not included in the request parameters,
    // the request will fail.
    if(reqLength != 1 || !postID)
        return res.status(400).json({
            message:"Bad request"
        })
    
    let connection = await establishConnection(true)
    
    try
    {
        await connection.execute("DELETE FROM PostService.post WHERE postID = ?",[postID])
        await connection.execute("DELETE FROM InteractionService.interaction WHERE postID = ?",[postID])
        await connection.execute("DELETE FROM InteractionService.view WHERE postID = ?",[postID])
        await connection.execute("DELETE FROM InteractionService.vote WHERE postID = ?",[postID])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    res.status(200).json({message:"Successfully deleted data!"})

}



const getPostsByUsername = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {userID} = req.params
    // request validation, if postID is not included in the request parameters,
    // the request will fail.
    if(reqLength != 1 || !userID)
        return res.status(400).json({
            message:"Bad request"
        })
    
    let connection = await establishConnection(true)
    
    try
    {
        postArr = await connection.execute("SELECT * FROM InteractionService.interaction LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE InteractionService.interaction.userID = ? AND PostService.post.isAnonymous = 0 ORDER BY PostService.post.createdAt DESC",[userID])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:null})
}

const getAnswersByUsername = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {userID} = req.params
    // request validation, if postID is not included in the request parameters,
    // the request will fail.
    if(reqLength != 1 || !userID)
        return res.status(400).json({
            message:"Bad request"
        })
    
    let connection = await establishConnection(true)
    
    try
    {
        commentArr = await connection.execute("SELECT * FROM InteractionService.interaction LEFT JOIN CommentService.comment ON InteractionService.interaction.commentID = CommentService.comment.commentID WHERE InteractionService.interaction.userID = ? AND InteractionService.interaction.commentID IS NOT NULL AND InteractionService.interaction.parentID IS NULL ORDER BY PostService.post.createdAt DESC",[userID])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    // returns either true or false depending if the credentials matched with the database
    if (commentArr)
        res.status(200).json({returnData:commentArr[0]})
    else
        res.status(200).json({returnData:null})
}

const unassociatePostTag = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    
    // request validation, if either title,description, or username is not included in the request parameters,
    // the request will fail.
    if(reqLength != 1 || !postID)
        return res.status(400).json({message:"Bad request"})
    
    let connection = await establishConnection(false)
    try
    {
        await connection.execute("DELETE FROM PostTagService.PostTag WHERE postID = ?",[postID])
    }
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({message:`${err}`})
    }
    await connection.destroy()
    return res.status(200).json({message:"Successfully unassociated tags from a post!"}) 
}



module.exports = {createPost,getPostsByPage,getHotPostsByPage,getNewPostsByPage,getTopPostsByPage,getActivePostsByPage,getPostOne,associatePostWithTag,getTagsPerPost,getTagCountByTagName,getPostsPerTag,createComment,getCommentsByPost,editPostOne,deletePostOne,getPostsByUsername,getAnswersByUsername,unassociatePostTag}