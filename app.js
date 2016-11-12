(function(){
/**
 * parse an expression,
 * if can be valued, just return the value
 * if not, return keys & update function, used in data biding
 */
function parse(expression){
    // expression example:
    //    length
    //    todos.length
    //    todos.length + 1
    //    todos.length > 0 ? 'empty' : todos.length
    let keys = new Set();
    let newExpression = expression.replace(/([^a-zA-Z0-9\._\$]|^)([a-zA-Z_\$][a-zA-Z0-9\._\$]+)(?!\s*:|'|")([^a-zA-Z0-9\._\$]|$)/g, function(a,b,c,d){
        keys.add(c);
        return b + 'data.' + c + d;
    });

    if (newExpression === expression){
        return eval(expression);
    }

    console.log('parse', newExpression, expression);
    return newExpression === expression ? eval(expression) : {
        keys,
        update: new Function('data', 'return ' + newExpression)
    };
}

/**
 * parse string with {expression}
 */
function parseInterpolation(str){
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
        segs.forEach((seg) => {
            if (typeof seg === 'object'){
                seg.keys.forEach(keys.add.bind(keys));
            }
        });

        if (keys.size === 0){
            return segs.reduce((pre, curr) => {
                    return pre + curr;
                }, '');
        }

        return {
            keys,
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
function setStyle(node, styleObj){
    Object.assign(node.style, styleObj);
}

/**
 * bind update function to a node & model
 */
function bindNode(node, type, model, keys, func, extra){
    console.log('bind', node, type, model, keys);
    if (type === 'text'){
        node.textContent = func(model.data);
        keys.forEach((key) => model.listen('set:' + key, () => node.textContent = func(model.data)));
    } else if (type === 'attr'){
        node.setAttribute(extra.name, func(model.data));
        keys.forEach((key) => model.listen('set:' + key, () => node.setAttribute(extra.name, func(model.data))));
    } else if (type === 'style'){
        setStyle(node, func(model.data));
        keys.forEach((key) => model.listen('set:' + key, () => setStyle(node, func(model.data))));
    }
};

/**
 * traverse a dom, parse the attribute/text {expressions}
 */
function parseDom($dom, model){
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
                        bindNode($dom, 'style', model, parsed.keys, parsed.update);
                    }
                }
            } else if (name === 'for'){
                // TODO for
                hasForAttr = true;
            } else {
                let parsed = parseInterpolation(str);
                if (typeof parsed !== 'object'){
                    $dom.setAttribute(name, parsed);
                } else {
                    bindNode($dom, 'attr', model, parsed.keys, parsed.update)
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
                bindNode($dom.parentNode, 'text', model, parsed.keys, parsed.update);
            }
        }
    }

    if (!hasForAttr){
        Array.prototype.forEach.call($dom.childNodes, (node) => parseDom(node, model));
    }
}

// Model
class Model {
    constructor(conf){
        this.data = {};
        this._listeners = {};

        Object.assign(this, conf);
    }

    /**
     * trigger events
     */
    trigger(evts, data){
        let events = evts.split(/\s+/);
        events.forEach((event) => {
            if (this._listeners[event]){
                this._listeners[event].forEach((listener) => listener(data));
            }
        });
    }

    /**
     * add listeners to events
     */
    listen(evts, listener){
        let events = evts.split(/\s+/);
        events.forEach((event) => {
            if (!this._listeners[event]){
                this._listeners[event] = [listener];
            } else {
                this._listeners[event].push(listener);
            }
        });
    }

    /**
     * update a property
     */
    set(attr, val){
        this.data[attr] = val;
        this.trigger('set:' + attr, val);
    }
}


// app
let appModel = new Model({
    data: {
        todos: [],
        count: 0
    },
    add(name){
        let item = new Model({
            data: {
                name: name
            }
        });
        this.data.todos.push(item);
        this.trigger('add', item);
        this.set('count', this.data.todos.length);
    },

    remove(item){
        let index = this.data.todos.indexOf(item);
        this.data.todos.splice(index, 1);
        this.trigger('delete', index);
        this.set('count', this.data.todos.length);
    }

});

// start app
appModel.add('item1');
parseDom(document.body, appModel);

})();
