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

        triggerBody();
    }

    // this is a master function which should have all functionality
    pageReady();

    // PRELOADER
    var interval = setInterval(function(){
      if ($('body.pace-done').length > 0) {
        if (typeof(Storage) !== "undefined") {
          if(localStorage.isFirstLoadComplete==="false"){
            localStorage.setItem("isFirstLoadComplete", "true");
            removePreloder(700)
          } else {
            removePreloder()
          }
        } else {
          removePreloder(700)
        }
      }
    }, 100);

    function removePreloder(timeout){
      var sTimeout = timeout || 10
      setTimeout(function(){
        $('#preloader').fadeOut();
        clearInterval(interval)
      }, sTimeout)
    }

    //////////
    // COMMON
    //////////

    function legacySupport() {
        // svg support for laggy browsers
        svg4everybody();

        // Viewport units buggyfill
        window.viewportUnitsBuggyfill.init({
            force: true,
            refreshDebounceWait: 5,
            appendToBody: true
        });
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
                openDoors();
                // preventAsScrollTop();
            } else {
                // do nothing
            }
        } else {
            // preventAsScrollTop();
        }
    }, 100));

    function openDoors(){
      $('.doors').addClass('active').delay(2500).fadeOut(200, function() {
          isDoorsOpened = true
          $('body').attr('style', '');
      });
    }

    $('.doors').on('click', function(){
      if ($('body.pace-done').length > 0) {
        openDoors();
      }
    })

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

    // BLOCK SCROLL
    var isMenuOpened = false
    function blockScroll() {
      if ( !isMenuOpened ) {
        disableScroll();
        isMenuOpened = true
      } else {
        enableScroll();
        isMenuOpened = false;
      }
    }

    var lastScroll = 0;
    function disableScroll() {
      lastScroll = _window.scrollTop();
      $('.page__content').css({
        'margin-top': '-' + lastScroll + 'px'
      });
      $('body').addClass('body-lock');
    }

    function enableScroll() {
      $('.page__content').attr('style', '');
      $('body').removeClass('body-lock');
      _window.scrollTop(lastScroll)
      lastScroll = 0;
    }

    // HAMBURGER TOGGLER
    _document.on('click', '.hamburger', function() {
        $(this).toggleClass('is-active');
        $('.header__wrapper').toggleClass('is-active');

        blockScroll();
    });

    function closeMobileMenu() {
        $('.hamburger').removeClass('is-active');
        $('.header__wrapper').removeClass('is-active');

        blockScroll();
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
    // Specialists hover
    /////////
    _document
      .on('mouseenter', '.specialists__item', function(){
        $(this).siblings().addClass('is-muted');
        $(this).removeClass('is-muted');
      })
      .on('mouseleave', '.specialists__item', function(){
        $(this).siblings().removeClass('is-muted');
        $(this).removeClass('is-muted');
      });

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
        // add classes first
        $('.info__paragraphs p, .left p, .right h1').each(function(i, el){
          $(el).addClass('wow');
        });
        $('.right .article').each(function(i, el){
          $(el).addClass('wow');
          $(el).attr('data-animation-delay', '0.'+i+'s');
        });
        $('.one-item__info p, one-item__info ul li').each(function(i, el){
          var i = i + 1;
          $(el).addClass('wow');
          $(el).attr('data-animation-delay', '0.'+i+'s');
        });


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
        _window.scroll();
        _window.resize();

        initScrollMonitor();
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
                    center: [55.743949, 37.601737],
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

                myPlacemark = new ymaps.Placemark([55.743949, 37.601737], {
                    hintContent: 'Наш офис'
                }, {
                    // стилизация маркера
                    iconLayout: 'default#image',
                    iconImageHref: 'img/placeholder.svg',
                    iconImageSize: [38, 55],
                    // iconImageOffset: [-5, -35]
                });

                myMap.geoObjects.add(myPlacemark);
            });
        }
    }

});
