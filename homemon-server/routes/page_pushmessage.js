exports.page = function(req, res){
  res.render('pushmessage', { title: 'Push message', myPath: 'pushmessage' });
};