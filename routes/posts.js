const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')

router.get('/', (req, res, next) => {
	// res.send('获取所有用户或者特定用户的文章页面')
	// res.render('posts')

	let author = req.query.author

	PostModel.getPosts(author)
		.then((posts) => {
			// console.log(posts)
			res.render('posts', {
				posts
			})
		})
		.catch(next)
})

router.post('/', checkLogin, (req, res, next) => {
	// res.send('发表文章')
	let author = req.session.user._id
	let title = req.fields.title
	let content = req.fields.content

	try {
		if (!title.length) {
			throw new Error('请填写标题')
		}
		if (!content.length) {
			throw new Error('请填写内容')
		}
	} catch (e) {
		req.flash('error', e.message)
		return res.redirect('back')
	}

	var post = {
		author,
		title,
		content,
		pv: 0
	}

	PostModel.create(post)
		.then((result) => {
			post = result.ops[0]
			req.flash('success', '发表成功')

			res.redirect(`/posts/${post._id}`)
		})
		.catch(next)

})

router.get('/create', checkLogin, (req, res, next) => {
	// res.send('发表文章页面')
	res.render('create')
})

router.get('/:postId', (req, res, next) => {
	// res.send('单独一篇文章的页面')
	const postId = req.params.postId

	Promise.all([PostModel.getPostById(postId), CommentModel.getComments(postId), PostModel.incPv(postId)])
		.then((result) => {
			let post = result[0]
			let comments = result[1]
			if (!post) {
				throw new Error('该文章不存在')
			}

			res.render('post', {
				post,
				comments
			})
		})
		.catch(next)
})

router.get('/:postId/edit', checkLogin, (req, res, next) => {
	// res.send('更新文章的页面')
	const postId = req.params.postId
	const author = req.session.user._id

	PostModel.getRawPostById(postId)
		.then((post) => {
			if (!post) {
				throw new Error('该文章不存在')
			}
			if (author.toString() !== post.author._id.toString()) {
				throw new Error('权限不足')
			}
			res.render('edit', {
				post: post
			})
		})
		.catch(next)
})

router.post('/:postId/edit', checkLogin, (req, res, next) => {
	// res.send('更新文章')
	const postId = req.params.postId
	const author = req.session.user._id
	const title = req.fields.title
	const content = req.fields.content

	PostModel
		.updatePostById(postId, author, {
			title,
			content
		})
		.then(() => {
			req.flash('success', '编辑文章成功')
			res.redirect(`/posts/${postId}`)
		})
		.catch(next)
})

router.get('/:postId/remove', checkLogin, (req, res, next) => {
	// res.send('删除一篇文章')
	const postId = req.params.postId
	const author = req.session.user._id

	PostModel
		.delPostById(postId, author)
		.then(() => {
			req.flash('success', '删除文章成功')
			res.redirect('/posts')
		})
		.catch(next)
})

router.post('/:postId/comment', checkLogin, (req, res, next) => {
	// res.send('创建一条留言')
	let author = req.session.user._id
	let postId = req.params.postId
	let content = req.fields.content

	let comment = {
		author,
		postId,
		content
	}

	CommentModel.create(comment)
		.then(() => {
			req.flash('success', '留言成功')
			res.redirect('back')
		})
		.catch(next)
})

router.get('/:postId/comment/:commentId/remove', checkLogin, (req, res, next) => {
	// res.send('删除一条留言')
	let commentId = req.params.commentId
	let author = req.session.user._id

	CommentModel.delCommentById(commentId, author)
		.then(() => {
			req.flash('success', '删除留言成功')
			res.redirect('back')
		})
		.catch(next)
})

module.exports = router