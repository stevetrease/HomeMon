exports.page = function(req, res){
  res.render('snmp', { title: 'SNMP', user: req.user });
};