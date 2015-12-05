exports.page = function(req, res){
  res.render('temphumichart', { title: 'Temperature Humidity Chart', user: req.user });
};