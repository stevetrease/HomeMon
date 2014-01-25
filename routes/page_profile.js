exports.page = function(req, res){
	res.render('profile', { title: 'Profile',
							user: req.user
	});
};