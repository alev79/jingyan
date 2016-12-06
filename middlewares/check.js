module.exports = {
	checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '未登录')
				// 重定向到登录页面
			return res.redirect('/signin')
		}
		next()
	},

	checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登陆')
				// 重定向到上一个页面
			return res.redirect('back')
		}
		next()
	}
}