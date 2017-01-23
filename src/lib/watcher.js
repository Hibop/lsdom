import { diff } from './diff';

/**
 * update style attribute of a node, by an obj
 */
export const setStyle = (node, styleObj) => {
    Object.assign(node.style, styleObj);
}

/**
 * all watchers, to be dirty-checked every time
 */
export const Watchers = {
    root: {},
    currentWatcherStack: []
};

// debug
window.Watchers = Watchers;
/**
 * check watcher value change and update
 */
export const triggerWatcher = function(watcher){
    console.group('triggerWatcher', watcher.expression);
    let newV = watcher.val();
    if (watcher.isModel){
        watcher.update(undefined, newV || '');
        watcher.oldV = newV;
    } else if (!watcher.isArray && (0 !== newV)){
        watcher.update(0, newV);
        watcher.oldV = newV;
    } else if (watcher.isArray){
        let oldV =  watcher.oldV || [];
        diff(oldV, newV).forEach(patch => {
            (patch[0] === 1 ? watcher.update.add : watcher.update.remove)(patch[1], patch[2], patch[3]);
        });
        watcher.oldV = newV.slice(0);
    }
    console.groupEnd();
}

/**
 * add setter watchers
 * @param {Watcher} watcher - watcher to bind
 * @param {Array} location - watchers array in setter
 */
export const bindWatcherOnSetter = function(watcher, setterLocation){
    watcher.locations = watcher.locations || new Set();
    if (!watcher.locations.has(setterLocation)){
        console.log(`bind ${watcher.expression} to ${setterLocation}`);
        watcher.locations.add(setterLocation);
    }

    if (!setterLocation.has(watcher)){
        setterLocation.add(watcher);
    }
}

/**
 * remove setter watchers
 * @param {Watcher} watcher - watcher to bind
 */
export const unwatch = function(watcher){
    let list = watcher.parent.childs;
    list.splice(list.indexOf(watcher), 1);

    if (watcher.locations){
        watcher.locations.forEach(loc => {
            loc.delete(watcher);
        });
    }
}

/**
 * add child watcher
 */

export const addChildWatcher = function(parent, child){
    if (!parent.childs) {
        parent.childs = [];
    }
    parent.childs.push(child);
}
