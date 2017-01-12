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
     * render to a dom node
     * @param {String} name - component name
     * @param {DOMNode} target - target dom node
     */
    static render(aComponent, target){
        let component = new aComponent();
        target.innerHTML = component.tmpl;
        parseDom(target, component);
        dijest();
    }
}
