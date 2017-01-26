// router is a component with mapping of path & components
export default {
    create(options){
        // pass null to generate instance
        return LSDom.Component.create('route', {
            scope: () => {
                return {
                    map: options,
                    route: {
                        params: {}
                    }
                }
            },
            mounted(){
                // when hashchange
                window.onhashchange = this.update.bind(this);
                this.update();

                // transform route to
                LSDom.Component.render(this.scope.map[this.scope.route.params.regex], this.$container, {
                    route: this.scope.route
                });
            },

            update(){
                let params = this._match();
                if (params){
                    this.scope.route.params = params;
                }
            },

            _match(){
                let params = {};
                let path = location.hash.slice(1) || "/";
                // init router
                Object.keys(this.scope.map).some(route => {
                     // transform route to regex
                    let keys = [];
                    let regstr = route.replace(/:\w+/g, (a, b) => {
                        keys.push(a.slice(1));
                        return '(\\w+)';
                    });

                    let match = path.match(new RegExp(regstr));
                    if (match){
                        keys.forEach((key, i) => {
                            params[key] = match[i + 1];
                        });
                        params.regex = route;
                        return true;
                    } else {
                        return null;
                    }
                });

                return params;
            }
        })
    }
}



