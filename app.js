(function(){
    // rendering engine
    var Render = (function(){
        var uid = 0;

        return function(selector, model){
            var tmpl =  document.querySelector(selector).innerHTML.trim();
            var matches = tmpl.match(/<(\w+)>([\s\S]*)<\/(\w+)>/);
            var newItem = document.createElement(matches[1]);

            var watchers = {};
            // suppose all {} interpolate is in textnode
            newItem.innerHTML = matches[2].replace(/\{(.*?)\}/g, function(a, key){
                var id = uid++;
                if (!watchers[key]){
                    watchers[key] = [id];
                } else {
                    watchers[key].push(id);
                }
                return '<span id="id' + id + '">' + (key === 'this' ? model.data : model.data[key] ) + '</span>';
            });

            // register
            for(var key in watchers){
                watchers[key].forEach(function(id){
                    var $dom = newItem.querySelector('#id' + id);
                    model.listen('set:' + key, function(val){
                        $dom.textContent = val;
                    });
                });
            }

            return newItem;
        }
    })();


    // Model class
    function Model(conf){
        this.data = {};
        this._listeners = {};

        Object.assign(this, conf);
    }

    Model.prototype.trigger = function(events, data){
        var events = events.split(/\s+/);
        var that = this;
        events.forEach(function(event){
            if (that._listeners[event]){
                that._listeners[event].forEach(function(listener){
                    listener(data);
                });
            }
        });
    };

    Model.prototype.listen = function(events, listener){
        var events = events.split(/\s+/);
        var that = this;
        events.forEach(function(event){
            if (!that._listeners[event]){
                that._listeners[event] = [listener];
            } else {
                that._listeners[event].push(listener);
            }
        });
    };

    Model.prototype.set = function(attr, val){
        this.data[attr] = val;
        this.trigger('set:' + attr, val);
    };

    // View class
    function View(conf){
        Object.assign(this, conf);
        this.init();
    };

    View.prototype.clear = function(){
        this.$dom.parentNode.removeChild(this.$dom);
    };

    View.prototype.listenTo = function(model, event, listener){
        model.listen(event, listener);
    };

    View.prototype.renderTo = function($dom){
        $dom.appendChild(this.$dom);
    }

    // app
    var appModel = new Model({
        data: {
            todos: [],
            count: 0
        },
        add: function(name){
            var item = new Model({
                data: {
                    name: name
                }
            });
            this.data.todos.push(item);
            this.trigger('add', item);
            this.set('count', this.data.todos.length);
        },

        remove: function(item){
            var index = this.data.todos.indexOf(item);
            this.data.todos.splice(index, 1);
            this.trigger('delete', index);
            this.set('count', this.data.todos.length);
        }

    });

    var appView = new View({
        $dom: Render('#js-tmpl-app', appModel),
        init: function(){
            this.$list = this.$dom.querySelector('.jsList');
            this.$listEmpty = this.$dom.querySelector('.jsListEmpty');
            this.$input = this.$dom.querySelector('.jsInput');
            this.$add = this.$dom.querySelector('.jsAdd');

            this.$add.addEventListener('click', this._onClickAdd.bind(this), false);

            this.listenTo(appModel, 'add', this.add.bind(this));
            this.listenTo(appModel, 'delete', this.delete.bind(this));
            this.listenTo(appModel, 'add delete', this.update.bind(this));
        },

        add: function(item){
            var newItem = Render('#js-tmpl-item', item);

            newItem.querySelector('.jsDelete').addEventListener('click', function(){
                appModel.remove(item);
            }, false);
            this.$list.appendChild(newItem);
        },

        delete: function(index){
            this.$list.removeChild(this.$list.querySelectorAll('li')[index + 1]);
        },

        update: function(){
            if (appModel.data.todos.length > 0){
                this.$listEmpty.style.display = 'none';
            } else {
                this.$listEmpty.style.display = 'block';
            }
        },

        _onClickAdd: function(){
            var input = this.$input.value.trim();
            if (input.length === 0){
                return;
            }
            appModel.add(input);
            this.$input.value = '';
        }
    });

    appView.renderTo(document.querySelector('#view'));
})();
