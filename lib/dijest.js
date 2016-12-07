/**
 * enable fetching object consequential peroperties
 * example:
 * var foo = {bar: {foo: 3}}
 * foo.get('bar.foo') === 3
 */

Object.prototype.get = function(prop){
    const segs = prop.split('.');
    let result = this;
    let i = 0;

    while(result && i < segs.length){
        result = result[segs[i]];
        i++;
    }

    return result;
}

/**
 * set consequential peroperty a value
 * @example:
 * var foo = {};
 * foo.set('foo.bar', 3);
 * foo is now {foo: {bar: 3}}
 */
Object.prototype.set = function(prop, val){
    const segs = prop.split('.');
    let target = this;
    let i = 0;
    while(i < segs.length){
        if (typeof target[segs[i]] === 'undefined'){
            target[segs[i]] = i === segs.length - 1 ? val : {};
        } else if (i === segs.length - 1){
            target[segs[i]] = val;
        }

        target = target[segs[i]];
        i++;
    }
}

/**
 * update style attribute of a node, by an obj
 */
const setStyle = (node, styleObj) => {
    Object.assign(node.style, styleObj);
}


/**
 * all watchers, to be dirty-checked every time
 */
const watchers = {};

/**
 * dijest a watcher, recursively
 */
const _dijest = (watcher) => {
    if (watcher.val){
        let newV = watcher.val();
        if (watcher.isModel){
            watcher.update(watcher.oldV, newV || '');
            watcher.oldV = newV;
        } else if (!watcher.isArray && (watcher.oldV !== newV)){
            console.log(`dijest: ${watcher.expression}, ${watcher.oldV} => ${newV}`);
            watcher.update(watcher.oldV, newV);
            watcher.oldV = newV;
        } else if (watcher.isArray && newV.length !== watcher.oldV){
            watcher.update(watcher.oldV ? watcher.oldV : 0, newV ? newV.length : 0, watcher);
            watcher.oldV = newV.length;
        }
    }

    if (watcher.childs){
        watcher.childs.forEach(_dijest);
    }
};

/**
 * dijest method, if expression changes, un the update
 */
const dijest = () => {
    _dijest(watchers);
};