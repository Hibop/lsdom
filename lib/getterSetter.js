// change all properties to getter/setter
function defineGetterSetter(data){
    let val = data;
    let type = typeof data;

    if (['object'].includes(type) && data !== null){
        if (Array.isArray(data)){
            data.forEach(defineGetterSetter);
        } else {
            Object.keys(data).forEach(key => {
                let val = data[key];
                Object.defineProperty(data, key, {
                    get(){
                        console.log('get', key, bindNode.currentWatcher);
                        return val;
                    },
                    set(newV){
                        console.log('set', key);
                        val = newV;
                    },
                    enumerable : true,
                    configurable : true
                });

                if (typeof val === 'object' && data !== null){
                    defineGetterSetter(val);
                }
            });
        }
    }
}
