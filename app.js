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



let parseConfig = {
    replacement: undefined
};
/**
 * parse an expression
 * @param {expression} expression - expression
 * @desc
 * if can be valued, return the value,
 */
const parse = (expression) => {
    if (typeof parseConfig.replacement !== 'undefined'){
        expression = expression.replace(parseConfig.replacement.from, parseConfig.replacement.to);
    }
    // expression example:
    //    length
    //    todos.length
    //    todos.length + 1
    //    todos.length > 0 ? 'empty' : todos.length
    let newExpression = expression.replace(/([^a-zA-Z0-9\._\$\[\]]|^)([a-zA-Z_\$][a-zA-Z0-9\._\$\[\]]+)(?!\s*:|'|")(?=[^a-zA-Z0-9\._\$\[\]]|$)/g, function(a,b,c){
        // for something like foo[1].bar, change it to foo.1.bar
        return b + 'scope.' + c;
    });

    if (newExpression === expression){
        return eval(expression);
    }


    return newExpression === expression ? eval(expression) : {
        expression: newExpression,
        update: new Function('scope', 'return ' + newExpression)
    };
};

/**
 * parse string with {expression}
 */
const parseInterpolation = (str) => {
    var i = j = 0;
    var segs = [];
    var hasInterpolation = false;

    while (j < str.length){
        if (str[j] === '{'){
            hasInterpolation = true;
            if (j > i){
                segs.push(str.slice(i, j));
            }
            i = j + 1;
        } else if (str[j] === '}'){
            if (j > i){
                segs.push(parse(str.slice(i, j)));
            }
            i = j + 1;
        }
        j++;
    }

    if (j > i){
        segs.push(str.slice(i, j));
    }

    if (hasInterpolation){
        let keys = new Set();

        return {
            expression: segs.join('+'),
            update(data){
                return segs.reduce((pre, curr) => {
                    if (typeof curr !== 'string'){
                        return pre + curr.update(data);
                    }
                    return pre + curr;
                }, '');
            }
        }
    } else {
        return str;
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

/**
 * unwatch
 */
const unwatch = (watcher) => {
    let list = watcher.parent.childs;
    list.splice(list.indexOf(watcher), 1);
}

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

/**
 * traverse a dom, parse the attribute/text {expressions}
 */
const parseDom = ($dom, scope, parentWatcher) => {
    var hasForAttr = false;
    // if textNode then
    if ($dom.attributes){
        Array.prototype.forEach.call($dom.attributes, (attr) => {
            let name = attr.nodeName;
            let str = attr.nodeValue;

            // for style, if it is object expression
            if (name === 'style'){
                if (str[0] === '{'){
                    let parsed = parse(str);
                    if (typeof parsed.update === 'undefined'){
                        $dom.setStyle($dom, parsed);
                    } else {
                        bindNode($dom, 'style', scope, parsed, {
                            parentWatcher
                        });
                    }
                }
            } else if (name === 'for'){
                // add comment anchor
                let forAnchorStart = document.createComment('for');
                $dom.parentNode.insertBefore(forAnchorStart, $dom);

                let forAnchorEnd = document.createComment('end');
                if ($dom.nextSibling){
                    $dom.parentNode.insertBefore(forAnchorEnd, $dom.nextSibling);
                } else {
                    $dom.parentNode.appendChild(forAnchorEnd);
                }

                let tmpl = $dom.parentNode.removeChild($dom);
                tmpl.removeAttribute('for');
                let match = /(.*)(\s+)in(\s+)(.*)/.exec(str);
                let itemExpression = match[1];
                let listExpression = match[4];

                let parseListExpression = parse(listExpression);
                bindNode(forAnchorStart, 'for', scope, parseListExpression, {
                    itemExpression,
                    forAnchorEnd,
                    tmpl,
                    parentWatcher
                });
                hasForAttr = true;
            } else if (name === 'click'){
                let parsed = parse(str);
                $dom.addEventListener('click', ()=>{
                    parsed.update(scope);
                    dijest();
                }, false);

            } else if (name === 'model'){
                let parsed = parse(str);
                $dom.addEventListener('input', ()=>{
                    scope.set(parsed.expression.replace('scope.', ''), $dom.value);
                });
                bindNode($dom, 'value', scope, parsed, {parentWatcher});
            } else {
                let parsed = parseInterpolation(str);
                if (typeof parsed !== 'object'){
                    $dom.setAttribute(name, parsed);
                } else {
                    bindNode($dom, 'attr', scope, parsed, {parentWatcher});
                }
            }
        });
    }

    // if it is text node
    if ($dom.nodeType === 3){
        let text = $dom.nodeValue.trim();
        if (text.length){
            let parsed = parseInterpolation($dom.nodeValue);
            if (typeof parsed !== 'object'){
                $dom.textContent = parsed;
            } else {
                bindNode($dom, 'text', scope, parsed, {parentWatcher});
            }
        }
    }

    if (!hasForAttr){
        let start = $dom.childNodes[0];
        while(start){
            parseDom(start, scope, parentWatcher);
            start = start.nextSibling;
        }
    }
}


/**
 * Controller
 */
class Controller {
    constructor(){
        this.scope = {};
    }

    init(){
        parseDom(document.body, this.scope);
        dijest();
    }
}


// app
class appController extends Controller {
    constructor(props) {
        super(props);

        this.scope.todos = [];

        this.scope.add = this.add.bind(this);
        this.scope.remove = this.remove.bind(this);

        this.init();
    }

    add(){
        let item = {
            name: this.scope.newItemName
        };
        this.scope.newItemName = '';
        this.scope.todos.push(item);
    }

    remove(item){
        let index = this.scope.todos.indexOf(item);
        this.scope.todos.splice(index, 1);
    }
}

window.app = new appController();

