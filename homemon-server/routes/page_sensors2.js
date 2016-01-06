exports.page = function(req, res){
  res.render('sensors2', { title: 'Sensors 2', user: req.user });
};