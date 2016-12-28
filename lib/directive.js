/**
 * directive class
 */
class Directive {
    constructor(option){
        Object.assign(this, option);

        // transfer scope to Scope
        this.scope = new Scope(this.scope || {});

        // bind all scope method to this, for extension
        Object.keys(this.scope)
            .filter(key => typeof this.scope[key] === 'function')
            .forEach(key => this.scope[key] = this.scope[key].bind(this))
    }

    /**
     * create a directive
     * @param {String} name - directive name
     * @param {Object} options - other config data
     */
    static create(name, options){
        return Directive.instances[name] = new Directive(options);
    }

    /**
     * render to a dom node
     * @param {String} name - directive name
     * @param {DOMNode} target - target dom node
     */

    static render(name, target){
        let directive = Directive.instances[name];
        target.innerHTML = directive.tmpl;
        parseDom(target, directive.scope);
        dijest();
    }

}

Directive.instances = {};
