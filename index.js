const express = require('express')
const path = require('path')

const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')

const config = require('config-lite')

const routes = require('./routes')
const pkg = require('./package')

// const winston = require('winston')
// const expressWinston = require('express-winston')

const app = express()

app.set('port', (process.env.PORT || config.port));

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.locals.blog = {
	title: pkg.name,
	description: pkg.description
}

app.use(session({
	resave: false,
	saveUninitialized: false,
	name: config.session.key,
	secret: config.session.secret,
	cookie: {
		maxAge: config.session.maxAge
	},
	store: new MongoStore({
		url: config.mongodb
	})
}))

app.use(flash())

app.use(require('express-formidable')({
	uploadDir: path.join(__dirname, 'public/img'),
	keepExtensions: true
}))

app.use((req, res, next) => {
	res.locals.user = req.session.user
	res.locals.success = req.flash('success').toString()
	res.locals.error = req.flash('error').toString()
	next()
})

// app.use(expressWinston.logger({
// 	transports: [
// 		new(winston.transports.Console)({
// 			json: true,
// 			colorize: true
// 		}),
// 		new(winston.transports.File)({
// 			filename: 'logs/success.log'
// 		})
// 	]
// }))

routes(app)

// app.use(expressWinston.errorLogger({
// 	transports: [
// 		new(winston.transports.Console)({
// 			json: true,
// 			colorize: true
// 		}),
// 		new(winston.transports.File)({
// 			filename: 'logs/error.log'
// 		})
// 	]
// }))
app.use((err, req, res, next) => {
	res.render('error', {
		error: err
	})
})

app.listen(app.get('port'), function() {
	console.log(`${pkg.name} is running on port ${app.get('port')}`)
})