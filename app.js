(() => {
  const STORAGE_KEY = "todos";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const footer = document.getElementById("todo-footer");
  const countEl = document.getElementById("todo-count");
  const clearBtn = document.getElementById("clear-completed");
  const filterBtns = document.querySelectorAll(".filter-btn");

  let todos = loadTodos();
  let currentFilter = "all";

  // --- Storage ---
  function loadTodos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  // --- Rendering ---
  function render() {
    const filtered = todos.filter((todo) => {
      if (currentFilter === "active") return !todo.completed;
      if (currentFilter === "completed") return todo.completed;
      return true;
    });

    list.innerHTML = "";

    if (todos.length === 0) {
      list.innerHTML = '<li class="empty-message">タスクがありません</li>';
      footer.classList.add("hidden");
      return;
    }

    if (filtered.length === 0) {
      const msg =
        currentFilter === "active"
          ? "未完了のタスクはありません"
          : "完了済みのタスクはありません";
      list.innerHTML = `<li class="empty-message">${msg}</li>`;
    }

    filtered.forEach((todo) => {
      list.appendChild(createTodoElement(todo));
    });

    const activeCount = todos.filter((t) => !t.completed).length;
    countEl.textContent = `残り ${activeCount} 件`;

    const hasCompleted = todos.some((t) => t.completed);
    clearBtn.style.display = hasCompleted ? "" : "none";
    footer.classList.remove("hidden");
  }

  function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;
    span.addEventListener("dblclick", () => startEdit(li, todo));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "todo-delete";
    deleteBtn.textContent = "\u00d7";
    deleteBtn.title = "削除";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, span, deleteBtn);
    return li;
  }

  // --- Actions ---
  function addTodo(text) {
    todos.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      completed: false,
    });
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }

  function startEdit(li, todo) {
    if (li.querySelector(".todo-edit-input")) return;

    const span = li.querySelector(".todo-text");
    span.style.display = "none";

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "todo-edit-input";
    editInput.value = todo.text;

    function finishEdit() {
      const newText = editInput.value.trim();
      if (newText && newText !== todo.text) {
        todo.text = newText;
        saveTodos();
      }
      render();
    }

    editInput.addEventListener("blur", finishEdit);
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") editInput.blur();
      if (e.key === "Escape") {
        editInput.value = todo.text;
        editInput.blur();
      }
    });

    li.insertBefore(editInput, li.querySelector(".todo-delete"));
    editInput.focus();
    editInput.select();
  }

  // --- Event listeners ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      addTodo(text);
      input.value = "";
      input.focus();
    }
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearBtn.addEventListener("click", () => {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  });

  // --- Init ---
  render();
})();
