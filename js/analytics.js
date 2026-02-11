function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    const subjects = getSubjects();
    const tasks = getTasks();

    if (subjects.length === 0 || tasks.length === 0) {
        container.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <div class="text-6xl mb-4">📊</div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No data available</h3>
                <p class="text-gray-600 dark:text-gray-400">Add subjects and tasks to see analytics</p>
            </div>
        `;
        return;
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = Math.round((completedTasks / totalTasks) * 100);
    const overdueTasks = tasks.filter(t => !t.completed && isOverdue(t.deadline)).length;

    const tasksBySubject = groupBy(tasks, 'subjectId');

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg shadow-md p-6 border-l-4 border-green-500">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <h2 class="text-4xl font-bold text-green-600 dark:text-green-400">${completedTasks}</h2>
            </div>
            
            <div class="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg shadow-md p-6 border-l-4 border-amber-500">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <h2 class="text-4xl font-bold text-amber-600 dark:text-amber-400">${pendingTasks}</h2>
            </div>
            
            <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
                <h2 class="text-4xl font-bold text-red-600 dark:text-red-400">${overdueTasks}</h2>
            </div>
            
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                <h2 class="text-4xl font-bold text-blue-600 dark:text-blue-400">${completionRate}%</h2>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Task Distribution</h3>
                <canvas id="taskDistributionChart"></canvas>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Completion by Subject</h3>
                <canvas id="completionChart"></canvas>
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Subject Performance</h3>
            <div class="space-y-4">
                ${renderSubjectPerformance(subjects, tasksBySubject)}
            </div>
        </div>
    `;

    setTimeout(() => {
        renderTaskDistributionChart(completedTasks, pendingTasks, overdueTasks);
        renderCompletionChart(subjects, tasksBySubject);
    }, 100);
}

function renderSubjectPerformance(subjects, tasksBySubject) {
    return subjects.map(subject => {
        const subjectTasks = tasksBySubject[subject.id] || [];
        const completed = subjectTasks.filter(t => t.completed).length;
        const total = subjectTasks.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return `
            <div class="border-l-4 pl-4" style="border-color: ${subject.color}">
                <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-gray-900 dark:text-white">${sanitizeHTML(subject.name)}</h4>
                    <span class="text-sm font-medium text-gray-600 dark:text-gray-400">${completed}/${total} tasks</span>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-300" 
                         style="width: ${percentage}%; background-color: ${subject.color}">
                    </div>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${percentage}% complete</p>
            </div>
        `;
    }).join('');
}

function renderTaskDistributionChart(completed, pending, overdue) {
    const ctx = document.getElementById('taskDistributionChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Overdue'],
            datasets: [{
                data: [completed, pending - overdue, overdue],
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function renderCompletionChart(subjects, tasksBySubject) {
    const ctx = document.getElementById('completionChart');
    if (!ctx) return;

    const labels = subjects.map(s => s.name);
    const completedData = subjects.map(s => {
        const tasks = tasksBySubject[s.id] || [];
        return tasks.filter(t => t.completed).length;
    });
    const pendingData = subjects.map(s => {
        const tasks = tasksBySubject[s.id] || [];
        return tasks.filter(t => !t.completed).length;
    });

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Completed',
                    data: completedData,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                },
                {
                    label: 'Pending',
                    data: pendingData,
                    backgroundColor: '#f59e0b',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}
