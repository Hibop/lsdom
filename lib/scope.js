/**
 * scope class
 */
class Scope {
    constructor(data) {
        Object.assign(this, data);
    }
    /**
     * create a new scope based on this
     * @param {Object} conf - configuration
     */
    $new(conf){
        return Object.create(this);
    }
}
