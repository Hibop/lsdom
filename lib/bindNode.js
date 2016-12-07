/**
 * bind update function to a node & scope
 * @param {Node} node - target node
 * @param {String} type - text, attr, style, for
 * @param {Object} scope - scope
 * @param {Object} parsed - parsed expression: expression & update
 * @param {extra} extra - any other info
 */
const bindNode = (node, type, scope, parsed, extra) => {
    console.log('bindNode:', node, type, scope, parsed, extra);
    let parentWatcher = extra.parentWatcher || watchers;
    let newWatcher = null;
    switch (type) {
    case 'text':
        newWatcher = {
            expression: parsed.expression,
            val: parsed.update.bind(null, scope),
            update: (oldV, newV) => node.textContent = newV,
        };
        break;
    case 'attr':
        newWatcher = {
            expression: parsed.expression,
            val: parsed.update.bind(null, scope),
            update: (oldV, newV) => node.setAttribute(extra.name, newV),
        };
        break;
    case 'style':
        newWatcher = {
            expression: parsed.expression,
            val: parsed.update.bind(null, scope),
            update: (oldV, newV) => setStyle(node, newV),
        };
        break;
    case 'value':
        newWatcher = {
            expression: parsed.expression,
            val: parsed.update.bind(null, scope),
            update: (oldV, newV) => node.value = newV,
            isModel: true
        };
        break;
    case 'for':
        newWatcher = {
            expression: parsed.expression,
            isArray: true,
            val: parsed.update.bind(null, scope),
            update: (oldLength, newLength, watcher) => {
                let endAnchor = extra.forAnchorEnd;
                let parentNode = endAnchor.parentNode;
                if (newLength > oldLength){
                    // add data.length dom, before the endAnchor
                    let tmpl = extra.tmpl;
                    let i = oldLength;
                    while(i < newLength){
                        let newNode = tmpl.cloneNode('deep');
                        parseConfig.replacement = {
                            from: extra.itemExpression,
                            to: parsed.expression.replace('scope.', '') + '[' + i + ']'
                        };
                        parseDom(newNode, scope, watcher);
                        parentNode.insertBefore(newNode, endAnchor);
                        i++;
                    }
                    parseConfig.replacement = undefined;
                } else if (newLength < oldLength){
                    let i = oldLength - 1;
                    while(i > newLength - 1){
                        unwatch(watcher.childs[i]);
                        parentNode.removeChild(endAnchor.previousSibling);
                        i--;
                    }
                }
            },
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
