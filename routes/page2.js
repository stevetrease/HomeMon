exports.page = function(req, res){
	var items = {
     	SKN:{name:'Shuriken', price:100},
	 	ASK:{name:'Ashiko', price:690},
	 	CGI:{name:'Chigiriki', price:250},
	 	NGT:{name:'Naginata', price:900},
	 	KTN:{name:'Katana', price:1000}
	};
	res.render('page2', { title: 'Page 2', items:items });
};