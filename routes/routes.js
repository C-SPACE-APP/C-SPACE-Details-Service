const {createPost,getPostsByPage,getPostOne, getHotPostsByPage, getNewPostsByPage, getTopPostsByPage, associatePostWithTag, getTagsPerPost, getPostsPerTag, getTagCountByTagName, createComment, getCommentsByPost} = require('../controllers/controllers')
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

router.get('/getPostOne/:postID',getPostOne)


router.post('/associatePostWithTag',associatePostWithTag)
router.get('/getTagsPerPost/:postID',getTagsPerPost)
router.get('/getPostsPerTag/:tagName',getPostsPerTag)
router.get('/getTagCount/:tagName',getTagCountByTagName)


router.post('/createComment',createComment)
router.get('/getPostsByPage/:pageNumber/:limitPerPage/:query',getCommentsByPost)

module.exports = router; 