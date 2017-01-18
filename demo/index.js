// component todo-item
Component.create('todo-item', {
    props: ['todo', 'remove'],
    tmpl:  `<li><div class="view">
        <input class="toggle" type="checkbox">
        <label>{props.todo.name}</label>
        <button class="destroy" click="(e) => props.remove(props.todo)"></button>
        </div></li>`
});

Component.create('add-todo', {
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
            this.props.addItem({
                name: this.scope.newItemName
            });

            this.scope.newItemName = '';
        }
    }
});

Component.create('todo-app', {
    tmpl: `<div class="todoapp">
            <h1>todos</h1>
            <ul class="todo-list">
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
