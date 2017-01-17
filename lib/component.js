/**
 * component class
 */
class Component {
    constructor(option){
        Object.assign(this, option);

        // transfer scope to Scope
        this.scope = new Scope(this.scope || {});

        // debug
        Component.instances.push(this);
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
        digest();
    }
}

Component.instances = [];
