exports.page = function(req, res){
  res.render('genericlist', { title: 'MQTT Stats', myPath: 'mqttstats' });
};