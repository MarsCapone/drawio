
Interception = {
  popup: function(args) {
    var url = args.join(" ");
    $('#popup').load(url);
    $('#popup').modal();
  },

  onpage: function(args) {
    $('#' + args[0]).modal();
  }
}

(function() {

  /* IMAGE LOADING */
	var START_TIME = 3000; // time to wait for page to initialise
	var CHECK_TIME = 2000; // time to check if the image-refresh text is visible
	var LOAD_TIME = 10000; // time to refresh existing images
	var LOGGING = false; // enable logging

	function setImage(o, u) {
		// o => the div containing the image-refresh string
		// u => the url to link to

		// only continue if there is something to do.
		if (o == null || o == undefined) return;


		// get required svg objects and attributes to make modifications
		var oTransformParent = $(o).parents('g')[0];
		var oGParent = $(o).parents('g')[1];
		var rectParent = $(oGParent).prev()[0];
		var oForeignObject = $(o).parents('foreignObject')[0]

		var rectParentAttr = rectParent.attributes;
		var rectAttr = $(rectParent).children()[0].attributes;

		// make modifications to get image into DOM
		oTransformParent.setAttribute('transform', rectParentAttr.transform.value);
		oForeignObject.setAttribute('width', rectAttr.width.value);
		oForeignObject.setAttribute('height', rectAttr.height.value);
		oForeignObject.setAttribute('x', rectAttr.x.value);
		oForeignObject.setAttribute('y', rectAttr.y.value);

		// change the div into a img
		$(o).html(`<img class="image-refresh" src="${u}" />`);
		$(o).children().width(rectAttr.width.value);
		$(o).children().height(rectAttr.height.value);
	}

	function getImages(cb) {
		if (cb == undefined) cb = function(i) { console.log(i) };
		var xpath = "//div[contains(text(), 'image-refresh')]";
		var results = document.evaluate(xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		if (LOGGING) console.log('Found %d images', results.snapshotLength);
		for (var i = 0; i < results.snapshotLength; i++) {
			var image = results.snapshotItem(i);
			cb(image);
		}
	}

	function getImageData(imageDiv) {
		// time since epoch in ms. used to stop image caching
		var epoch = (new Date).getTime(); 
		var split = $(imageDiv).text().split('::');
		return { url: `${split[1]}?${epoch}` }
	}

	function imageCallback(image) {
		var data = getImageData(image);
		if (LOGGING) console.log('Setting image for %s to %s', image, data.url);
		setImage(image, data.url);
	}

	function updateExistingImages(images) {
		var epoch = (new Date).getTime(); 
		for (var i = 0; i < images.length; i++) {
			var image = $(images[i]);
			var src = image.attr('src');
			var url = src.split('?', 1)[0];
			if (LOGGING) console.log(`Updating ${src} => ${epoch}.`);
			image.attr('src', `${url}?${epoch}`);
		}
	}

	var updateLoop;
	var imageRefreshLoop;

	setTimeout(function() {

		// loops to check if any images are visible, if they are, update them.
		updateLoop = setInterval(function() {
			getImages(imageCallback);
		}, CHECK_TIME);

		imageRefreshLoop = setInterval(function() {
			if (LOGGING) console.log('Updating all images.');
			updateExistingImages($('.image-refresh'));   
		}, LOAD_TIME);

    /* INJECT MODALS */
    Modals.forEach(function(m) {
      $('#modals').append(m);
    });
	}, 1000) // load this a bit later so that drawio has done it's stuff
})()
