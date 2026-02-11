function renderSubjects() {
    const container = document.getElementById('subjectsContent');
    const subjects = getSubjects();

    if (subjects.length === 0) {
        container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <div class="text-6xl mb-4">📚</div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No subjects yet</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">Start by adding your first subject</p>
                <button class="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors" onclick="openSubjectModal()">Add Subject</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4" style="border-color: ${subject.color}">
            <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">${sanitizeHTML(subject.name)}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${sanitizeHTML(subject.professor || 'No professor assigned')}</p>
                </div>
                ${getPriorityBadge(subject.priority)}
            </div>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                ${sanitizeHTML(subject.description || 'No description')}
            </p>
            
            <div class="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b border-gray-200 dark:border-gray-700">
                <div class="text-center">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Credits</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">${subject.credits || 0}</p>
                </div>
                <div class="text-center border-l border-r border-gray-200 dark:border-gray-700">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasks</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">${completedTasks}/${totalTasks}</p>
                </div>
                <div class="text-center">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</p>
                    <p class="text-lg font-bold ${completionRate === 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}">${completionRate}%</p>
                </div>
            </div>
            
            <div class="flex gap-2">
                <button class="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2" onclick="editSubject('${subject.id}')">
                     Edit
                </button>
                <button class="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2" onclick="deleteSubjectConfirm('${subject.id}')">
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
        <form id="subjectForm" onsubmit="saveSubject(event, ${isEdit ? `'${subjectId}'` : 'null'})" class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject Name *</label>
                <input type="text" id="subjectName" 
                       value="${isEdit ? sanitizeHTML(subject.name) : ''}" 
                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                       required>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professor</label>
                <input type="text" id="subjectProfessor" 
                       value="${isEdit ? sanitizeHTML(subject.professor || '') : ''}" 
                       class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits *</label>
                    <input type="number" id="subjectCredits" min="1" max="10" 
                           value="${isEdit ? subject.credits : 3}" 
                           class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                           required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority *</label>
                    <select id="subjectPriority" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent" required>
                        <option value="high" ${isEdit && subject.priority === 'high' ? 'selected' : ''}>High</option>
                        <option value="medium" ${isEdit && subject.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="low" ${isEdit && subject.priority === 'low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color *</label>
                <div class="grid grid-cols-6 gap-2">
                    ${['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1', '#f97316', '#14b8a6', '#a855f7', '#84cc16']
            .map(color => `
                            <label class="cursor-pointer">
                                <input type="radio" name="subjectColor" value="${color}" 
                                       ${isEdit && subject.color === color ? 'checked' : (!isEdit && color === '#3b82f6' ? 'checked' : '')}
                                       class="sr-only peer">
                                <div class="w-full h-10 rounded-md border-2 border-gray-300 dark:border-gray-600 peer-checked:border-black dark:peer-checked:border-white peer-checked:ring-2 peer-checked:ring-black dark:peer-checked:ring-white transition-all" style="background-color: ${color}"></div>
                            </label>
                        `).join('')}
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea id="subjectDescription" rows="3" 
                          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent">${isEdit ? sanitizeHTML(subject.description || '') : ''}</textarea>
            </div>
            
            <div class="flex gap-3 pt-4">
                <button type="button" class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" onclick="closeModal()">Cancel</button>
                <button type="submit" class="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">${isEdit ? 'Save Changes' : 'Add Subject'}</button>
            </div>
        </form>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function saveSubject(event, subjectId) {
    event.preventDefault();

    const data = {
        name: document.getElementById('subjectName').value.trim(),
        professor: document.getElementById('subjectProfessor').value.trim(),
        credits: parseInt(document.getElementById('subjectCredits').value),
        priority: document.getElementById('subjectPriority').value,
        color: document.querySelector('input[name="subjectColor"]:checked').value,
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
    const tasks = getTasks().filter(t => t.subjectId === subjectId);
    const schedules = getSchedules().filter(s => s.subjectId === subjectId);

    let message = 'Are you sure you want to delete this subject?';
    if (tasks.length > 0 || schedules.length > 0) {
        message += `\n\nThis will also delete:\n- ${tasks.length} task(s)\n- ${schedules.length} schedule(s)`;
    }

    if (confirm(message)) {
        deleteSubject(subjectId);
        showToast('Subject deleted successfully!');
        renderSubjects();

        if (document.getElementById('dashboardSection').classList.contains('active')) {
            renderDashboard();
        }
        if (document.getElementById('tasksSection').classList.contains('active')) {
            renderTasks();
        }
        if (document.getElementById('scheduleSection').classList.contains('active')) {
            renderSchedule();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('addSubjectBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => openSubjectModal());
    }
});
