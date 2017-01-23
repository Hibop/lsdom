import { parseDom } from './domParser';
import { defineGetterSetter } from './getterSetter';
import { Watchers } from './watcher';

/**
 * component class
 */
class Component {

    /**
     * create a component factory
     * @param {String} name
     * @param {options} options - {props, scope, methods, template}
     */
    static create(name, options){

        // transform computed property
        if (options.computed){
            Object.keys(options.computed).forEach(key => {
                let func = options.computed[key];
                delete options.computed[key];

                Object.defineProperty(options, key, {
                    get: func,
                    enumerable : true,
                    configurable : true
                });
            });
        }

        let component = {
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

        Component.list[name] = component;

        return component;
    }

    /**
     * render to a dom node
     * @param {String} name - component name
     * @param {DOMNode} target - target dom node
     */
    static render(compnentName, target){
        let component = Component.list[compnentName].create();
        target.innerHTML = component.tmpl;
        // seems problematic
        parseDom(target, component, Watchers.root);
    }
}

Component.instances = [];
Component.list = {};

export default Component;
