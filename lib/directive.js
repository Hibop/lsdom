/**
 * directive class
 * @param string - tmpl string
 * @param number - priority
 */
class Directive {
    constructor({tmpl = null, priority = 0}){
        this.tmpl = tmpl;
        this.priority = priority;
    }

    static create(name, options){
        Directive.instances[name] = new Directive(options);
    }
}

Directive.instances = {};
