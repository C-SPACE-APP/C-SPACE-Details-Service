const establishConnection = require('../utils/establishConnection')
const axios = require('axios')


/*

createPost - POST REQUEST    

Request type: Body

Argument:

title:String
description:String
userID:String
isAnonymous:Boolean

Description:

Creates a post in the Post database then calls Interaction Service to append an Interaction object in the Interaction database


Return value:

message - The status message of the endpoint

*/

const createPost = async (req,res) => {
    const reqLength = Object.keys(req.body).length
    const {title, description,userID,isAnonymous} = req.body
    let postPayload


    let isAnonymousObjConverter = 
    {
        true:1,
        false:0
    }

    // request validation
    if(reqLength != 4 || !title || !description || !userID || isAnonymous === null)
        return res.status(400).json({message:"Bad request"})
    
    let connection = await establishConnection(true)
    try
    {
        postPayload = await connection.execute("INSERT INTO PostService.Post VALUES (0,?,?,NOW(),NOW(),?)",[title,description,isAnonymousObjConverter[isAnonymous]])
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


/*

getPostsByPage - GET REQUEST    

Request type: Params

Arguments:

pageNumber:Int
limitPerPage:Int
query:String/Null

Description:

Implements a back-end pagination mechanism and returns x posts based on the page number of the query and limit per page


Return value:

returnData - a JSON object containing the requested data
message - The status message of the endpoint

*/

const getPostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params

    const offset = String((pageNumber - 1) * limitPerPage)

    // request validation
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // if no query parameter is found, then retrieve just anything
    const searchQuery = query? `%${query}%`:`%`


    
    let connection = await establishConnection(true)
    try
    {
        postArr = await connection.execute("SELECT * FROM InteractionService.interaction LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title LIKE ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL ORDER BY InteractionService.Interaction.postID ASC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    if (postArr)
        res.status(200).json({returnData:postArr[0],message:"Successfully retrieved posts!"})
    else
        res.status(200).json({returnData:null,message:"Could not retrieve any post"})
}


/*

getHotPostsByPage - GET REQUEST    

Request type: Params

Arguments:

pageNumber:Int
limitPerPage:Int
query:String/Null

Description:

Implements a back-end pagination mechanism and returns x posts based on the page number of the query and limit per page

Posts are now sorted by their hotness.

Calculation:

Hotness constant = # of current upvotes per post / (# of hours elapsed since post creation + 1)


P.S. Can be divided with a multiplicative constant to further hasten or delay the hotness of the post

Return value:

returnData - a JSON object containing the requested data
message - The status message of the endpoint

*/

const getHotPostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // if no query parameter is found, then retrieve just anything
    const searchQuery = query? `%${query}%`:`%`

    
    let connection = await establishConnection(true)
    try
    {
        postArr = await connection.execute("SELECT * FROM InteractionService.vote RIGHT JOIN InteractionService.interaction ON InteractionService.vote.interactionID = InteractionService.interaction.interactionID LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title LIKE ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL GROUP BY InteractionService.interaction.interactionID ORDER BY (COUNT(CASE WHEN InteractionService.vote.vote = 1 THEN 1 ELSE NULL END) - COUNT(CASE WHEN InteractionService.vote.vote = 0 THEN 1 ELSE NULL END)) / (TIMESTAMPDIFF(HOUR,PostService.post.createdAt,NOW()) + 1) DESC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
        
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()


    if (postArr)
        res.status(200).json({returnData:postArr[0],message:"Successfully retrieved hot posts!"})
    else
        res.status(404).json({returnData:null,message:"Could not retrieve any hot post"})
}


/*

getNewPostsByPage - GET REQUEST    

Request type: Params

Arguments:

pageNumber:Int
limitPerPage:Int
query:String/Null

Description:

Implements a back-end pagination mechanism and returns x posts based on the page number of the query and limit per page

Posts are now sorted by how recent the post is.


Return value:

returnData - a JSON object containing the requested data
message - The status message of the endpoint

*/

const getNewPostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // if no query parameter is found, then retrieve just anything
    const searchQuery = query? `%${query}%`:`%`

    let connection = await establishConnection(true)
    try
    {
        postArr = await connection.execute("SELECT * FROM InteractionService.interaction LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title LIKE ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL GROUP BY InteractionService.interaction.interactionID ORDER BY PostService.post.createdAt DESC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
        
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


/*

getTopPostsByPage - GET REQUEST    

Request type: Params

Arguments:

pageNumber:Int
limitPerPage:Int
query:String/Null

Description:

Implements a back-end pagination mechanism and returns x posts based on the page number of the query and limit per page

Posts are sorted on the basis of the total net votes of a post


Return value:

returnData - a JSON object containing the requested data

message - The status message of the endpoint

*/

const getTopPostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // if no query parameter is found, then retrieve just anything
    const searchQuery = query? `%${query}%`:`%`
    
    let connection = await establishConnection(true)
    try
    {
        postArr = await connection.execute("SELECT * FROM InteractionService.vote RIGHT JOIN InteractionService.interaction ON InteractionService.vote.interactionID = InteractionService.interaction.interactionID LEFT JOIN PostService.post ON InteractionService.interaction.postID = PostService.post.postID WHERE PostService.post.title LIKE ? AND InteractionService.interaction.commentID IS NULL AND InteractionService.interaction.parentID IS NULL GROUP BY InteractionService.vote.voteID ORDER BY COUNT(CASE WHEN InteractionService.vote.vote = 1 THEN 1 ELSE NULL END) - COUNT(CASE WHEN InteractionService.vote.vote = 0 THEN 1 ELSE NULL END) DESC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


/*

getActivePostsByPage - GET REQUEST    

Request type: Params

Arguments:

pageNumber:Int
limitPerPage:Int
query:String/Null

Description:

Implements a back-end pagination mechanism and returns x posts based on the page number of the query and limit per page

Posts are sorted on the basis of active comments in the past 24 hours


Return value:

returnData - a JSON object containing the requested data

message - The status message of the endpoint

*/

const getActivePostsByPage = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {pageNumber,limitPerPage,query} = req.params
    const offset = String((pageNumber - 1) * limitPerPage)
    // request validation
    if( (reqLength != 2 && reqLength != 3) || !pageNumber || !limitPerPage)
        return res.status(400).json({
            message:"Bad request"
        })
    
    // if no query parameter is found, then retrieve just anything
    const searchQuery = query? `%${query}%`:`%`
    
    let connection = await establishConnection(true)
    try
    {
        postArr = await connection.execute("SELECT * FROM PostService.post RIGHT JOIN InteractionService.interaction ON PostService.post.postID = InteractionService.interaction.postID LEFT JOIN CommentService.`comment` ON InteractionService.interaction.commentID = CommentService.`comment`.commentID WHERE PostService.post.title LIKE ? GROUP BY InteractionService.interaction.interactionID ORDER BY COUNT(CASE WHEN InteractionService.interaction.commentID IS NOT NULL AND TIMESTAMPDIFF(HOUR,CommentService.`comment`.createdAt,NOW())  <= 24 THEN 1 ELSE NULL END) DESC LIMIT ? OFFSET ?",[searchQuery,limitPerPage,offset])
    }   
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    if (postArr)
        res.status(200).json({returnData:postArr[0]})
    else
        res.status(200).json({returnData:false})
}


/*

getPostOne - GET REQUEST    

Request type: Params

Arguments:

postID:Int

Description:

Retrieves the post details given a postID


Return value:

returnData - a JSON object containing the requested data

message - The status message of the endpoint

*/

const getPostOne = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    // request validation
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
    
    if (postArr)
        res.status(200).json({returnData:postArr[0],message:"Successfully retrieved post"})
    else
        res.status(404).json({returnData:null,message:"Failed to retrieve post"})
}


/*

associatePostWithTag - PATCH REQUEST    

Request type: Body

Arguments:

postID:Int
tagNameArray:Array[String]

Description:

Labels the post with associated tags.

Return value:

returnData - a JSON object containing the requested data

message - The status message of the endpoint

*/

const associatePostWithTag = async (req,res) => {
    const reqLength = Object.keys(req.body).length
    const {postID,tagNameArray} = req.body
    let postPayload,duplicateChecker
    
    // request validation
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


/*

getTagsPerPost - GET REQUEST    

Request type: Params

Arguments:

postID:Int

Description:

Retrieves the tags of a given post.

Return value:

returnData - a JSON object containing the requested data

message - The status message of the endpoint

*/

const getTagsPerPost = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    let tagNameArray
    // request validation
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

    if (postArr)
        res.status(200).json({returnData:tagNameArray,message:"Successfully retrieved tags of a post"})
    else
        res.status(200).json({returnData:null,message:"Failed to retrieve tags of a post"})
}


/*

getPostsPerTag - GET REQUEST    

Request type: Params

Arguments:

postID:Int

Description:

Retrieves the marked posts of a given tag.

Return value:

returnData - a JSON object containing the requested data

message - The status message of the endpoint

*/

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
        res.status(200).json({returnData:tagNameArray,message:"Successfully retrieved posts by tag"})
    else
        res.status(404).json({returnData:false,message:"Failed to retrieve posts by tag"})
}



/*

getTagCountByTagName - GET REQUEST    

Request type: Params

Arguments:

postID:Int

Description:

Retrieves the tag count given a tag name.

Return value:

returnData - a JSON object containing the requested data

message - The status message of the endpoint

*/

const getTagCountByTagName = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {tagName} = req.params
    let returnValue, tagCount
    // request validation
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
        res.status(200).json({returnData:tagCount,message:"Successfully retrieved tag count!"})
    else
        res.status(200).json({returnData:null,message:"Failed to retrieve tag count"})
}


/*

createComment - POST REQUEST    

Request type: Body

Arguments:

comment:String
postID:Int
userID:String
isReply:Boolean
parentID:Int


Description:

Creates a comment object and calls the Interaction service to add an interaction object for the given comment

Return value:

message - The status message of the endpoint

*/

const createComment = async (req,res) => {
    const reqLength = Object.keys(req.body).length
    const {comment,postID,userID,isReply,parentID} = req.body
    
    // request validation
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
        return res.status(400).json({message:`${err}`})
    }
    await connection.destroy()
    return res.status(200).json({message:"Successfully created comment!"}) 
}

/*

getCommentsByPost - GET REQUEST    

Request type: Body

Arguments:

postID:Int


Description:

Fetches comments by post given a postID

Return value:

message - The status message of the endpoint

*/

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
        commentArr = await connection.execute("SELECT * FROM InteractionService.interaction JOIN CommentService.\`comment\` ON InteractionService.interaction.commentID = CommentService.\`comment\`.commentID WHERE InteractionService.interaction.commentID IS NOT NULL AND InteractionService.interaction.postID = ?",[postID])   
    }
    catch(err)
    {
        await connection.destroy()
        return res.status(400).json({returnData:null,message:`${err}`})
    }
    await connection.destroy()

    if (commentArr)
        res.status(200).json({returnData:commentArr,message:"Successfully fetched comments from a post!"})
    else
        res.status(404).json({returnData:null,message:"Failed to fetch comments from a post"})
}


/*

editPostOne - PATCH REQUEST    

Request type: Body

Arguments:

postID:Int
title:String
description:String

Description:

Edits post details given a post ID

Return value:

returnData - a JSON object containing the requested data

message - The status message of the endpoint

*/

const editPostOne = async (req,res) => {
    const reqLength = Object.keys(req.body).length
    const {postID,title,description} = req.body
    // request validation
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

    if (postArr)
        res.status(200).json({returnData:postArr[0],message:"Post edited!"})
    else
        res.status(200).json({returnData:null,message:"Failed to edit post"})
}

/*

deletePostOne - PATCH REQUEST    

Request type: Params

Arguments:

postID:Int

Description:

Deletes a post given a post ID

Return value:

message - The status message of the endpoint

*/

const deletePostOne = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    // request validation
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
        return res.status(400).json({message:`${err}`})
    }
    await connection.destroy()

    res.status(200).json({message:"Successfully deleted data!"})

}


/*

getPostsByUsername - GET REQUEST    

Request type: Params

Arguments:

userID:String

Description:

Fetches posts of a user given a username, excluding anonymous posts

Return value:

returnData - a JSON object containing the requested data
message - The status message of the endpoint

*/

const getPostsByUsername = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {userID} = req.params
    // request validation
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

    if (postArr)
        res.status(200).json({returnData:postArr[0],message:"Successfully fetched posts by user"})
    else
        res.status(200).json({returnData:null,message:"Failed to fetch posts by user"})
}


/*

getAnswersByUsername - GET REQUEST    

Request type: Params

Arguments:

userID:String

Description:

Fetches answers of a user given a username

Return value:

returnData - a JSON object containing the requested data
message - The status message of the endpoint

*/

const getAnswersByUsername = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {userID} = req.params
    // request validation
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


    if (commentArr)
        res.status(200).json({returnData:commentArr[0],message:""})
    else
        res.status(200).json({returnData:null})
}


/*

unassociatePostTag - DELETE REQUEST    

Request type: Params

Arguments:

postID:Int

Description:

Deletes post and tag association in the PostTag database

Return value:

returnData - a JSON object containing the requested data
message - The status message of the endpoint

*/

const unassociatePostTag = async (req,res) => {
    const reqLength = Object.keys(req.params).length
    const {postID} = req.params
    
    // request validation
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