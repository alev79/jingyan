const express = require('express')
const router = express.Router()

const frameworks = ['Vue', 'React', 'Angular']

router.get('/:name', (req, res) => {
	// res.send(`hello, ${req.params.name}`)
	res.render('users', {
		name: req.params.name,
		frameworks
	})
})

module.exports = router