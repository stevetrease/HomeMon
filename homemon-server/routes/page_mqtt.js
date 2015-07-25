exports.page = function(req, res){
  res.render('genericlist', { title: 'MQTT', myPath: 'mqtt' });
};