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
        newItemName: '',
        add(){
            this.todos.push({
                name: this.newItemName
            });
            this.newItemName = '';
        }
    }
});
// app
class appController extends Controller {
    constructor(props) {
        super(props);
        this.scope.todos = [];
        this.scope.remove = this.remove.bind(this);
        this.init();
    }

    remove(item){
        let index = this.scope.todos.indexOf(item);
        this.scope.todos.splice(index, 1);
    }
}

window.app = new appController();
