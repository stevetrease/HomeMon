exports.page = function(req, res){
  res.render('genericlist', { title: 'Express', myPath: 'mqtt' });
};