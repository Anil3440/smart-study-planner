let taskFilter = 'all';

function renderTasks() {
    const container = document.getElementById('tasksContent');
    let tasks = getTasks();
    const subjects = getSubjects();

    if (taskFilter === 'pending') {
        tasks = tasks.filter(t => !t.completed);
    } else if (taskFilter === 'completed') {
        tasks = tasks.filter(t => t.completed);
    } else if (taskFilter === 'overdue') {
        tasks = tasks.filter(t => !t.completed && isOverdue(t.deadline));
    }

    tasks = sortByDate(tasks, 'deadline', true);

    container.innerHTML = `
        <div class="btn-actions mb-xl" style="flex-wrap: wrap;">
            <button class="btn btn-secondary ${taskFilter === 'all' ? 'active' : ''}" onclick="setTaskFilter('all')">
                All Tasks
            </button>
            <button class="btn btn-secondary ${taskFilter === 'pending' ? 'active' : ''}" onclick="setTaskFilter('pending')">
                Pending
            </button>
            <button class="btn btn-secondary ${taskFilter === 'completed' ? 'active' : ''}" onclick="setTaskFilter('completed')">
                Completed
            </button>
            <button class="btn btn-secondary ${taskFilter === 'overdue' ? 'active' : ''}" onclick="setTaskFilter('overdue')">
                Overdue
            </button>
        </div>
        
        ${tasks.length === 0 ? `
            <div class="card empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3 class="empty-state-title">No tasks found</h3>
                <p class="empty-state-text">Add your first task to get started</p>
                <button class="btn btn-primary" onclick="openTaskModal()">Add Task</button>
            </div>
        ` : `
            <div class="flex-col-gap">
                ${tasks.map(task => renderTaskCard(task)).join('')}
            </div>
        `}
    `;
}

function renderTaskCard(task) {
    const subject = getSubjectById(task.subjectId);
    if (!subject) return '';

    const daysUntil = getDaysUntil(task.deadline);
    const overdue = isOverdue(task.deadline) && !task.completed;
    const urgent = daysUntil <= 2 && !task.completed;

    return `
        <div class="card ${task.completed ? 'opacity-70' : ''}" style="border-left: 4px solid ${overdue ? 'var(--danger)' : subject.color}">
            <div class="task-card">
                <label style="cursor: pointer; display: flex; align-items: center;">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')" class="task-checkbox">
                </label>
                
                <div class="task-content">
                    <div class="task-header">
                        <h3 class="task-title ${task.completed ? 'task-title-completed' : ''}">${sanitizeHTML(task.title)}</h3>
                        <div class="task-badges">
                            ${getPriorityBadge(task.priority)}
                            <span class="badge ${task.type === 'exam' ? 'badge-type-exam' : 'badge-type-assignment'}">
                                ${task.type === 'exam' ? '📝 Exam' : '📄 Assignment'}
                            </span>
                        </div>
                    </div>
                    
                    <p class="task-subject">
                        <span style="font-weight: 500; color: ${subject.color};">${sanitizeHTML(subject.name)}</span>
                    </p>
                    
                    ${task.description ? `
                        <p class="task-description">
                            ${sanitizeHTML(task.description)}
                        </p>
                    ` : ''}
                    
                    <div class="task-footer">
                        <div class="task-deadline">
                            <svg class="task-deadline-icon ${overdue ? 'text-overdue' : urgent ? 'text-urgent' : ''}" viewBox="0 0 24 24" fill="none" style="color: ${overdue ? 'var(--danger)' : urgent ? 'var(--warning)' : 'var(--text-tertiary)'};">
                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                                <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            <span class="task-deadline-text ${overdue ? 'text-overdue' : urgent ? 'text-urgent' : ''}">
                                ${overdue ? '⚠️ Overdue: ' : ''}${formatDate(task.deadline)}
                                ${daysUntil === 0 ? ' (Today)' : daysUntil === 1 ? ' (Tomorrow)' : daysUntil > 0 ? ` (${daysUntil} days)` : ''}
                            </span>
                        </div>
                        
                        <div class="btn-actions">
                            <button class="btn btn-secondary btn-icon-sm" onclick="editTask('${task.id}')">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                                    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Edit
                            </button>
                            <button class="btn btn-secondary btn-icon-sm btn-danger-text" onclick="deleteTaskConfirm('${task.id}')">
                                <svg viewBox="0 0 24 24" fill="none">
                                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setTaskFilter(filter) {
    taskFilter = filter;
    renderTasks();
}

function toggleTask(taskId) {
    toggleTaskComplete(taskId);
    renderTasks();

    if (document.getElementById('dashboardSection').classList.contains('active')) {
        renderDashboard();
    }
    if (document.getElementById('analyticsSection').classList.contains('active')) {
        renderAnalytics();
    }
}

function openTaskModal(taskId = null) {
    const task = taskId ? getTasks().find(t => t.id === taskId) : null;
    const isEdit = !!task;
    const subjects = getSubjects();

    if (subjects.length === 0) {
        showToast('Please add subjects first!', 'error');
        return;
    }

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? 'Edit Task' : 'Add New Task';

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    modalBody.innerHTML = `
        <form id="taskForm" onsubmit="saveTask(event, ${isEdit ? `'${taskId}'` : 'null'})">
            <div class="form-group">
                <label class="form-label">Task Title *</label>
                <input type="text" class="form-input" id="taskTitle" value="${isEdit ? sanitizeHTML(task.title) : ''}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Subject *</label>
                <select class="form-select" id="taskSubject" required>
                    <option value="">Select a subject</option>
                    ${subjects.map(s => `
                        <option value="${s.id}" ${isEdit && task.subjectId === s.id ? 'selected' : ''}>
                            ${sanitizeHTML(s.name)}
                        </option>
                    `).join('')}
                </select>
            </div>
            
            <div class="form-grid-2">
                <div class="form-group">
                    <label class="form-label">Type *</label>
                    <select class="form-select" id="taskType" required>
                        <option value="assignment" ${isEdit && task.type === 'assignment' ? 'selected' : ''}>Assignment</option>
                        <option value="exam" ${isEdit && task.type === 'exam' ? 'selected' : ''}>Exam</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Priority *</label>
                    <select class="form-select" id="taskPriority" required>
                        <option value="high" ${isEdit && task.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="medium" ${isEdit && task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="low" ${isEdit && task.priority === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Deadline *</label>
                <input type="date" class="form-input" id="taskDeadline" value="${isEdit ? formatDateInput(task.deadline) : formatDateInput(tomorrow)}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="taskDescription">${isEdit ? sanitizeHTML(task.description || '') : ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Task'}</button>
            </div>
        </form>
    `;

    modal.classList.add('active');
}

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

    if (document.getElementById('dashboardSection').classList.contains('active')) {
        renderDashboard();
    }
}

function editTask(taskId) {
    openTaskModal(taskId);
}

function deleteTaskConfirm(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId);
        showToast('Task deleted successfully!');
        renderTasks();

        if (document.getElementById('dashboardSection').classList.contains('active')) {
            renderDashboard();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addTaskBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openTaskModal());
    }
});
