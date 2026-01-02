let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let draggedTaskId = null;

// LOGIN
if (localStorage.getItem("user")) showApp();

function login() {
  if (!username.value) return alert("Enter username");
  localStorage.setItem("user", username.value);
  showApp();
}

function logout() {
  localStorage.clear();
  location.reload();
}

function showApp() {
  loginBox.classList.add("hidden");
  app.classList.remove("hidden");
  userDisplay.innerText = "Hi, " + localStorage.getItem("user");
  displayTasks();
}

// DARK MODE
if (localStorage.getItem("dark") === "on") document.body.classList.add("dark");
function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "dark",
    document.body.classList.contains("dark") ? "on" : "off"
  );
}

// TOAST
function showToast(msg) {
  toast.innerText = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

// ADD TASK
function addTask() {
  if (!title.value || !assignee.value || !dueDate.value || !priority.value) {
    showToast("Fill all fields");
    return;
  }

  tasks.push({
    id: Date.now(),
    title: title.value,
    assignee: assignee.value,
    dueDate: dueDate.value,
    priority: priority.value,
    status: "Pending",
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
  clearForm();
  displayTasks();
  showToast("Task added");
}

function clearForm() {
  title.value = "";
  assignee.value = "";
  dueDate.value = "";
  priority.value = "";
  title.focus();
}

// UPDATE / DELETE
function updateStatus(id, status) {
  tasks.find((t) => t.id === id).status = status;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
  showToast("Task deleted");
}

// DRAG & DROP
function dragStart(id) {
  draggedTaskId = id;
}
function dropTask(id) {
  tasks.find((t) => t.id === draggedTaskId).status = tasks.find(
    (t) => t.id === id
  ).status;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  displayTasks();
}

// DISPLAY
function displayTasks() {
  taskList.innerHTML = "";
  const searchText = search.value.toLowerCase();
  const filter = statusFilter.value;

  const filteredTasks = tasks.filter(
    (t) =>
      (t.title.toLowerCase().includes(searchText) ||
        t.assignee.toLowerCase().includes(searchText)) &&
      (filter === "All" || t.status === filter)
  );

  // ANALYTICS
  totalTasks.innerText = tasks.length;
  completedTasks.innerText = tasks.filter(
    (t) => t.status === "Completed"
  ).length;
  pendingTasks.innerText = tasks.filter((t) => t.status !== "Completed").length;
  highPriorityTasks.innerText = tasks.filter(
    (t) => t.priority === "High"
  ).length;

  progressBar.style.width = tasks.length
    ? (completedTasks.innerText / tasks.length) * 100 + "%"
    : "0%";

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <tr>
        <td colspan="6" style="padding:40px;text-align:center;opacity:0.7">
          🚀 No tasks yet. Add your first task above!
        </td>
      </tr>`;
    return;
  }

  filteredTasks.forEach((task) => {
    const isOverdue =
      new Date(task.dueDate) < new Date() && task.status !== "Completed";

    taskList.innerHTML += `
      <tr class="${isOverdue ? "overdue" : ""}"
          draggable="true"
          ondragstart="dragStart(${task.id})"
          ondragover="event.preventDefault()"
          ondrop="dropTask(${task.id})">
        <td data-label="Task">${task.title}</td>
        <td data-label="Assigned">${task.assignee}</td>
        <td data-label="Due">${task.dueDate}</td>
        <td data-label="Priority">
          <span class="priority ${task.priority}">${task.priority}</span>
        </td>
        <td data-label="Status">
          <select onchange="updateStatus(${task.id}, this.value)">
            <option ${
              task.status === "Pending" ? "selected" : ""
            }>Pending</option>
            <option ${
              task.status === "In Progress" ? "selected" : ""
            }>In Progress</option>
            <option ${
              task.status === "Completed" ? "selected" : ""
            }>Completed</option>
          </select>
        </td>
        <td data-label="Action">
          <button onclick="deleteTask(${task.id})">Delete</button>
        </td>
      </tr>`;
  });
}

// ENTER KEY SUPPORT
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.activeElement.tagName === "INPUT") {
    addTask();
  }
});
