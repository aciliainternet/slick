var GallerySlick = function(element) {

    var self = this;
    var isInited = false;
    var galleryElement = (typeof element !== 'undefined') ? element : '.gallery-slick';
    var galleryThumbnailsElement = '.gallery-thumbnails';
    var galleryCaptionsElement = '.gallery-captions';
    var gallerySlickOptions = {
        infinite: true,
        speed: 0,
        fade: true,
        adaptiveHeight: true,
        arrows: true,
        prevArrow: $('.gallery-slick-prev'),
        nextArrow: $('.gallery-slick-next'),
        cssEase: 'linear',
        touchMove: true,
        swipe: false,
        draggable: true,
        centerMode: true,
        lazyLoad: 'ondemand',
        slugsElement: '.gallery-slick-main-image'
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
    var afterLoad = false;
    var interstitialOptions = false;
    var optionsToUpdate = {};
    var slicksToLink = '';
    var checkSlugActive = true;
    var DEBUG = false;

    var updateOption = function(property, value) {
        gallerySlickOptions[property] = value;
    };

    var updateOptions = function(propertiesJson) {
        for (var i in propertiesJson) {
            gallerySlickOptions[i] = propertiesJson[i];
            delete propertiesJson[i];
        }
    };

    var setGalleryThumbnails = function() {
        if ($(galleryThumbnailsElement).size() > 0) {
            updateOptions(galleryThumbnailsOptions);
        }
    };

    var setGalleryCaptions = function() {
        if ($(galleryCaptionsElement).size() > 0) {
            var valueForSync = galleryElement + ', ' + galleryCaptionsElement;

            updateOption('asNavFor', valueForSync);
            galleryCaptionsSlickOptions['asNavFor'] = valueForSync;

            $(galleryCaptionsElement).slick(galleryCaptionsSlickOptions);
        }
    };

    var initMainSlick = function() {
        updateOption('mainSlick', galleryElement);

        runWork('beforeLoad');

        syncSlicks();

        updateOptions(optionsToUpdate);

        if (DEBUG) {
            console.info('[GallerySlick] Slick options:', gallerySlickOptions);
        }

        $(galleryElement).slick(gallerySlickOptions);

        setMainSlickOnChange();

        setClickInImageAsNextSlider();

        runWork('afterLoad');

        checkSlug();

        initInterstitial();
    };

    var setMainSlickOnChange = function() {
        self.getSlick().on('afterChange', function() {
            if (self.isInited) {
                APP.EventDispatcher.notify(DomainEvents.GALLERY_SLIDECHANGED, {target: self});
            } else {
                self.isInited = true;
            }
        });
    };

    var checkSlug = function() {
        if (!checkSlugActive) return false;

        if ($(gallerySlickOptions['slugsElement']).size() === 0) {
            console.error('[GallerySlick] GallerySlick instance is not able to find the slugsElement property');
            return false;
        }

        if (DEBUG) console.info('[GallerySlick] Checking slug');

        if (window.location && window.location.hash && window.location.hash !== '') {
            var slug = window.location.hash.substr(1);
            $(galleryElement).slick('getSlick').goToFromSlug(slug);
        } else {
            $(galleryElement).slick('getSlick').goToFromSlug('1');
        }
    };

    var setClickInImageAsNextSlider = function() {
        if ($(galleryElement + ' ' + gallerySlickOptions.slugsElement).size() === 0) return false;

        $(galleryElement + ' ' + gallerySlickOptions.slugsElement).click(function(e) {
            e.preventDefault();
            $(galleryElement).slick('getSlick').slickNext();
        });
    };

    var pushWork = function(property, toDo) {
        if (gallerySlickOptions[property] === null) {
            if (DEBUG) {
                console.error('[GallerySlick] ' + property + ' does not exist!');
            }
            return false;
        }

        if (!gallerySlickOptions[property]) {
            gallerySlickOptions[property] = [];
        }

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

        if (DEBUG) console.info('[GallerySlick] GallerySlick object set interstitial');

        var interstitial = new Interstitial(interstitialOptions);

        $(galleryElement).on('beforeChange', function(event, slick, currentSlide, nextSlide) {
            if (currentSlide !== nextSlide) interstitial.notifySlideEnded(nextSlide + 1);
        });
    };

    var syncSlicks = function() {
        if (slicksToLink === '') return false;

        if (typeof gallerySlickOptions['asNavFor'] !== 'undefined') {
            gallerySlickOptions['asNavFor'] += slicksToLink;
        } else {
            gallerySlickOptions['asNavFor'] = galleryElement + slicksToLink;
        }

        if (DEBUG) {
            console.info('[GallerySlick] Slicks synced: ' + gallerySlickOptions['asNavFor']);
        }

        return true;
    };

    this.init = function() {
        if ($(galleryElement).size() === 0) return false;

        if ($(galleryElement + ' .slick-slide').size() > 0) {
            if (DEBUG) console.info('[GallerySlick] GallerySlick was instanced previously!');
            return false;
        }

        if (DEBUG) {
            console.info('[GallerySlick] ' + galleryElement + ' element set like a gallery slick');
        }

        setGalleryThumbnails();

        setGalleryCaptions();

        initMainSlick();
    };

    this.getSlick = function() {
        return $(galleryElement);
    };

    this.getMainSlick = function() {
        return galleryElement;
    };

    this.beforeLoad = function(toDo) {
        pushWork('beforeLoad', toDo);
    };

    this.afterLoad = function(toDo) {
        pushWork('afterLoad', toDo);
    };

    this.setInterstitial = function(options) {
        interstitialOptions = options;
    };

    this.setOption = function(property, value) {
        optionsToUpdate[property] = value;
    };

    this.linkNewSlick = function(newSlick) {
        slicksToLink += ', ' + newSlick;
    };

    this.setCheckSlug = function(mode) {
        checkSlugActive = mode;

        if (!mode && DEBUG) {
            console.info('[GallerySlick] Checking slug deactivated');
        }
    };

    this.setDebug = function(mode) {
        DEBUG = mode;

        if (DEBUG) {
            console.info('[GallerySlick] GallerySlick in DEBUG mode!');
        }
    };

    this.getSlideElementActive = function() {
        var currentIndex = $(galleryElement).slick('getSlick').currentSlide;
        var stringCurrentSlide = '.slick-slide[data-slick-index=' + currentIndex + ']';
        var currentElement = $(galleryElement).find(stringCurrentSlide);

        return currentElement;
    };

    this.getActiveIndex = function() {
        return $(galleryElement).slick('getSlick').currentSlide;
    };

    this.getNumberOfSlides = function() {

        var numberOfSlides = $(galleryElement).find('.slides.slick-slide:not(.slick-cloned)').size();

        if (numberOfSlides === 0 && $(galleryElement).find(gallerySlickOptions.slugsElement).size() > 0)
            numberOfSlides = $(galleryElement).find(gallerySlickOptions.slugsElement).size();

        return numberOfSlides;
    };

    this.getGalleryThumbnailsContainer = function() {
        return $(galleryThumbnailsElement);
    };
};
