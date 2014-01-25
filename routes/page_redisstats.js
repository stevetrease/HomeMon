exports.page = function(req, res){
  res.render('genericlist', { title: 'Redis Stats', myPath: 'redisstats' , user: req.user });
};