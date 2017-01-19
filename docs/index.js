// component todo-item
LSDom.Component.create('todo-item', {
    props: ['todo', 'remove'],
    tmpl:  `<li><div class="view">
        <input class="toggle" type="checkbox">
        <label>{props.todo.name}</label>
        <button class="destroy" click="(e) => props.remove(props.todo)"></button>
        </div></li>`
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
                    name: this.scope.newItemName
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
                <todo-item for="item in scope.todos" todo="item" remove="remove"></todo-item>
            </ul>
        </section>
        <footer class="footer" style="display: block;">
            <span class="todo-count"><strong>{{scope.todos.length}}</strong> items left</span>
            <ul class="filters">
                <li>
                    <a class="selected" href="#/">All</a>
                </li>
                <li>
                    <a href="#/active">Active</a>
                </li>
                <li>
                    <a href="#/completed">Completed</a>
                </li>
            </ul>
        </footer>
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
LSDom.Component.render('todo-app', document.getElementById('app'));
