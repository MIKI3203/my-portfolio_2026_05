

(function () {
  'use strict';

  
  
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var SPAWN_INTERVAL = 130;  
  var MAX_BUBBLES    = 14;   

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  
  function popBubble(el) {
    if (reduce.matches) return;
    if (el.querySelectorAll('.bubble').length >= MAX_BUBBLES) return;

    var bubble = document.createElement('span');
    bubble.className = 'bubble';
    bubble.setAttribute('aria-hidden', 'true'); 

    var size = random(4, 13);                 
    var rise = random(55, 105);               
    var dur  = random(1.2, 2.2);              
    var dx   = random(3, 9);                  
    var left = random(6, el.offsetWidth - 6); 

    
    var big = (size - 4) / 9;                 
    dur  = dur * (1 - big * 0.25);
    var peak = 0.55 + big * 0.4;

    bubble.style.width  = size + 'px';
    bubble.style.height = size + 'px';
    bubble.style.left   = (left - size / 2) + 'px';
    bubble.style.setProperty('--rise', rise + 'px');
    bubble.style.setProperty('--dur',  dur + 's');
    bubble.style.setProperty('--peak', peak.toFixed(2));
    bubble.style.setProperty('--dx',   (Math.random() < 0.5 ? -dx : dx) + 'px');

    
    bubble.addEventListener('animationend', function () {
      bubble.remove();
    });

    el.appendChild(bubble);
  }

  function startBubbling(el) {
    if (el._bubbleTimer) return;
    popBubble(el); 
    el._bubbleTimer = setInterval(function () {
      popBubble(el);
    }, SPAWN_INTERVAL);
  }

  function stopBubbling(el) {
    clearInterval(el._bubbleTimer);
    el._bubbleTimer = null;
    
  }

  
  function burst(el) {
    var count = 0;
    var timer = setInterval(function () {
      popBubble(el);
      if (++count >= 6) clearInterval(timer);
    }, 90);
  }

  var targets = document.querySelectorAll('.bubbly');

  Array.prototype.forEach.call(targets, function (el) {
    el.addEventListener('mouseenter', function () { startBubbling(el); });
    el.addEventListener('mouseleave', function () { stopBubbling(el); });

    
    el.addEventListener('focus', function () { startBubbling(el); });
    el.addEventListener('blur',  function () { stopBubbling(el); });

    
    el.addEventListener('touchstart', function () { burst(el); }, { passive: true });
  });
})();
