// jnottery.com (c) Tomasz Zduńczyk <tomasz@zdunczyk.org>

(function($, hljs) {
    var BG_GREEN_SELECTED = '#16866e',
        BG_GRAY_SELECTED = 'white';

    hljs.configure({ tabReplace: '    ' });
    hljs.initHighlighting();

    function get_container($obj) {
        if($obj.closest('.main-col').hasClass('col-xs-8'))
            return $obj.closest('.main-row').find('.col-xs-4');
        else
            return $obj.closest('.main-row').find('.col-xs-8');
    }

    function append_tt($obj, css) {
        var cont = get_container($obj),
            btn = $('<div/>')
                    .css(css)
                    .addClass('fugaz plus-tt')
                    .text('+tt')
                    .on('mousedown', function() {
                        var select = tt($obj).selection();
                        
                        if(select.length > 0)
                            open_tooltip(select, cont); 
                    });    

        $obj.css({
            position: 'relative'
        }).append(btn);
    }

    function append_marker(note) {
        var container = get_container(note.element),
            pos = tt(note).arrowPosition({
                container: container,
                fitToViewport: false
            }),
            marker = $('<div/>')
                        .addClass('note-marker note-marker-' + note.id)
                        .offset({ 
                            top: pos.top - 16, 
                            left: pos.left - 12 
                        });
        
        marker.click(function() {
            open_tooltip(note, container);
        }); 

        $(document.body).append(marker);
    }

    function init_tooltip(tooltip, $obj, cont, color) {
        var content = cont.find('.col-content');
            content.stop().animate({ opacity: 0.3 }); 

        color && $obj.css({ 
            backgroundColor: color 
        });

        tooltip.on('close.tt', function(e, tooltip_obj) {
            content.stop().animate({ opacity: 1.0 });   

            if(!tooltip_obj.edit()) {
                $obj.css({ 
                    backgroundColor: '' 
                });
            }
        });

        tooltip.on('deleted.note.tt', function(e, tooltip_obj, note_id) {
            $('.note-marker-' + note_id).remove(); 
        });

        tooltip.on('new.note.tt', function(e, tooltip_obj, note) {
            append_marker(note);    
        });
    }

    function open_tooltip($obj, cont, color) {
        var tooltip = tt($obj).tooltip({
            container: cont
        });

        init_tooltip(tooltip, $obj, cont, color); 
    }

    $(window).load(function() {
        $('.main-row').each(function() {
            var left_col = $(this).children('.col-xs-8'),
                right_col = $(this).children('.col-xs-4');
            
            if(left_col.outerHeight() > right_col.outerHeight())
                right_col.outerHeight(left_col.outerHeight());
            else
                left_col.outerHeight(right_col.outerHeight());
        });

        var note_cnt = 0;
        function note_handler(note) {
            note_cnt++;
            append_marker(note);
        }

        tt(document.body).init({
            vendor: {
                bitly: {
                    access_token: 'BITLY_ACCESS_TOKEN'
                }
            },
            onElementNote: function(note) {
                note_handler(note);

                var is_green = note.element.closest('.main-row-wrapper').hasClass('green-row'); 
                note.element.css({ 
                    backgroundColor: (is_green ? BG_GREEN_SELECTED : BG_GRAY_SELECTED)
                });
            },
            onSelectionNote: note_handler,
            onReady: function() {
                if(note_cnt > 0) {
                    setTimeout(function() {
                        var info_bar = $('.info-bar');
                        info_bar.find('.note-cnt').text(note_cnt);
                        info_bar.slideDown();
                        $('.note-marker').animate({ top: '+=35px' });
                    }, 500);
                }
            }
        }); 
    });

    $(function() {
        $('pre code').each(function(i, element) { hljs.highlightBlock(element) });

        $('.col-xs-8 .selectable').each(function() {
            append_tt($(this), { left: -40 }); 
        });
        
        $('.col-xs-4 .selectable').each(function() {
            append_tt($(this), { right: -40 }); 
        });

        $('.green-row .col-xs-8 img, .green-row .col-xs-4 img').click(function() {
            open_tooltip($(this), get_container($(this)), BG_GREEN_SELECTED);
        });
       
        $('.gray-row .col-xs-8 img, .rev-gray-row .col-xs-8 img')
            .add('.gray-row .col-xs-4 img, .rev-gray-row .col-xs-4 img').click(function() {
                open_tooltip($(this), get_container($(this)), BG_GRAY_SELECTED);
        });
        
        $('.info-close').click(function() {
            $('.info-bar').slideUp();
            $('.note-marker').animate({ top: '-=35px' });
        });
    });
    
})(jQuery, hljs);