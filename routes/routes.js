const {createPost,getPostsByPage,getPostOne, getHotPostsByPage, getNewPostsByPage, getTopPostsByPage, associatePostWithTag, getTagsPerPost, getPostsPerTag, getTagCountByTagName, createComment, getCommentsByPost, getAnswersByUsername, unassociatePostTag, getPostsByUsername, deletePostOne, editPostOne, getActivePostsByPage} = require('../controllers/controllers')
const {Authorize} = require('../middlewares')
const express = require('express');

// initialize router
const router = express.Router()


router.post('/createPost',createPost)

router.get('/getPostsByPage/:pageNumber/:limitPerPage/:query',getPostsByPage)
router.get('/getPostsByPage/:pageNumber/:limitPerPage',getPostsByPage)

router.get('/getHotPostsByPage/:pageNumber/:limitPerPage/:query',getHotPostsByPage)
router.get('/getHotPostsByPage/:pageNumber/:limitPerPage',getHotPostsByPage)

router.get('/getNewPostsByPage/:pageNumber/:limitPerPage/:query',getNewPostsByPage)
router.get('/getNewPostsByPage/:pageNumber/:limitPerPage',getNewPostsByPage)

router.get('/getTopPostsByPage/:pageNumber/:limitPerPage/:query',getTopPostsByPage)
router.get('/getTopPostsByPage/:pageNumber/:limitPerPage',getTopPostsByPage)

router.get('/getTopPostsByPage/:pageNumber/:limitPerPage/:query',getActivePostsByPage)
router.get('/getTopPostsByPage/:pageNumber/:limitPerPage',getActivePostsByPage)

router.get('/getPostOne/:postID',getPostOne)

router.patch('/editPostOne',editPostOne)
router.delete('/deletePostOne/:postID',deletePostOne)

router.get('/getPostsByUsername/:userID',getPostsByUsername)

router.post('/associatePostWithTag',associatePostWithTag)
router.get('/getTagsPerPost/:postID',getTagsPerPost)
router.get('/getPostsPerTag/:pageNumber/:limitPerPage/:tagName',getPostsPerTag)
router.get('/getTagCount/:tagName',getTagCountByTagName)
router.delete('/unassociatePostTag/:postID',unassociatePostTag)

router.post('/createComment',createComment)
router.get('/getPostsByPage/:pageNumber/:limitPerPage/:query',getCommentsByPost)
router.get('/getAnswersByUsername/:userID',getAnswersByUsername)

module.exports = router; 