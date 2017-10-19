// ==UserScript==
// @name         SquishTube
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Squish YouTube videos into the top left of the window and optionally resized the video to fit better in reduced size windows.
// @author       haxwithaxe
// @match        http*://*.youtube.com/watch*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.min.js
// ==/UserScript==


(function ($, undefined) {
$(function() {
    'use strict';

    var ZINDEX_UI = 999999;
    var ZINDEX_VIDEO = ZINDEX_UI-10;
    var ZINDEX_PLAYER = ZINDEX_VIDEO-10;

    var STORED_DELTA_KEY = 'squishtube_video_size_delta';
    var STORED_PLAYER_CORNERED_KEY = 'squishtube_player_cornered';

    // the css on the yt page seems to override modifications to just #player
    var PLAYER_SELECTOR = '#player.ytd-watch';
    var VIDEO_SELECTOR = 'video:first';

    // player element original state for resetting the player
    var original_player_height;
    var original_player_width;
    var original_player_position;
    var original_player_left;
    var original_player_top;
    var original_player_z_index;

    var original_video_height;
    var original_video_width;
    var original_video_z_index;

    var scale_ratio;


    // Store the difference in size for use again
    var stash_delta = function(delta) {
        console.debug('setting '+STORED_DELTA_KEY+' to', delta);
        window.localStorage.setItem(STORED_DELTA_KEY, delta);
        load_delta();
    };

    var stash_cornered = function(cornered) {
        console.debug('setting '+STORED_PLAYER_CORNERED_KEY+' to', cornered);
        window.localStorage.setItem(STORED_PLAYER_CORNERED_KEY, cornered);
    };

    // Retrieve the difference in size as a Number
    var load_delta = function() {
        var value = window.localStorage.getItem(STORED_DELTA_KEY);
        if (value === null) value = 0;
        var int_value = Number(value);
        console.debug('loaded raw value for '+STORED_DELTA_KEY, value, 'transformed it to', int_value);
        return int_value;
    };

    // Retrieve the desired cornered state as a Boolean
    var load_cornered = function() {
        var value = window.localStorage.getItem(STORED_PLAYER_CORNERED_KEY);
        var bool_value = value == 'true';
        console.debug('loaded raw value for '+STORED_PLAYER_CORNERED_KEY+' "'+value+'" and transformed it to', bool_value);
        return bool_value;
    };

    var change_video_size = function(delta) {
        console.log('got delta "'+delta+'"');
        corner_player();
        var video = $(VIDEO_SELECTOR);
        if (video.length <= 0) {
            console.debug('no video element');
            return null;
        }
        // change height and width together so the video collapses into the corner
        var cur_height = Number(video.css('height').replace('px', ''));
        var cur_width = Number(video.css('width').replace('px', ''));
        var height = cur_height+ delta/scale_ratio;
        video.css('height', height + 'px');
        var width = Number(video.css('width').replace('px', '')) + delta;
        video.css('width', width + 'px');
        video.css('z-index', ZINDEX_VIDEO);
        $(PLAYER_SELECTOR).css('height', height);
        $(PLAYER_SELECTOR).css('width', width);
        var stored_delta = load_delta();
        stash_delta(stored_delta + delta);
    };

    // Reset the position and size of the player
    var reset_video_size = function() {
        var video = $(VIDEO_SELECTOR);
        if (!video.length) {
            console.debug('no video element');
            return null;
        }
        // change height and width together so the video collapses into the corner
        video.css('height', original_video_height);
        video.css('width', original_video_width);
        video.css('z-index', original_video_z_index);
        $(PLAYER_SELECTOR).css('height', original_player_height);
        $(PLAYER_SELECTOR).css('width', original_player_width);
        stash_delta(0);
    };

    // Shove the player div to the top, left and keep it above the rest of the UI.
    var corner_player = function() {
        if (!load_cornered()) return null;
        var player = $(PLAYER_SELECTOR);
        if (!player.length) {
            console.log('no player element', player);
            return null;
        }
        console.log('cornering player', player);
        player.css('position', 'absolute');
        player.css('left', '0');
        player.css('top', '0');
        player.css('z-index', ZINDEX_PLAYER);
        console.log('cornered', player.css('position'), player.css('left'), player.css('top'));
    };

    // Restore the player div to its original state.
    var uncorner_player = function() {
        var player = $(PLAYER_SELECTOR);
        if (!player.length) {
            console.log('no player element', player);
            return null;
        }
        console.log('uncornering player', player);
        player.css('height', original_player_height);
        player.css('width', original_player_width);
        player.css('position', original_player_position);
        player.css('left', original_player_left);
        player.css('top', original_player_top);
        player.css('z-index', original_player_z_index);
        stash_cornered(false);
        console.log('uncornered', player.css('position'), player.css('left'), player.css('top'));
    };

    // The tiny +/- window size dialog
    //var ui = $('<div id="squishtube-dialog" style="background: black; color: white;position: absolute; top: 10px;right: 10px;font-size: 150%;font-weight: bold;">' +
    var ui = $('<div id="squishtube-dialog">' +
                   '<div id="squishtube-frame" style="disply: table;position: relative;">' +
                       '<div id="squishtube-size" class="squishtube-row">' +
                           '<span class="squishtube-cell" id="squishtube-squish">Squish</span>' +
                           '<span class="squishtube-cell" id="squishtube-size-more">+</span>' +
                           '<span class="squishtube-cell" id="squishtube-size-less">-</span>' +
                           '<span class="squishtube-cell" id="squishtube-reset">Reset</span>' +
                        '</div>' +
                   '</div>' +
               '</div>'
              );
    ui.css(
        {
            'z-index': ZINDEX_UI,
            'background': 'black',
            'color': 'white',
            'position': 'fixed',
            'top': '10px',
            'right': '10px',
            'font-size': '150%',
            'font-weight': 'bold',
            'user-select': false
        }
    );
    $('body').append(ui);
    $('#player').change(corner_player);
    $('#squishtube-squish').click(function(){ stash_cornered(true); corner_player(); });
    $('#squishtube-size-more').click(function(){ change_video_size(10); });
    $('#squishtube-size-less').click(function(){ change_video_size(-10); });
    $('#squishtube-reset').click(function(){ uncorner_player(); reset_video_size(); });
    $('.squishtube-row').css('display', 'table-row');
    $('.squishtube-cell').css({'display': 'table-cell', 'padding-left': '5px', 'padding-right': '5px'});

    console.debug('squishtube: running script');

    // Load the previously used settings
    // This allows changes to persist in autoplay
    var initial_delta = load_delta();
    if (initial_delta === null) initial_delta = 0;
    stash_delta(0);
    if (load_cornered() === null) stash_cornered(false);

    var waitForPlayer = function() {
        var player = $(PLAYER_SELECTOR);
        var video = $(VIDEO_SELECTOR);
        if (player.length && video.length) {
            // Collect the original values before they get changed for the first time.
            original_player_height = player.css('height');
            original_player_width = player.css('width');
            original_player_position = player.css('position');
            original_player_left = player.css('left');
            original_player_top = player.css('top');
            original_player_z_index = player.css('z-index');
            original_video_height = video.css('height');
            original_video_width = video.css('width');
            original_video_z_index = video.css('z-index');
            scale_ratio = Number(original_video_width.replace('px', ''))/Number(original_video_height.replace('px', ''));
            // Resume the previous state
            change_video_size(initial_delta);
            // Stay cornered
            player.change(corner_player);
        } else {
            console.log('waiting', player.length, video.length);
            setTimeout(function() {
                waitForPlayer();
            }, 100);
        }
    };

    waitForPlayer();
    window.sq_jq = $;

});
})(window.jQuery.noConflict(true));