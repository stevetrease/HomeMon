exports.page = function(req, res){
  res.render('powerbar', { title: 'Power Bar', user: req.user });
};