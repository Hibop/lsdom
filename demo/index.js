// directive todo-item
Directive.create('todo-item', {
    tmpl: '<li>{todo.name}<button click="remove(todo)">x</button></li>',
    scope: {
        todo: '='
    }
});

// directive add-todo
Directive.create('add-todo', {
    tmpl: '<input type="text" model="newItemName"><button click="add()">add</button>',
    scope: {
        todos: '='
    }
});
// app
class appController extends Controller {
    constructor(props) {
        super(props);

        this.scope.todos = [];

        this.scope.add = this.add.bind(this);
        this.scope.remove = this.remove.bind(this);

        this.init();
    }

    add(){
        let item = {
            name: this.scope.newItemName
        };
        this.scope.newItemName = '';
        this.scope.todos.push(item);
    }

    remove(item){
        let index = this.scope.todos.indexOf(item);
        this.scope.todos.splice(index, 1);
    }
}

window.app = new appController();
