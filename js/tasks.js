// Track current filter (all, pending, completed, overdue)
let taskFilter = 'all';

// Main function to display tasks
function renderTasks() {
    const container = document.getElementById('tasksContent');
    let tasks = getTasks();
    const subjects = getSubjects();

    // Filter tasks based on selected filter
    tasks = filterTasks(tasks);

    // Sort by deadline (earliest first)
    tasks = sortByDate(tasks, 'deadline', true);

    // Build the HTML with Tailwind classes
    container.innerHTML = createFilterButtons() + createTasksList(tasks);
}

// Create filter buttons HTML
function createFilterButtons() {
    const btnClass = (active) => active
        ? 'px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium transition-colors'
        : 'px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors';

    return `
        <div class="flex flex-wrap gap-2 mb-8">
            <button class="${btnClass(taskFilter === 'all')}" onclick="setTaskFilter('all')">
                All Tasks
            </button>
            <button class="${btnClass(taskFilter === 'pending')}" onclick="setTaskFilter('pending')">
                Pending
            </button>
            <button class="${btnClass(taskFilter === 'completed')}" onclick="setTaskFilter('completed')">
                Completed
            </button>
            <button class="${btnClass(taskFilter === 'overdue')}" onclick="setTaskFilter('overdue')">
                Overdue
            </button>
        </div>
    `;
}

// Filter tasks based on current filter
function filterTasks(tasks) {
    if (taskFilter === 'pending') {
        return tasks.filter(t => !t.completed);
    } else if (taskFilter === 'completed') {
        return tasks.filter(t => t.completed);
    } else if (taskFilter === 'overdue') {
        return tasks.filter(t => !t.completed && isOverdue(t.deadline));
    }
    return tasks; // 'all'
}

// Create tasks list HTML
function createTasksList(tasks) {
    if (tasks.length === 0) {
        return createEmptyState();
    }

    const taskCards = tasks.map(task => createTaskCard(task)).join('');
    return `<div class="space-y-4">${taskCards}</div>`;
}

// Create empty state HTML
function createEmptyState() {
    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">Add your first task to get started</p>
            <button class="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors" onclick="openTaskModal()">Add Task</button>
        </div>
    `;
}

// Create a single task card HTML
function createTaskCard(task) {
    const subject = getSubjectById(task.subjectId);
    if (!subject) return '';

    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline) && !task.completed;
    const urgent = daysUntil <= 2 && !task.completed;
    const borderColor = overdue ? '#ef4444' : subject.color;
    const opacityClass = task.completed ? 'opacity-60' : '';

    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${opacityClass}" style="border-color: ${borderColor}">
            <div class="flex gap-4">
                ${createCheckbox(task)}
                ${createTaskContent(task, subject, overdue, urgent, daysUntil)}
            </div>
        </div>
    `;
}

// Create checkbox HTML
function createCheckbox(task) {
    return `
        <label class="cursor-pointer flex items-start pt-1">
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask('${task.id}')" 
                   class="w-5 h-5 text-black bg-gray-100 border-gray-300 rounded focus:ring-black dark:focus:ring-white dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600">
        </label>
    `;
}

// Create task content HTML
function createTaskContent(task, subject, overdue, urgent, daysUntil) {
    return `
        <div class="flex-1">
            ${createTaskHeader(task)}
            ${createTaskSubject(subject)}
            ${task.description ? createTaskDescription(task.description) : ''}
            ${createTaskFooter(task, subject, overdue, urgent, daysUntil)}
        </div>
    `;
}

// Create task header (title and badges)
function createTaskHeader(task) {
    const titleClass = task.completed
        ? 'text-xl font-bold text-gray-900 dark:text-white line-through'
        : 'text-xl font-bold text-gray-900 dark:text-white';
    const typeEmoji = task.type === 'exam' ? '📝' : '📄';
    const typeText = task.type === 'exam' ? 'Exam' : 'Assignment';
    const typeBadgeClass = task.type === 'exam'
        ? 'px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
        : 'px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

    return `
        <div class="flex items-start justify-between mb-2">
            <h3 class="${titleClass}">${sanitizeHTML(task.title)}</h3>
            <div class="flex gap-2 ml-4">
                ${getPriorityBadge(task.priority)}
                <span class="${typeBadgeClass}">
                    ${typeEmoji} ${typeText}
                </span>
            </div>
        </div>
    `;
}

// Create task subject line
function createTaskSubject(subject) {
    return `
        <p class="text-sm mb-2">
            <span class="font-medium" style="color: ${subject.color};">
                ${sanitizeHTML(subject.name)}
            </span>
        </p>
    `;
}

// Create task description
function createTaskDescription(description) {
    return `<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${sanitizeHTML(description)}</p>`;
}

// Create task footer (deadline and buttons)
function createTaskFooter(task, subject, overdue, urgent, daysUntil) {
    return `
        <div class="flex items-center justify-between mt-4">
            ${createDeadlineDisplay(task.deadline, overdue, urgent, daysUntil)}
            ${createTaskButtons(task.id)}
        </div>
    `;
}

// Create deadline display
function createDeadlineDisplay(deadline, overdue, urgent, daysUntil) {
    const textClass = overdue
        ? 'text-red-600 dark:text-red-400 font-medium'
        : urgent
            ? 'text-amber-600 dark:text-amber-400 font-medium'
            : 'text-gray-600 dark:text-gray-400';
    const overdueText = overdue ? '⚠️ Overdue: ' : '';
    const daysText = getDaysText(daysUntil);

    return `
        <div class="flex items-center gap-2">
            <span class="text-lg">📅</span>
            <span class="text-sm ${textClass}">
                ${overdueText}${formatDate(deadline)} ${daysText}
            </span>
        </div>
    `;
}

// Get days text (Today, Tomorrow, X days)
function getDaysText(daysUntil) {
    if (daysUntil === 0) return '(Today)';
    if (daysUntil === 1) return '(Tomorrow)';
    if (daysUntil > 0) return `(${daysUntil} days)`;
    return '';
}

// Create task action buttons
function createTaskButtons(taskId) {
    return `
        <div class="flex gap-2">
            <button class="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onclick="editTask('${taskId}')">
                ✏️ Edit
            </button>
            <button class="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" onclick="deleteTaskConfirm('${taskId}')">
                🗑️ Delete
            </button>
        </div>
    `;
}

// Set task filter and refresh
function setTaskFilter(filter) {
    taskFilter = filter;
    renderTasks();
}

// Toggle task completion
function toggleTask(taskId) {
    toggleTaskComplete(taskId);
    renderTasks();

    // Update other sections if visible
    if (document.getElementById('dashboardSection').classList.contains('active')) {
        renderDashboard();
    }
    if (document.getElementById('analyticsSection').classList.contains('active')) {
        renderAnalytics();
    }
}

// Open modal to add or edit task
function openTaskModal(taskId = null) {
    const task = taskId ? getTasks().find(t => t.id === taskId) : null;
    const isEdit = !!task;
    const subjects = getSubjects();

    // Check if subjects exist
    if (subjects.length === 0) {
        showToast('Please add subjects first!', 'error');
        return;
    }

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? 'Edit Task' : 'Add New Task';

    // Set default deadline to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    modalBody.innerHTML = createTaskForm(task, subjects, isEdit, taskId, tomorrow);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// Create task form HTML
function createTaskForm(task, subjects, isEdit, taskId, tomorrow) {
    return `
        <form id="taskForm" onsubmit="saveTask(event, ${isEdit ? `'${taskId}'` : 'null'})" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Title *</label>
                <input type="text" id="taskTitle" 
                       value="${isEdit ? sanitizeHTML(task.title) : ''}" 
                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                       required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject *</label>
                <select id="taskSubject" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent" required>
                    <option value="">Select a subject</option>
                    ${createSubjectOptions(subjects, task, isEdit)}
                </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                    <select id="taskType" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent" required>
                        <option value="assignment" ${isEdit && task.type === 'assignment' ? 'selected' : ''}>Assignment</option>
                        <option value="exam" ${isEdit && task.type === 'exam' ? 'selected' : ''}>Exam</option>
                    </select>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority *</label>
                    <select id="taskPriority" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent" required>
                        <option value="high" ${isEdit && task.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="medium" ${isEdit && task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="low" ${isEdit && task.priority === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline *</label>
                <input type="date" id="taskDeadline" 
                       value="${isEdit ? formatDateInput(task.deadline) : formatDateInput(tomorrow)}" 
                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                       required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea id="taskDescription" rows="3" 
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent">${isEdit ? sanitizeHTML(task.description || '') : ''}</textarea>
            </div>
            
            <div class="flex gap-3 pt-4">
                <button type="button" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onclick="closeModal()">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">${isEdit ? 'Save Changes' : 'Add Task'}</button>
            </div>
        </form>
    `;
}

// Create subject options for dropdown
function createSubjectOptions(subjects, task, isEdit) {
    return subjects.map(s => `
        <option value="${s.id}" ${isEdit && task.subjectId === s.id ? 'selected' : ''}>
            ${sanitizeHTML(s.name)}
        </option>
    `).join('');
}

// Save task (add or update)
function saveTask(event, taskId) {
    event.preventDefault();

    const data = {
        title: document.getElementById('taskTitle').value.trim(),
        subjectId: document.getElementById('taskSubject').value,
        type: document.getElementById('taskType').value,
        priority: document.getElementById('taskPriority').value,
        deadline: new Date(document.getElementById('taskDeadline').value).toISOString(),
        description: document.getElementById('taskDescription').value.trim()
    };

    if (taskId) {
        updateTask(taskId, data);
        showToast('Task updated successfully!');
    } else {
        addTask(data);
        showToast('Task added successfully!');
    }

    closeModal();
    renderTasks();

    // Update dashboard if visible
    if (document.getElementById('dashboardSection').classList.contains('active')) {
        renderDashboard();
    }
}

// Edit task
function editTask(taskId) {
    openTaskModal(taskId);
}

// Delete task with confirmation
function deleteTaskConfirm(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId);
        showToast('Task deleted successfully!');
        renderTasks();

        // Update dashboard if visible
        if (document.getElementById('dashboardSection').classList.contains('active')) {
            renderDashboard();
        }
    }
}

// Setup event listeners when page loads
document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openTaskModal());
    }
});
