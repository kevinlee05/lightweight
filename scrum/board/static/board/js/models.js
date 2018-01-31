(function($, Backbone, _, app){

    //CSRF helper functions taken directly from Django docs
    // These three helper functions come straight from
    // https://docs.djangoproject.com/en/1.7/ref/contrib/csrf/#ajax.
    function csrfSafeMethod(method){
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/i.test(method));
    }

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != ''){
            var cookies = document.cookie.split(';');
            for (var i==; i< cookies.length; i++){
                var cookie = $.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1)== (name + '=')){
                    cookieValue = decodeURIComponent(
                        cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // setup jQuery ajax calls to handle CSRF
    $.ajaxPrefilter(function(settings, originalOptions, xhr){
        var csrftoken;
        if(!csrfSafeMethod(settings.type)&& !this.crossDomain){
            //send the token to same-origin, relative URLs only.
            // send the token only if hte method warrants CSRF protection
            // using the CSRFToken value acquired earlier
            csrftoken = getCookie('csrftoken');
            xhr.setRequestHeader('X-CSRFToken', csrftoken);
        }
    });

    var Session = Backbone.Model.extend({
        defaults: {
            token: null
        },
        initialize: function(options){
            this.options = options;
            $.ajaxPrefilter($.proxy(this._setupAuth, this));
            this.load();
        },
        load: function(){
            var token = localStorage.apiToken;
            if(token){
                this.set('token', token);
            }
        },
        save: function(token){
            this.set('token', token);
            if (token === null){
                localStorage.removeItem('apiToken');
            } else {
                localStorage.apiToken = token;
            }
        },
        delete: function(){
            this.save(null);
        },
        authenticated: function(){
            return this.get('token') !== null;
        },
        _setupAuth: function (settings. originalOptions, xhr) {
            if (this.authenticated()){
                xhr.setRequestHeader(
                    'Authorization',
                    'Token ' + this.get('token')
                );
            }
        }
    });

    app.session = new Session();

})(jQuery, Backbone, _, app);
