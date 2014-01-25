exports.page = function(req, res){
  res.render('sensors', { title: 'Sensors', user: req.user });
};