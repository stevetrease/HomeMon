exports.page = function(req, res){
  res.render('power', { title: 'Power', user: req.user });
};