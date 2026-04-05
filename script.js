const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-button');

let tasks = [];
let currentFilter = 'all';

function loadTasks() {
  const stored = localStorage.getItem('minimalist-todo-tasks');
  tasks = stored ? JSON.parse(stored) : [];
}

function saveTasks() {
  localStorage.setItem('minimalist-todo-tasks', JSON.stringify(tasks));
}

function createTaskElement(task) {
  const listItem = document.createElement('li');
  listItem.className = `task-item ${task.completed ? 'completed' : ''}`;
  listItem.dataset.id = task.id;

  const checkbox = document.createElement('button');
  checkbox.className = 'action-button';
  checkbox.type = 'button';
  checkbox.innerHTML = task.completed ? '☑' : '☐';
  checkbox.setAttribute('aria-label', task.completed ? 'Mark incomplete' : 'Mark complete');
  checkbox.addEventListener('click', () => toggleComplete(task.id));

  const main = document.createElement('div');
  main.className = 'task-main';

  const header = document.createElement('div');
  header.className = 'task-header';

  const title = document.createElement('p');
  title.className = `task-title ${task.completed ? 'completed' : ''}`;
  title.textContent = task.text;
  title.tabIndex = 0;
  title.addEventListener('dblclick', () => activateEdit(task.id, title));
  title.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      activateEdit(task.id, title);
    }
  });

  const label = document.createElement('span');
  label.className = `label-pill label-${task.priority}`;
  label.textContent = task.priority;

  header.append(title, label);

  const details = document.createElement('div');
  details.className = 'task-details';
  details.textContent = task.completed ? 'Completed' : 'Pending';

  main.append(header, details);

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editButton = document.createElement('button');
  editButton.className = 'action-button';
  editButton.type = 'button';
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => activateEdit(task.id, title));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'action-button';
  deleteButton.type = 'button';
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => removeTask(task.id));

  actions.append(editButton, deleteButton);
  listItem.append(checkbox, main, actions);

  return listItem;
}

function renderTasks() {
  taskList.innerHTML = '';

  const visibleTasks = tasks
    .filter((task) => {
      if (currentFilter === 'completed') return task.completed;
      if (currentFilter === 'pending') return !task.completed;
      return true;
    })
    .sort((a, b) => Number(a.completed) - Number(b.completed));

  visibleTasks.forEach((task) => {
    const element = createTaskElement(task);
    element.classList.add('enter');
    taskList.appendChild(element);
    requestAnimationFrame(() => element.classList.remove('enter'));
  });
}

function addTask(text, priority) {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  tasks.push({
    id: Date.now().toString(),
    text: trimmedText,
    priority,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

function toggleComplete(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function removeTask(taskId) {
  const element = document.querySelector(`.task-item[data-id="${taskId}"]`);
  if (element) {
    element.classList.add('removed');
    element.addEventListener('transitionend', () => {
      tasks = tasks.filter((task) => task.id !== taskId);
      saveTasks();
      renderTasks();
    }, { once: true });
  } else {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
  }
}

function activateEdit(taskId, titleElement) {
  const task = tasks.find((item) => item.id === taskId);
  if (!task) return;

  const input = document.createElement('input');
  input.className = 'edit-input';
  input.type = 'text';
  input.value = task.text;
  input.setAttribute('aria-label', 'Edit task text');

  const finishEdit = () => {
    const newText = input.value.trim();
    if (newText) {
      task.text = newText;
      saveTasks();
      renderTasks();
    } else {
      input.focus();
    }
  };

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') finishEdit();
    if (event.key === 'Escape') renderTasks();
  });

  input.addEventListener('blur', finishEdit);

  titleElement.replaceWith(input);
  input.focus();
  input.select();
}

function updateFilter(newFilter) {
  currentFilter = newFilter;
  filterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === newFilter);
  });
  renderTasks();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(input.value, prioritySelect.value);
  input.value = '';
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => updateFilter(button.dataset.filter));
});

window.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  renderTasks();
});
