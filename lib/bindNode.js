/**
 * bind update function to a node & component
 * @param {Node} node - target node
 * @param {String} type - text, attr, style, for
 * @param {Object} component - component
 * @param {Object} parsed - parsed expression: expression & update
 * @param {extra} extra - any other info
 */
const bindNode = (node, type, component, parsed, extra) => {
    let parentWatcher = extra.parentWatcher || watchers;
    let newWatcher = null;
    switch (type) {
    case 'text':
        newWatcher = {
            node,
            expression: parsed.expression,
            val: parsed.update.bind(component),
            update(oldV, newV){
                this.node.textContent = newV
            }
        };
        break;
    case 'attr':
        newWatcher = {
            node,
            expression: parsed.expression,
            val: parsed.update.bind(component),
            update(oldV, newV){
                this.node.setAttribute(extra.name, newV);
            }
        };
        break;
    case 'style':
        newWatcher = {
            node,
            expression: parsed.expression,
            val: parsed.update.bind(component),
            update(oldV, newV){
                setStyle(this.node, newV)
            }
        };
        break;
    case 'value':
        newWatcher = {
            node,
            expression: parsed.expression,
            val: parsed.update.bind(component),
            update(oldV, newV){
                this.node.value = newV;
            },
            isModel: true
        };
        break;
    case 'for':
        newWatcher = {
            expression: parsed.expression,
            isArray: true,
            val: parsed.update.bind(component),
            update: {
                add: (arr, from, to) => {
                    let endAnchor = extra.forAnchorEnd;
                    let parentNode = endAnchor.parentNode;
                    let tmpl = extra.tmpl;
                    let i = from;
                    while (i <= to){
                        let newNode = tmpl.cloneNode('deep');
                        let intermediate = Object.create(component);
                        let j = i;

                        Object.defineProperty(intermediate, extra.itemExpression, {
                            get(){
                                return parsed.update.call(component)[j];
                            },
                            set(newValue){ console.error('direct modify parents\' data')},
                            enumerable : true,
                            configurable : true}
                            );
                        parseDom(newNode, intermediate, newWatcher);
                        parentNode.insertBefore(newNode, parentNode.childNodes[to]);
                        i++;
                    }
                },

                remove: (arr, from, to) => {
                    console.log(`remove ${from} to ${to}`);
                    let endAnchor = extra.forAnchorEnd;
                    let parentNode = endAnchor.parentNode;
                    let i = from;
                    let target = endAnchor.parentNode.childNodes[i];
                    let total =  newWatcher.childs.length

                    // update child watchers
                    i = total - 1;
                    while ( i > to){
                        console.log('watcher', i , 'to', i - to + from - 1);
                        newWatcher.childs[i].update = newWatcher.childs[i - to + from - 1].update;
                        newWatcher.childs[i].val = newWatcher.childs[i - to + from - 1].val;
                        i--;
                    }

                    // delete dom & unwatch
                    i = from;
                    while (i <= to){
                        console.log('remove dom', i);
                        parentNode.removeChild(target);
                        target = target.nextSibling;
                        console.log('unwatch', i);
                        unwatch(newWatcher.childs[i]);
                        i++;
                    }
                }
            }
        };
        break;
    default:
        break;
    }

    if (!parentWatcher.childs){
        parentWatcher.childs = [];
    }

    newWatcher.parent = parentWatcher;
    parentWatcher.childs.push(newWatcher);
};
