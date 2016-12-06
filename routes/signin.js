const express = require('express')
const router = express.Router()

const sha1 = require('sha1')

const checkNotLogin = require('../middlewares/check').checkNotLogin
const UserModel = require('../models/users')

router.get('/', checkNotLogin, (req, res, next) => {
	// res.send('登录页面')
	res.render('signin')
})

router.post('/', checkNotLogin, (req, res, next) => {
	// res.send('用户登录')

	let name = req.fields.name
	let password = req.fields.password

	console.log(name, password)

	UserModel.getUserByName(name)
		.then((user) => {
			console.log(user)
			if (!user) {
				req.flash('error', '用户不存在')
				return res.redirect('back')
			}

			if (sha1(password) !== user.password) {
				req.flash('error', '用户名或者密码错误')
				return res.redirect('back')
			}

			req.flash('success', '登录成功')
			req.session.user = user

			res.redirect('/posts')
		})
		.catch(next)
})

module.exports = router