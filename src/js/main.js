$(document).ready(function() {

    //////////
    // Global variables
    //////////

    var _window = $(window);
    var _document = $(document);

    ////////////
    // READY - triggered when PJAX DONE
    ////////////
    function pageReady() {
        legacySupport();
        updateHeaderActiveClass();
        initHeaderScroll();

        // initPopups();
        initScrollMonitor();
        initLazyLoad();
        initMap();

        // development helper
        _window.on('resize', debounce(setBreakpoint, 200))

        // AVAILABLE in _components folder
        // copy paste in main.js and initialize here
        // initPerfectScrollbar();
        // initTeleport();
        // parseSvg();
        // revealFooter();
        // _window.on('resize', throttle(revealFooter, 100));
    }

    // this is a master function which should have all functionality
    pageReady();


    // some plugins work best with onload triggers
    _window.on('load', function() {
        // your functions
    })


    //////////
    // COMMON
    //////////

    function legacySupport() {
        // svg support for laggy browsers
        svg4everybody();

        // Viewport units buggyfill
        window.viewportUnitsBuggyfill.init({
            force: false,
            refreshDebounceWait: 150,
            appendToBody: true
        });
    }


    //////////
    // WINDW ONLOAD
    //////////

    window.onload = function() {
        setTimeout(function() {
            $('#preloader').fadeOut();
        }, 1000);
    }

    //////////
    // DOORS SCROLL OPEN
    //////////

    // disableScroll();
    var isDoorsOpened = false;
    $('body').css({
        'overflow': 'hidden',
        'height': 'calc(100vh + 1px)'
    });
    _window.on('scroll', throttle(function(e) {
        // wait till the page is ready
        if ($('body.pace-done').length > 0) {
            // if loader is still visible
            if (!isDoorsOpened) {
                $('.doors').addClass('active').delay(1000).fadeOut(200, function() {
                    console.log('seting attr')
                    isDoorsOpened = true
                    $('body').attr('style', '');
                });
                // preventAsScrollTop();
            } else {
                // do nothing
            }
        } else {
            // preventAsScrollTop();
        }
    }, 100));

    var preventAsScrollTop = throttle(function() {
        anime({
            targets: "html, body",
            scrollTop: 0,
            easing: easingSwing, // swing
            duration: 10
        });
    }, 100, { leading: false, trailing: true })


    // Prevent # behavior
    _document
        .on('click', '[href="#"]', function(e) {
            e.preventDefault();
        })
        .on('click', 'a[href^="#section"]', function() { // section scroll
            var el = $(this).attr('href');
            $('body, html').animate({
                scrollTop: $(el).offset().top
            }, 1000);
            return false;
        })


    // HEADER SCROLL
    // add .header-static for .page or body
    // to disable sticky header
    function initHeaderScroll() {
        _window.on('scroll', throttle(function(e) {
            var vScroll = _window.scrollTop();
            var header = $('.header').not('.header--static');
            var headerHeight = header.height();
            var firstSection = _document.find('.page__content div:first-child()').height() - headerHeight;
            var visibleWhen = Math.round(_document.height() / _window.height()) > 2.5

            if (visibleWhen) {
                if (vScroll > headerHeight) {
                    header.addClass('is-fixed');
                } else {
                    header.removeClass('is-fixed');
                }
                if (vScroll > firstSection) {
                    header.addClass('is-fixed-visible');
                } else {
                    header.removeClass('is-fixed-visible');
                }
            }
        }, 10));
    }


    // HAMBURGER TOGGLER
    _document.on('click', '.hamburger', function() {
        $(this).toggleClass('is-active');
        $('.header__wrapper').toggleClass('is-active');
    });

    function closeMobileMenu() {
        $('.hamburger').removeClass('is-active');
        $('.header__wrapper').removeClass('is-active');
    }

    // SET ACTIVE CLASS IN HEADER
    // * could be removed in production and server side rendering when header is inside barba-container
    function updateHeaderActiveClass() {
        $('.header__menu li').each(function(i, val) {
            if ($(val).find('a').attr('href') == window.location.pathname.split('/').pop()) {
                $(val).addClass('is-active');
            } else {
                $(val).removeClass('is-active')
            }
        });
    }


    //////////
    // MODALS
    //////////

    function initPopups() {
        // Magnific Popup
        var startWindowScroll = 0;
        $('[js-popup]').magnificPopup({
            type: 'inline',
            fixedContentPos: true,
            fixedBgPos: true,
            overflowY: 'auto',
            closeBtnInside: true,
            preloader: false,
            midClick: true,
            removalDelay: 300,
            mainClass: 'popup-buble',
            callbacks: {
                beforeOpen: function() {
                    startWindowScroll = _window.scrollTop();
                    // $('html').addClass('mfp-helper');
                },
                close: function() {
                    // $('html').removeClass('mfp-helper');
                    _window.scrollTop(startWindowScroll);
                }
            }
        });

    }

    function closeMfp() {
        $.magnificPopup.close();
    }

    ////////////
    // UI
    ////////////

    ////////////
    // SCROLLMONITOR - WOW LIKE
    ////////////
    function initScrollMonitor() {
        $('.wow').each(function(i, el) {

            var elWatcher = scrollMonitor.create($(el));

            var delay;
            if ($(window).width() < 768) {
                delay = 0
            } else {
                delay = $(el).data('animation-delay');
            }

            var animationClass = $(el).data('animation-class') || "wowFadeUp"

            var animationName = $(el).data('animation-name') || "wowFade"

            elWatcher.enterViewport(throttle(function() {
                $(el).addClass(animationClass);
                $(el).css({
                    'animation-name': animationName,
                    'animation-delay': delay,
                    'visibility': 'visible'
                });
            }, 100, {
                'leading': true
            }));
            // elWatcher.exitViewport(throttle(function() {
            //   $(el).removeClass(animationClass);
            //   $(el).css({
            //     'animation-name': 'none',
            //     'animation-delay': 0,
            //     'visibility': 'hidden'
            //   });
            // }, 100));
        });

    }



    //////////
    // LAZY LOAD
    //////////
    function initLazyLoad() {
        _document.find('[js-lazy]').Lazy({
            threshold: 500,
            enableThrottle: true,
            throttle: 100,
            scrollDirection: 'vertical',
            effect: 'fadeIn',
            effectTime: 350,
            // visibleOnly: true,
            // placeholder: "data:image/gif;base64,R0lGODlhEALAPQAPzl5uLr9Nrl8e7...",
            onError: function(element) {
                console.log('error loading ' + element.data('src'));
            },
            beforeLoad: function(element) {
                // element.attr('style', '')
            }
        });
    }

    //////////
    // BARBA PJAX
    //////////
    var easingSwing = [.02, .01, .47, 1]; // default jQuery easing for anime.js

    Barba.Pjax.Dom.containerClass = "page";

    var FadeTransition = Barba.BaseTransition.extend({
        start: function() {
            Promise
                .all([this.newContainerLoading, this.fadeOut()])
                .then(this.fadeIn.bind(this));
        },

        fadeOut: function() {
            var deferred = Barba.Utils.deferred();

            anime({
                targets: this.oldContainer,
                opacity: .5,
                easing: easingSwing, // swing
                duration: 300,
                complete: function(anim) {
                    deferred.resolve();
                }
            })

            return deferred.promise
        },

        fadeIn: function() {
            var _this = this;
            var $el = $(this.newContainer);

            $(this.oldContainer).hide();

            $el.css({
                visibility: 'visible',
                opacity: 0.5
            });

            anime({
                targets: "html, body",
                scrollTop: 1,
                easing: easingSwing, // swing
                duration: 150
            });

            anime({
                targets: this.newContainer,
                opacity: [0.5, 1],
                delay: 100,
                easing: easingSwing, // swing
                duration: 300,
                complete: function(anim) {
                    triggerBody()
                    _this.done();
                }
            });

        }
    });

    // set barba transition
    Barba.Pjax.getTransition = function() {
        return FadeTransition;
    };

    Barba.Prefetch.init();
    Barba.Pjax.start();

    Barba.Dispatcher.on('newPageReady', function(currentStatus, oldStatus, container, newPageRawHTML) {

        pageReady();
        closeMobileMenu();

    });

    // some plugins get bindings onNewPage only that way
    function triggerBody() {
        _window.scrollTop(0);
        $(window).scroll();
        $(window).resize();
    }


    //////////
    // DEVELOPMENT HELPER
    //////////
    function setBreakpoint() {
        var wHost = window.location.host.toLowerCase()
        var displayCondition = wHost.indexOf("localhost") >= 0 || wHost.indexOf("surge") >= 0
        if (displayCondition) {
            var wWidth = _window.width();

            var content = "<div class='dev-bp-debug'>" + wWidth + "</div>";

            $('.page').append(content);
            setTimeout(function() {
                $('.dev-bp-debug').fadeOut();
            }, 1000);
            setTimeout(function() {
                $('.dev-bp-debug').remove();
            }, 1500)
        }
    }

    //////////
    // YANDEX MAP
    //////////
    function initMap() {
        var myMap,
            myPlacemark;

        if ($('#ya-map').length > 0) {
            ymaps.ready(function() {
                myMap = new ymaps.Map("ya-map", {
                    // нужно получить контакты с яндекс карты нужного адресса
                    center: [55.743857, 37.601960],
                    zoom: 14
                });

                // myMap.controls.remove('zoomControl');
                myMap.controls.remove('trafficControl');
                myMap.controls.remove('searchControl');
                myMap.controls.remove('fullscreenControl');
                myMap.controls.remove('rulerControl');
                myMap.controls.remove('geolocationControl');
                myMap.controls.remove('routeEditor');

                myMap.behaviors.disable('scrollZoom');

                myPlacemark = new ymaps.Placemark([55.743857, 37.601960], {
                    hintContent: 'Наш офис'
                }, {
                    // стилизация маркера
                    iconLayout: 'default#image',
                    iconImageHref: 'img/placeholder.svg',
                    iconImageSize: [38, 55],
                    iconImageOffset: [-5, -35]
                });

                myMap.geoObjects.add(myPlacemark);
            });
        }
    }

});