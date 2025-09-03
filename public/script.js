class TodoApp {
    constructor() {
        this.todos = [];
        this.init();
    }

    init() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.totalTodos = document.getElementById('totalTodos');
        this.completedTodos = document.getElementById('completedTodos');

        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.loadTodos();
    }

    async loadTodos() {
        try {
            const response = await fetch('/api/todos');
            this.todos = await response.json();
            this.renderTodos();
        } catch (error) {
            console.error('Error loading todos:', error);
        }
    }

    async addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const newTodo = await response.json();
            this.todos.unshift(newTodo);
            this.todoInput.value = '';
            this.renderTodos();
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    }

    async toggleTodo(id, completed) {
        try {
            await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
            const todo = this.todos.find(t => t.id === id);
            if (todo) todo.completed = completed;
            this.renderTodos();
        } catch (error) {
            console.error('Error updating todo:', error);
        }
    }

    async deleteTodo(id) {
        try {
            await fetch(`/api/todos/${id}`, { method: 'DELETE' });
            this.todos = this.todos.filter(t => t.id !== id);
            this.renderTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }

    renderTodos() {
        this.todoList.innerHTML = '';
        
        if (this.todos.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            this.todos.forEach(todo => this.renderTodoItem(todo));
        }
        
        this.updateStats();
    }

    renderTodoItem(todo) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" 
                 onclick="app.toggleTodo(${todo.id}, ${!todo.completed})"></div>
            <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <button class="delete-btn" onclick="app.deleteTodo(${todo.id})">×</button>
        `;
        this.todoList.appendChild(li);
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        this.totalTodos.textContent = `${total} task${total !== 1 ? 's' : ''}`;
        this.completedTodos.textContent = `${completed} completed`;
    }
}

const app = new TodoApp();