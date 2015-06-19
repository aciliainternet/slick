var GallerySlick = function(element) {

	var self = this;
	var galleryElement = (typeof element !== "undefined") ? element : ".gallery-slick";
	var galleryThumbnailsElement = ".gallery-thumbnails";
	var galleryCaptionsElement = ".gallery-captions";
    var gallerySlickOptions = {
        infinite: true,
        speed: 0,
        fade: true,
        adaptiveHeight: true,
        arrows: true,
        prevArrow: $(".gallery-slick-prev"),
        nextArrow: $(".gallery-slick-next"),
        cssEase: "linear",
        touchMove: true,
        draggable: true,
        centerMode: true,
        lazyLoad: "ondemand",
        slugsElement: ".gallery-slick-main-image"
    };
    var galleryThumbnailsOptions = {
    	appendDots: galleryThumbnailsElement,
    	dotsAsThumbs: true,
    	dots: true
    };
    var galleryCaptionsSlickOptions = {
        infinite: true,
        speed: 0,
        fade: true
    };
    var beforeLoad = false;
    var loaded = false;
    var interstitialOptions = false;
    var optionsToUpdate = { };
    var slicksToLink = "";

    var updateOption = function(property, value) {

    	gallerySlickOptions[property] = value;
    };

    var updateOptions = function(propertiesJson) {

    	for (var i in propertiesJson) {

    		gallerySlickOptions[i] = propertiesJson[i];
    	}
    };

    var setGalleryThumbnails = function() {    	

    	if ($(galleryThumbnailsElement).size() > 0) updateOptions(galleryThumbnailsOptions);
    };

    var setGalleryCaptions = function() {

    	if ($(galleryCaptionsElement).size() > 0) {
	        
	        var valueForSync = galleryElement + ", " + galleryCaptionsElement;
	        
	        updateOption("asNavFor", valueForSync);
	        galleryCaptionsSlickOptions["asNavFor"] = valueForSync;

	        $(galleryCaptionsElement).slick(galleryCaptionsSlickOptions);
    	}
    };

    var initMainSlick = function() {

    	updateOption("mainSlick", galleryElement);

		runWork("beforeLoad");

    	$(galleryElement).slick(gallerySlickOptions);

    	setClickInImageAsNextSlider();

    	runWork("loaded", true);

    	checkSlug();

    	initInterstitial();
    };

    var checkSlug = function() {

        if (window.history && window.location && window.location.href.indexOf('#') > -1) {
            var slug = window.location.href.split('#')[1];
            $(galleryElement).slick("getSlick").goToFromSlug(slug);
        } else {
            $(galleryElement).slick("getSlick").goToFromSlug("1");
        }
    };

    var setClickInImageAsNextSlider = function() {

    	if ($(galleryElement + " " + gallerySlickOptions.slugsElement).size() === 0) return false;

	    $(galleryElement + " " + gallerySlickOptions.slugsElement).click(function (e) {
	        e.preventDefault();
	        $(galleryElement).slick("getSlick").slickNext();
	    });
    };

    var pushWork = function(property, toDo) {

    	if (gallerySlickOptions[property] === null) {
    		console.error(property + " is not exist!");
    		return false;
    	}

    	if (!gallerySlickOptions[property]) gallerySlickOptions[property] = [];

    	gallerySlickOptions[property].push(toDo);
    };

    var runWork = function(property) {

    	var toDo = gallerySlickOptions[property];

    	for (var i in toDo) {
    		toDo[i](self);
    	}
    };

    var initInterstitial = function() {

    	if (!interstitialOptions) return false;

	    var interstitial = new Interstitial(interstitialOptions);

	    $(galleryElement).on("afterChange", function(event, slick, currentSlide) {

	    	interstitial.notifySlideEnded(currentSlide + 1);
	    });
    };

    var syncSlicks = function() {

    	if (slicksToLink === "") return false;

    	if (typeof gallerySlickOptions["asNavFor"] !== "") gallerySlickOptions["asNavFor"] += slicksToLink;
    	else
    		gallerySlickOptions["asNavFor"] = galleryElement + slicksToLink;

    	console.info("Slicks synced: " + gallerySlickOptions["asNavFor"]);

    	return true;
    };

    this.init = function() {

    	if ($(galleryElement).size() === 0) return false;

    	console.info(galleryElement + " element set like a gallery slick");

    	setGalleryThumbnails();

    	setGalleryCaptions();

    	updateOptions(optionsToUpdate);

    	syncSlicks();

    	initMainSlick();
    };

    this.getSlick = function() { return $(galleryElement) };

    this.getMainSlick = function() { return galleryElement; };

    this.beforeLoad = function(toDo) { pushWork("beforeLoad", toDo); };

    this.loaded = function(toDo) { pushWork("loaded", toDo); };

    this.setInterstitial = function(options) {

    	interstitialOptions = options;
    };

    this.setOption = function(property, value) {

    	optionsToUpdate[property] = value;
    };

    this.linkNewSlick = function(newSlick) {

    	slicksToLink += ", " + newSlick;
    };
};
