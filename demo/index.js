// directive todo-item
Directive.create('todo-item', {
    tmpl: '<li>{item.name}<button click="remove(item)">x</button></li>'
});

// directive add-todo
Directive.create('add-todo', {
    tmpl: '<input type="text" model="newItemName"><button click="add()">add</button>'
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
