/**
 * Slide controls
 *
 * SlideContentSwitcher switches between content
 * SlideContentAdder adds more content
 *
 * TODO
 * Needs refactoring - now that I have started mixing the switcher and adder on one slide, 
 * it has gotten complicated. I should share more of the logic between them, for a start.
 *
 * Peter O'Shaughnessy
 */
var SlideContentSwitcher = function() {
      
    this.prev = function() {

        var current = $('.slide.current .contentSwitcher .current');
        var index = $(current).index();
        var prev = $('.slide.current .contentSwitcher .switchable:eq('+(index-1)+')');

        if( $(prev).length > 0 ) {
            $(current).fadeOut('fast',function() {
                $(prev).fadeIn('fast',function() {
                    $(current).removeClass('current');
                    $(prev).addClass('current');
                    updateSlideStepCount();
                });
            });
        } else if( index == 0 ) {

            // Ignore if it is inside an adder and we should simply hide that instead
            if( $('.slide.current .contentAdder .addable.current .contentSwitcher').index() < 0 ) {

                var contentSwitcher = $('.slide.current .contentSwitcher');

                $(contentSwitcher).fadeOut('fast',function() {
                    $(contentSwitcher).addClass('hidden');
                    updateSlideStepCount();
                });
            }

        }

    };

    this.next = function() {

        var contentSwitcher = $('.slide.current .contentSwitcher');

        // Only enable if parent element is visible
        if( $(contentSwitcher).parent().is(':visible') ) {

            // If it's hidden initially then just show it for the first time
            if( $(contentSwitcher).hasClass('hidden') ) {
                
                $(contentSwitcher).fadeIn(function() {
                    $(contentSwitcher).removeClass('hidden');
                    updateSlideStepCount();
                });
                
            } else {
                
                var current = $('.slide.current .contentSwitcher .switchable.current');
                var index = $(current).index();
                var next = $('.slide.current .contentSwitcher .switchable:eq('+(index+1)+')');
                
                if( $(next).length > 0 ) {
                    $(current).fadeOut('fast',function() {
                        $(next).fadeIn('fast',function() {
                            $(current).removeClass('current');
                            $(next).fadeIn().addClass('current');
                            updateSlideStepCount();
                        });
                    });
                   
                }

            }

        }

    };
      
    this.handleKeys = function(e) {

        if (/^(input|textarea)$/i.test(e.target.nodeName)) return;

        switch (e.keyCode) {
            case 38: // up arrow
                this.prev(); 
                e.preventDefault(); 
                break;
            case 40: // down arrow
                this.next();
                e.preventDefault(); 
                break;
        }

    };

    var _this = this;
    document.addEventListener('keydown', function(e) { _this.handleKeys(e); }, false);

}

var SlideContentAdder = function() {
      
    this.prev = function() {

        console.log('adder prev');

        console.log('x current switchable index: ' + $('.slide.current .contentAdder .addable.current .contentSwitcher .switchable.current').index());

        // Ignore if there is also a switcher on the same slide and we should be switching that back instead
        if( $('.slide.current .contentAdder .addable.current .contentSwitcher .switchable.current').index() > 0 ) {
            console.log('giving up - allow switcher prev');
            return;
        }

        var current = $('.slide.current .contentAdder .addable.current');
        var index = $(current).index();
        var prev = $('.slide.current .contentAdder .addable:eq('+(index-1)+')');
        
        console.log('x current:');
        console.log(current);
        console.log('x index: ' + index);

        console.log('prev length = ' + $(prev).length);

        if( $(prev).length > 0 ) {
            $(current).fadeOut('fast', function() {
                $(current).removeClass('current').removeClass('shown');
                $(prev).addClass('current');
                updateSlideStepCount();
            });

        } else if( index == 0 ) {

            console.log('index == 0');

            var contentAdder = $('.slide.current .contentAdder');

            $(contentAdder).fadeOut('fast', function() {
                $(contentAdder).addClass('hidden');
                updateSlideStepCount();
            });
            
        }

    };

    this.next = function() {

        var contentAdder = $('.slide.current .contentAdder');

        // If it's hidden initially then show the first one
        if( $(contentAdder).hasClass('hidden') ) {

            $(contentAdder).fadeIn(function() {
                $(contentAdder).removeClass('hidden');
                updateSlideStepCount();
            });

        } else {

          var current = $('.slide.current .contentAdder .addable.current');
          var index = $(current).index();
          var next = $('.slide.current .contentAdder .addable:eq('+(index+1)+')');
            
          if( $(next).length > 0 ) {
              $(next).fadeIn(function() {
                  $(current).removeClass('current');
                  $(next).fadeIn().addClass('current').addClass('shown');
                  updateSlideStepCount();
              });
          }

        }

    };
      
    this.handleKeys = function(e) {

        if (/^(input|textarea)$/i.test(e.target.nodeName)) return;

        switch (e.keyCode) {
            case 38: // up arrow
                this.prev(); break;
            case 40: // down arrow
                this.next(); break;
        }

    };

    var _this = this;
    document.addEventListener('keydown', function(e) { _this.handleKeys(e); }, false);

}

function updateSlideStepCount(number) {

    var current = $('.slide.current .contentSwitcher .switchable.current');
    var index = $(current).index();

    console.log('index: ' + index);

    var switchableIndex = $('.slide.current .contentSwitcher:visible .switchable.current').index() + 1;
    var addableIndex = $('.slide.current .contentAdder:visible .shown').length
        - $('.slide.current .contentAdder.hidden').length // Remove one to compensate for simply showing hidden one first time
        - $('.slide.current .contentAdder:visible .contentSwitcher:visible').length; // Remove one if a switcher inside an adder

    console.log('Switchable index: ' + switchableIndex);
    console.log('Addable index: ' + addableIndex);

    var number = Math.max(switchableIndex + addableIndex, 0) + 1;

    console.log('Slide step: ' + number);

    $('.slide.current .slidestepnumber').html(number+'');

}

$(function() {
    var contentSwitcher = new SlideContentSwitcher();
    var contentAdder = new SlideContentAdder();
});
