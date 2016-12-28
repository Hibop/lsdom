// directive todo-item
Directive.create('todo-item', {
    tmpl: '<li>{todo.name}<button click="remove(todo)">x</button></li>',
    scopeConfig: {
        todo: '='
    }
});

// directive add-todo
Directive.create('add-todo', {
    tmpl: '<input type="text" model="newItemName"><button click="add(newIem)">add</button>',
    scopeConfig: {
        newItemName: '',
        addItem: '=',
        add() {
            this.addItem({
                name: this.newItemName
            });

            this.newItemName = '';
        }
    }
});


// directive todo app
Directive.create('todo-app', {
    tmpl: `<div>
            <h1>{'To' + 'DO'}: {todos.length}</h1>
            <ul>
                <li style="{display: todos.length > 0 ? 'none' : 'inherit'}">no item</li>
                <todo-item for="item in todos" todo="item"></todo-item>
            </ul>
            <p><add-todo todos="todos" addItem="addItem"></add-todo></p>
        </div>`,
    scope: {
        todos: [],
        remove: function(item){
            this.remove(item);
        },
        addItem: function(item){
            this.add(item);
        }
    },

    remove(item){
        let index = this.scope.todos.indexOf(item);
        this.scope.todos.splice(index, 1);
    },

    add(item){
        this.scope.todos.push(item);
    }
});


// init
Directive.render('todo-app', document.getElementById('app'));
