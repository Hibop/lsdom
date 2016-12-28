/**
 * component class
 */
class Component {
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
     * create a component
     * @param {String} name - component name
     * @param {Object} options - other config data
     */
    static create(name, options){
        return Component.instances[name] = new Component(options);
    }

    /**
     * render to a dom node
     * @param {String} name - component name
     * @param {DOMNode} target - target dom node
     */

    static render(name, target){
        let component = Component.instances[name];
        target.innerHTML = component.tmpl;
        parseDom(target, component.scope);
        dijest();
    }

}

Component.instances = {};
