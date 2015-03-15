(function () {
    "use strict";

    /** Given a string template, applies a template */
    function interpolate ( template, obj ) {
        return template.replace(/{([^{}]*)}/g,
            function (match, key) {
                var value = obj[key];
                if ( typeof value === 'string' || typeof r === 'number' ) {
                    return value;
                }
                else {
                    return "";
                }
            }
        );
    }

    /** Loads the details for the given blog */
    function tumblr2html ( blog, options ) {

        // Maps type of posts posts to specific formatting
        var formats = {
            'regular':
                '<article class="post">' +
                '<h2>{regular-title}</h2>' +
                '<div>{regular-body}</div>' +
                '</article>',
            'quote':
                '<article class="quote">' +
                '<blockquote>{quote-text}</blockquote>' +
                '<span>{quote-source}</span>' +
                '</article>',
            'photo':
                '<article class="photo">' +
                '<img src="{photo-url-500}">' +
                '{photo-caption}' +
                '</article>',
            'link':
                '<article class="link">' +
                '<a href="{link-url}">{link-text}</a>' +
                '{link-description}' +
                '</article>',
            'conversation': function (post) {
                return '<article class="conversation">' +
                    post.conversation.map(function (convo) {
                        return interpolate(
                            "<p><span>{name}</span>: {phrase}</p>",
                            convo
                        );
                    }).join("\n") +
                    "</article>";
            },
            'audio':
                '<article class="audio">' +
                '{audio-player}' +
                '{audio-caption}' +
                '</article>'
        };

        // Grab any format overrides from the options hash
        if ( options.formats ) {
            for ( var key in options.formats ) {
                if ( options.formats.hasOwnProperty(key) ) {
                    formats[key] = options.formats[key];
                }
            }
        }

        /** Executed after the Tumblr API loads */
        function onLoad () {
            var posts = window.tumblr_api_read.posts; // jshint ignore:line

            var html =
                posts
                .slice(
                    0,
                    options.limit ?
                        Math.min(posts.length, options.limit) :
                        posts.length
                )
                .map(function (post) {
                    var format = formats[post.type];
                    if ( format ) {
                        if ( typeof format === "string" ) {
                            return interpolate( format, post );
                        }
                        else if ( typeof format === "function" ) {
                            return format(post);
                        }
                    }
                    return "";
                })
                .join("\n");

            var anchor = typeof options.elem === "string" ?
                document.getElementById(options.elem) :
                options.elem;

            if ( anchor.nodeName === "SCRIPT" ) {
                var div = document.createElement("section");
                div.innerHTML = html;
                [].slice.call(div.childNodes)
                    .reverse()
                    .reduce(function (before, elem) {
                        before.parentNode.insertBefore(elem, before);
                        return elem;
                    }, anchor);
            }
            else {
                anchor.innerHTML = html;
            }
        }

        var script = document.createElement("script");
        script.addEventListener("load", onLoad);
        script.src = "http://" + blog + ".tumblr.com/api/read/json";
        document.head.appendChild(script);
    }

    window.tumblr2html = tumblr2html;

    var config = document.querySelector("[data-tumblr-blog]");
    if ( config ) {
        var blog = config.getAttribute("data-tumblr-blog");
        tumblr2html(blog, { elem: config });
    }

}());
