/**
 * Takes the result of a tumblr JS API request and turns it into HTML
 */
function tumblr2html ( tumblr_api_read, options ) {

    options = options || {};

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
        for ( key in options.formats ) {
            if ( options.formats.hasOwnProperty(key) ) {
                formats[key] = options.formats[key]
            }
        }
    }

    // Given a string template, applies a template
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

    var html =
        tumblr_api_read.posts
        .slice(
            0,
            options.limit ?
                Math.min(tumblr_api_read.length, options.limit) :
                tumblr_api_read.posts.length
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
            else {
                console.log( post );
            }
            return "";
        })
        .join("\n")

    if ( options.id ) {
        document.getElementById(options.id).innerHTML = html;
    }
    else {
        document.write(html);
    }
}

