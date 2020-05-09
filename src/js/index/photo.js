var Page = (function () {
  var count = 0
  var config = {
      $bookBlock: $('#bb-bookblock'),
      $navNext: $('#bb-nav-next'),
      $navPrev: $('#bb-nav-prev'),
      $navFirst: $('#bb-nav-first'),
      $navLast: $('#bb-nav-last')
    },
    init = function () {
      config.$bookBlock.bookblock({
        speed: 800,
        shadowSides: 0.8,
        shadowFlip: 0.7
      });
      initEvents();
    },
    initEvents = function () {

      var $slides = config.$bookBlock.children();

      // add navigation events
      config.$navNext.on('click touchstart', function () {
        config.$bookBlock.bookblock('next');
        return false;
      });

      config.$navPrev.on('click touchstart', function () {
        config.$bookBlock.bookblock('prev');
        return false;
      });

      config.$navFirst.on('click touchstart', function () {
        config.$bookBlock.bookblock('first');
        return false;
      });

      config.$navLast.on('click touchstart', function () {
        config.$bookBlock.bookblock('last');
        return false;
      });
      let initWidth = config.$bookBlock.innerWidth()
      let initHeight = 300 * initWidth / 400
      config.$bookBlock.height(initHeight)

      // add swipe events
      $slides.on({
        'swipeleft': function (event) {
          config.$bookBlock.bookblock('next');
          return false;
        },
        'swiperight': function (event) {
          config.$bookBlock.bookblock('prev');
          return false;
        }
      });

      // add keyboard events
      $(document).keydown(function (e) {
        var keyCode = e.keyCode || e.which,
          arrow = {
            left: 37,
            up: 38,
            right: 39,
            down: 40
          };

        switch (keyCode) {
          case arrow.left:
            config.$bookBlock.bookblock('prev');
            break;
          case arrow.right:
            config.$bookBlock.bookblock('next');
            break;
        }
      });
    };
  var timerId = setInterval(() => {
    count++
    config.$navNext.click()
    if (count === 17) {
      window.clearInterval(timerId)
      $('.bg-opacity').animate({opacity: 0, height: 0, width: 0}, 1500, 'linear')
      $('.main').animate({width: 0, height: 0, opacity: 0}, 1500, 'linear')
      var myAuto = document.getElementById('myaudio1')
      myAuto.pause()
    }
  }, 4500)

  return {init: init};

})();
function  audioAutoPlay(id){
  var audio = document.getElementById(id);

  if (window.WeixinJSBridge) {
    WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
      audio.play();
    }, false);
  } else {
    document.addEventListener("WeixinJSBridgeReady", function () {
      WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
        audio.play();
      });
    }, false);
  }
  audio.play();

  return false;
}
let isInit = sessionStorage.getItem('initDo')
if (!isInit) {
  sessionStorage.setItem('initDo', 1)
  Page.init();
  $(document).ready(function () {
    $('.bg-opacity').animate({opacity: '1'}, 1500, 'linear')
    $('.main').animate({top: '50%'}, 1500, 'linear')
   audioAutoPlay('myaudio1')
  })

} else {
  $('.bg-opacity').height(0).width(0)
}
