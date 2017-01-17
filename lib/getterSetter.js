//override Array.prototype.push
['push', 'pop', 'shift', 'unshift', 'splice'].forEach(function(method){
    let originalMethod = Array.prototype[method];
    Array.prototype[method] = function(){
        originalMethod.apply(this, arguments);
        if (this.__parent){
            this.__parent[this.__key] = this;
        }
    }
});


// change all properties to getter/setter
function defineGetterSetter(data, __parent, __key){
    let val = data;
    let type = typeof data;
    let watchers = new Set();

    if (['object'].includes(type) && data !== null){
        if (Array.isArray(data)){
            data.forEach((item, i) => {
                defineGetterSetter(item);
            });
        } else {
            Object.keys(data).forEach(key => {
                let val = data[key];
                Object.defineProperty(data, key, {
                    get(){
                        if (bindNode.currentWatcher){
                            bindWatcherOnSetter(bindNode.currentWatcher, watchers);
                        }

                        return val;
                    },
                    set(newV){
                        val = newV;
                        let iter = watchers[Symbol.iterator]();
                        let watcher = null;
                        while (watcher = iter.next().value){
                            triggerWatcher(watcher);
                        }
                    },
                    enumerable : true,
                    configurable : true
                });


                if (typeof val === 'object' && data !== null){
                    defineGetterSetter(val, data, key);
                }

            });
        }

        if (__parent) {
            data.__parent = __parent;
            data.__key = __key;
        }
    }
}
