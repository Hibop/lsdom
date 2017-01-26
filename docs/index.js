// component todo-item
LSDom.Component.create('todo-item', {
    props: ['todo', 'remove'],
    tmpl:  `<li classname="props.todo.done ? 'completed' : ''"><div class="view">
        <input class="toggle" type="checkbox" click="(e) => toggle(props.todo)" ls-checked="{props.todo.done}">
        <label>{props.todo.name}</label>
        <button class="destroy" click="(e) => props.remove(props.todo)"></button>
        </div></li>`,
    toggle(todo){
        todo.done = !todo.done;
    }
});

LSDom.Component.create('add-todo', {
    props: ['addItem'],
    tmpl: `<input type="text" class="new-todo" placeholder="What needs to be done?" model="scope.newItemName" keypress='(e) => add(e)'>`,
    scope: () => {
        return {
            newItemName: ''
        }
    },

    add(e){
        // add when enter key is pressed
        if (e.which === 13){
            if (this.scope.newItemName){
                this.props.addItem({
                    name: this.scope.newItemName,
                    done: false
                });

                this.scope.newItemName = '';
            }
        }
    }
});

LSDom.Component.create('todo-app', {
    tmpl: `<div class="todoapp">
        <header>
            <h1>todos</h1>
            <add-todo todos="scope.todos" addItem="add"></add-todo>
        </header>
        <section class="main">
            <ul class="todo-list">
                <todo-item for="item in todosFiltered" todo="item" remove="remove"></todo-item>
            </ul>
        </section>
        <footer class="footer" style="display: block;">
            <span class="todo-count"><strong>{{activeTodos.length}}</strong> items left</span>
            <ul class="filters">
                <li>
                    <a classname="this.route.tab === 'all' ? 'selected' : ''" href="#/">All</a>
                </li>
                <li>
                    <a classname="this.route.tab === 'active' ? 'selected' : ''" href="#/active">Active</a>
                </li>
                <li>
                    <a classname="this.route.tab === 'completed' ? 'selected' : ''" href="#/completed">Completed</a>
                </li>
            </ul>
        </footer>
        </div>`,

    scope: () => {
        return {
            todos: [{name: 'a', done: true}, {name: 'b', done: false}]
        }
    },

    computed: {
        todosFiltered(){
            return this.scope.todos.filter(item => (this.route.tab === 'active' && item.done === false)
                || (this.route.tab === 'completed' && item.done === true) || !this.route.tab
            );
        },
        activeTodos(){
            return this.scope.todos.filter(item => item.done === true);
        }
    },

    remove(item){
        console.log('TodoApp: remove', item.name);
        let index = this.scope.todos.indexOf(item);
        this.scope.todos.splice(index, 1);
    },

    add(item){
        this.scope.todos.push(item);
    }
});

LSDom.Component.create('router', {
    scope: () => {
        return {
            map: {
                '/:tab?': 'todo-app'
            },
            route: {
                tab: null
            }
        }
    },
    mounted(){
        // when hashchange
        window.onhashchange = this.update.bind(this);
        this.update();

        // transform route to
        LSDom.Component.render('todo-app', this.$container, {
            route: this.scope.route
        });
    },

    update(){
        let params = this._match();
        if (params){
            Object.assign(this.scope.route, params);
        }
    },

    _match(){
        let params = {};
        let path = location.hash.slice(1);
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
                return true;
            } else {
                return null;
            }
        });

        return params;
    }
});

// init
LSDom.Component.render('router', document.getElementById('app'));
