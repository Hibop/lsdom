import { parseDom } from './domParser';
import { defineGetterSetter } from './getterSetter';

/**
 * component class
 */
class Component {

    static create(name, options){

        Component.list[name] = {
            create(){
                let instance = Object.create(options);
                if (instance.scope){
                    instance.scope = instance.scope();
                    defineGetterSetter(instance.scope);
                }
                Component.instances.push(instance);
                return instance;
            }
        }
        return options;
    }

    /**
     * render to a dom node
     * @param {String} name - component name
     * @param {DOMNode} target - target dom node
     */
    static render(compnentName, target){
        let component = Component.list[compnentName].create();
        target.innerHTML = component.tmpl;
        parseDom(target, component);
    }
}

Component.instances = [];
Component.list = {};

export default Component;
