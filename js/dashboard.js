/*
 * ============================================
 * DASHBOARD.JS - Dashboard Display Module
 * ============================================
 * This file handles the dashboard view which shows:
 * - Statistics (total subjects, pending tasks, today's classes)
 * - Today's schedule
 * - Upcoming deadlines
 */

/**
 * Render the dashboard with all statistics and information
 * This is the main function that displays everything on the dashboard
 */
function renderDashboard() {
    // Get the container where we'll put the dashboard content
    const container = document.getElementById('dashboardContent');

    // Get all data from LocalStorage
    const subjects = getSubjects();
    const tasks = getTasks();
    const schedules = getSchedules();
    const today = getCurrentDay();  // 0=Sunday, 1=Monday, etc.

    // Calculate statistics
    const totalSubjects = subjects.length;
    const pendingTasks = tasks.filter(t => !t.completed).length;  // Count incomplete tasks
    const todaySchedules = schedules.filter(s => s.day === today);  // Get today's classes

    // Get upcoming tasks (next 5 deadlines)
    const upcomingTasks = tasks
        .filter(t => !t.completed)           // Only incomplete tasks
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))  // Sort by deadline
        .slice(0, 5);                        // Take first 5

    // Build the HTML for the dashboard with Tailwind classes
    container.innerHTML = `
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Total Subjects Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Subjects</p>
                <h3 class="text-3xl font-bold text-gray-900 dark:text-white">${totalSubjects}</h3>
            </div>
            
            <!-- Pending Tasks Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-amber-500">
                <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Pending Tasks</p>
                <h3 class="text-3xl font-bold text-gray-900 dark:text-white">${pendingTasks}</h3>
            </div>
            
            <!-- Today's Classes Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <p class="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Today's Classes</p>
                <h3 class="text-3xl font-bold text-gray-900 dark:text-white">${todaySchedules.length}</h3>
            </div>
        </div>
        
        <!-- Two Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Today's Schedule Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Today's Schedule</h3>
                ${todaySchedules.length > 0
            ? renderTodaySchedule(todaySchedules)  // Show schedule
            : '<p class="text-center text-gray-500 dark:text-gray-400 py-8">No classes today</p>'}
            </div>
            
            <!-- Upcoming Deadlines Card -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Upcoming Deadlines</h3>
                ${upcomingTasks.length > 0
            ? renderUpcomingDeadlines(upcomingTasks)  // Show deadlines
            : '<p class="text-center text-gray-500 dark:text-gray-400 py-8">No upcoming tasks</p>'}
            </div>
        </div>
    `;
}

/**
 * Render today's schedule list
 * @param {Array} schedules - Array of schedule objects for today
 * @returns {String} HTML string of schedule items
 */
function renderTodaySchedule(schedules) {
    // Sort schedules by start time (earliest first)
    return `<div class="space-y-3">` + schedules
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
        .map(schedule => {
            // Get the subject for this schedule
            const subject = getSubjectById(schedule.subjectId);
            if (!subject) return '';  // Skip if subject was deleted

            // Return HTML for one schedule item with Tailwind classes
            return `
                <div class="flex items-start justify-between p-3 rounded-md border-l-4 bg-gray-50 dark:bg-gray-700/50" style="border-color: ${subject.color}">
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white">${sanitizeHTML(subject.name)}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${sanitizeHTML(schedule.location)}</p>
                    </div>
                    <span class="text-sm font-medium px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">${formatTime(schedule.startTime)}</span>
                </div>
            `;
        }).join('') + '</div>';
}

/**
 * Render upcoming deadlines list
 * @param {Array} tasks - Array of task objects
 * @returns {String} HTML string of deadline items
 */
function renderUpcomingDeadlines(tasks) {
    return `<div class="space-y-3">` + tasks.map(task => {
        // Get the subject for this task
        const subject = getSubjectById(task.subjectId);
        if (!subject) return '';  // Skip if subject was deleted

        // Calculate how many days until deadline
        const daysUntil = getDaysUntil(task.deadline);

        // Mark as urgent if due in 2 days or less
        const isUrgent = daysUntil <= 2;
        const urgentClasses = isUrgent ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700/50';

        // Return HTML for one deadline item with Tailwind classes
        return `
            <div class="p-3 rounded-md border-l-4 ${urgentClasses}" style="border-color: ${isUrgent ? '#ef4444' : subject.color}">
                <h4 class="font-semibold text-gray-900 dark:text-white">${sanitizeHTML(task.title)}</h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${sanitizeHTML(subject.name)}</p>
                <p class="text-xs mt-2 ${isUrgent ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}">
                    ${formatDate(task.deadline)} 
                    ${daysUntil === 0 ? '(Today)' : daysUntil === 1 ? '(Tomorrow)' : `(${daysUntil} days)`}
                </p>
            </div>
        `;
    }).join('') + '</div>';
}
