function renderSubjects() {
    const container = document.getElementById('subjectsContent');
    const subjects = getSubjects();

    if (subjects.length === 0) {
        container.innerHTML = `
            <div class="card empty-state">
                <svg class="empty-state-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/>
                    <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3 class="empty-state-title">No subjects yet</h3>
                <p class="empty-state-text">Start by adding your first subject</p>
                <button class="btn btn-primary" onclick="openSubjectModal()">Add Subject</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="grid-auto-fill">
            ${subjects.map(subject => renderSubjectCard(subject)).join('')}
        </div>
    `;
}

function renderSubjectCard(subject) {
    const tasks = getTasks().filter(t => t.subjectId === subject.id);
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return `
        <div class="card card-colored-border" style="color: ${subject.color}">
            <div class="subject-header">
                <div class="subject-info">
                    <h3 class="subject-name">${sanitizeHTML(subject.name)}</h3>
                    <p class="subject-professor">${sanitizeHTML(subject.professor || 'No professor assigned')}</p>
                </div>
                ${getPriorityBadge(subject.priority)}
            </div>
            
            <p class="subject-description">
                ${sanitizeHTML(subject.description || 'No description')}
            </p>
            
            <div class="card-stats mb-lg">
                <div class="stats-item">
                    <p class="stats-label">Credits</p>
                    <p class="stats-value">${subject.credits || 0}</p>
                </div>
                <div class="stats-divider"></div>
                <div class="stats-item">
                    <p class="stats-label">Tasks</p>
                    <p class="stats-value">${completedTasks}/${totalTasks}</p>
                </div>
                <div class="stats-divider"></div>
                <div class="stats-item">
                    <p class="stats-label">Progress</p>
                    <p class="stats-value" style="color: ${completionRate === 100 ? 'var(--success)' : 'var(--primary)'}">${completionRate}%</p>
                </div>
            </div>
            
            <div class="btn-actions">
                <button class="btn btn-secondary btn-flex-1" onclick="editSubject('${subject.id}')">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Edit
                </button>
                <button class="btn btn-secondary btn-danger-text" onclick="deleteSubjectConfirm('${subject.id}')">
                    <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `;
}

function openSubjectModal(subjectId = null) {
    const subject = subjectId ? getSubjectById(subjectId) : null;
    const isEdit = !!subject;

    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? 'Edit Subject' : 'Add New Subject';

    modalBody.innerHTML = `
        <form id="subjectForm" onsubmit="saveSubject(event, ${isEdit ? `'${subjectId}'` : 'null'})">
            <div class="form-group">
                <label class="form-label">Subject Name *</label>
                <input type="text" class="form-input" id="subjectName" value="${isEdit ? sanitizeHTML(subject.name) : ''}" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Professor</label>
                <input type="text" class="form-input" id="subjectProfessor" value="${isEdit ? sanitizeHTML(subject.professor || '') : ''}">
            </div>
            
            <div class="form-grid-2">
                <div class="form-group">
                    <label class="form-label">Priority *</label>
                    <select class="form-select" id="subjectPriority" required>
                        <option value="high" ${isEdit && subject.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="medium" ${isEdit && subject.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="low" ${isEdit && subject.priority === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Credits</label>
                    <input type="number" class="form-input" id="subjectCredits" min="0" max="10" value="${isEdit ? subject.credits || 0 : 3}">
                </div>
            </div>
            
            <div class="form-group">
                <label class="form-label">Color</label>
                <input type="color" class="form-input" id="subjectColor" value="${isEdit ? subject.color : '#8b5cf6'}" style="height: 50px;">
            </div>
            
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-textarea" id="subjectDescription">${isEdit ? sanitizeHTML(subject.description || '') : ''}</textarea>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Subject'}</button>
            </div>
        </form>
    `;

    modal.classList.add('active');
}

function saveSubject(event, subjectId) {
    event.preventDefault();

    const data = {
        name: document.getElementById('subjectName').value.trim(),
        professor: document.getElementById('subjectProfessor').value.trim(),
        priority: document.getElementById('subjectPriority').value,
        credits: parseInt(document.getElementById('subjectCredits').value) || 0,
        color: document.getElementById('subjectColor').value,
        description: document.getElementById('subjectDescription').value.trim()
    };

    if (subjectId) {
        updateSubject(subjectId, data);
        showToast('Subject updated successfully!');
    } else {
        addSubject(data);
        showToast('Subject added successfully!');
    }

    closeModal();
    renderSubjects();

    if (document.getElementById('dashboardSection').classList.contains('active')) {
        renderDashboard();
    }
}

function editSubject(subjectId) {
    openSubjectModal(subjectId);
}

function deleteSubjectConfirm(subjectId) {
    const subject = getSubjectById(subjectId);
    if (!subject) return;

    if (confirm(`Are you sure you want to delete "${subject.name}"? This will also delete all related schedules and tasks.`)) {
        deleteSubject(subjectId);
        showToast('Subject deleted successfully!');
        renderSubjects();

        if (document.getElementById('dashboardSection').classList.contains('active')) {
            renderDashboard();
        }
        if (document.getElementById('scheduleSection').classList.contains('active')) {
            renderSchedule();
        }
        if (document.getElementById('tasksSection').classList.contains('active')) {
            renderTasks();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addSubjectBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openSubjectModal());
    }
});
