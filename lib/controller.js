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
