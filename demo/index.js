// component todo-item
Component.create('todo-item', {
    props: ['todo', 'remove'],
    tmpl: '<li>{props.todo.name}<button click="props.remove(props.todo)">x</button></li>'
});

Component.create('add-todo', {
    props: ['addItem'],
    tmpl: `<input type="text" model="scope.newItemName"><button click="add()">add</button>`,
    scope: () => {
        return {
            newItemName: ''
        }
    },
    add(){
        this.props.addItem({
            name: this.scope.newItemName
        });

        this.scope.newItemName = '';
    }
});

Component.create('todo-app', {
    tmpl: `<div>
            <h1>{'To' + 'DO'}: {scope.todos.length}</h1>
            <ul>
                <li style="{display: scope.todos.length > 0 ? 'none' : 'inherit'}">no item</li>
                <todo-item for="item in scope.todos" todo="item" remove="remove"></todo-item>
            </ul>
            <p><add-todo todos="scope.todos" addItem="add"></add-todo></p>
        </div>`,

    scope: () => {
        return {
            todos: [{name: 'a'}]
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

// init
Component.render('todo-app', document.getElementById('app'));
