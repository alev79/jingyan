const express = require('express')
const router = express.Router()
const path = require('path')
const sha1 = require('sha1')

const checkNotLogin = require('../middlewares/check').checkNotLogin
const UserModel = require('../models/users')


router.get('/', checkNotLogin, (req, res, next) => {
	// res.send('注册页面')
	res.render('signup')
})

router.post('/', checkNotLogin, (req, res, next) => {
	// res.send('注册')

	let fields = req.fields

	let {
		name,
		gender,
		bio,
		password,
		repassword
	} = fields

	console.log(req.files)

	let avatar = req.files.avatar.path.split(path.sep).pop()

	// 应该前端来处理
	try {
		if (!(name.length >= 1 && name.length <= 10)) {
			throw new Error('名字限制在1-10个字符')
		}
		if (password.length < 6) {
			throw new Error('密码至少6个字符')
		}
		if (password !== repassword) {
			throw new Error('两次输入密码不一致')
		}
		if (['m', 'f', 'x'].indexOf(gender) === -1) {
			throw new Error('性别只能是m,f或者x')
		}
		if (!req.files.avatar.name) {
			throw new Error('缺少头像')
		}
		if (!(bio.length >= 0 && bio.length <= 30)) {
			throw new Error('个人简介限制在0-30个字符')
		}

	} catch (e) {
		req.flash('error', e.message)
		return res.redirect('/signup')
	}

	password = sha1(password)

	let user = {
		name: name,
		password: password,
		gender: gender,
		bio: bio,
		avatar: avatar
	}

	UserModel.create(user)
		.then((result) => {
			console.log(result)
			user = result.ops[0]

			delete user.password

			req.session.user = user

			req.flash('success', '注册成功')

			res.redirect('/posts')
		})
		.catch((e) => {
			if (e.message.match('E11000 duplicate key')) {
				req.flash('error', '用户名已被占用')
				return res.redirect('/signup')
			}
			next(e)
		})
})

module.exports = router