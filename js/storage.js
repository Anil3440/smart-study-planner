/*
 * ============================================
 * STORAGE.JS - Data Management Module
 * ============================================
 * This file handles all data storage using LocalStorage.
 * It provides CRUD (Create, Read, Update, Delete) operations
 * for subjects, schedules, tasks, and settings.
 */

// Storage keys - used to identify data in LocalStorage
const STORAGE_KEYS = {
    SUBJECTS: 'studyPlanner_subjects',    // Key for subjects data
    SCHEDULES: 'studyPlanner_schedules',  // Key for schedules data
    TASKS: 'studyPlanner_tasks',          // Key for tasks data
    SETTINGS: 'studyPlanner_settings'     // Key for settings data
};


/* ============================================
 * SUBJECT FUNCTIONS
 * ============================================ */

/**
 * Get all subjects from LocalStorage
 * @returns {Array} Array of subject objects
 */
function getSubjects() {
    // Get data from LocalStorage
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    // If data exists, parse JSON string to array, otherwise return empty array
    return data ? JSON.parse(data) : [];
}

/**
 * Save subjects array to LocalStorage
 * @param {Array} subjects - Array of subject objects to save
 */
function saveSubjects(subjects) {
    // Convert array to JSON string and save to LocalStorage
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

/**
 * Add a new subject
 * @param {Object} subject - Subject data (name, professor, credits, etc.)
 * @returns {Object} The newly created subject with ID and timestamp
 */
function addSubject(subject) {
    // Get existing subjects
    const subjects = getSubjects();

    // Create new subject object with ID and timestamp
    const newSubject = {
        id: generateId(),                      // Generate unique ID
        ...subject,                            // Spread operator: copy all properties from input
        createdAt: new Date().toISOString()   // Add creation timestamp
    };

    // Add to array
    subjects.push(newSubject);

    // Save to LocalStorage
    saveSubjects(subjects);

    // Return the new subject
    return newSubject;
}

/**
 * Update an existing subject
 * @param {String} id - Subject ID to update
 * @param {Object} updates - Object with properties to update
 * @returns {Object|null} Updated subject or null if not found
 */
function updateSubject(id, updates) {
    const subjects = getSubjects();

    // Find the index of subject with matching ID
    const index = subjects.findIndex(s => s.id === id);

    // If found
    if (index !== -1) {
        // Merge existing subject with updates
        subjects[index] = { ...subjects[index], ...updates };

        // Save changes
        saveSubjects(subjects);

        // Return updated subject
        return subjects[index];
    }

    // Return null if subject not found
    return null;
}

/**
 * Delete a subject and all related data
 * @param {String} id - Subject ID to delete
 */
function deleteSubject(id) {
    // Get all subjects
    const subjects = getSubjects();

    // Filter out the subject with matching ID
    const filtered = subjects.filter(s => s.id !== id);

    // Save updated array
    saveSubjects(filtered);

    // CASCADE DELETE: Also delete related schedules and tasks

    // Delete all schedules for this subject
    const schedules = getSchedules().filter(s => s.subjectId !== id);
    saveSchedules(schedules);

    // Delete all tasks for this subject
    const tasks = getTasks().filter(t => t.subjectId !== id);
    saveTasks(tasks);
}

/**
 * Get a single subject by ID
 * @param {String} id - Subject ID to find
 * @returns {Object|undefined} Subject object or undefined if not found
 */
function getSubjectById(id) {
    const subjects = getSubjects();
    // Find and return subject with matching ID
    return subjects.find(s => s.id === id);
}


/* ============================================
 * SCHEDULE FUNCTIONS
 * ============================================ */

/**
 * Get all schedules from LocalStorage
 * @returns {Array} Array of schedule objects
 */
function getSchedules() {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return data ? JSON.parse(data) : [];
}

/**
 * Save schedules array to LocalStorage
 * @param {Array} schedules - Array of schedule objects
 */
function saveSchedules(schedules) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
}

/**
 * Add a new schedule (class)
 * @param {Object} schedule - Schedule data (subjectId, day, time, location)
 * @returns {Object} The newly created schedule
 */
function addSchedule(schedule) {
    const schedules = getSchedules();

    const newSchedule = {
        id: generateId(),
        ...schedule,
        createdAt: new Date().toISOString()
    };

    schedules.push(newSchedule);
    saveSchedules(schedules);

    return newSchedule;
}

/**
 * Update an existing schedule
 * @param {String} id - Schedule ID
 * @param {Object} updates - Properties to update
 * @returns {Object|null} Updated schedule or null
 */
function updateSchedule(id, updates) {
    const schedules = getSchedules();
    const index = schedules.findIndex(s => s.id === id);

    if (index !== -1) {
        schedules[index] = { ...schedules[index], ...updates };
        saveSchedules(schedules);
        return schedules[index];
    }

    return null;
}

/**
 * Delete a schedule
 * @param {String} id - Schedule ID to delete
 */
function deleteSchedule(id) {
    const schedules = getSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    saveSchedules(filtered);
}

/**
 * Get schedules for a specific day
 * @param {Number} day - Day number (0=Sunday, 1=Monday, etc.)
 * @returns {Array} Schedules for that day
 */
function getSchedulesByDay(day) {
    const schedules = getSchedules();
    // Filter schedules where day matches
    return schedules.filter(s => s.day === day);
}


/* ============================================
 * TASK FUNCTIONS
 * ============================================ */

/**
 * Get all tasks from LocalStorage
 * @returns {Array} Array of task objects
 */
function getTasks() {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
}

/**
 * Save tasks array to LocalStorage
 * @param {Array} tasks - Array of task objects
 */
function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

/**
 * Add a new task
 * @param {Object} task - Task data (title, deadline, priority, etc.)
 * @returns {Object} The newly created task
 */
function addTask(task) {
    const tasks = getTasks();

    const newTask = {
        id: generateId(),
        ...task,
        completed: false,                    // New tasks start as not completed
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveTasks(tasks);

    return newTask;
}

/**
 * Update an existing task
 * @param {String} id - Task ID
 * @param {Object} updates - Properties to update
 * @returns {Object|null} Updated task or null
 */
function updateTask(id, updates) {
    const tasks = getTasks();
    const index = tasks.findIndex(t => t.id === id);

    if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
        saveTasks(tasks);
        return tasks[index];
    }

    return null;
}

/**
 * Delete a task
 * @param {String} id - Task ID to delete
 */
function deleteTask(id) {
    const tasks = getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    saveTasks(filtered);
}

/**
 * Toggle task completion status
 * @param {String} id - Task ID
 * @returns {Object|null} Updated task or null
 */
function toggleTaskComplete(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);

    if (task) {
        // Flip the completed status (true becomes false, false becomes true)
        task.completed = !task.completed;
        saveTasks(tasks);
        return task;
    }

    return null;
}


/* ============================================
 * SETTINGS FUNCTIONS
 * ============================================ */

/**
 * Get user settings from LocalStorage
 * @returns {Object} Settings object with theme and notifications
 */
function getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    // Return saved settings or default settings
    return data ? JSON.parse(data) : {
        theme: 'light',          // Default theme
        notifications: true      // Default notifications enabled
    };
}

/**
 * Save settings to LocalStorage
 * @param {Object} settings - Settings object
 */
function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * Update specific settings
 * @param {Object} updates - Settings to update
 * @returns {Object} Updated settings object
 */
function updateSettings(updates) {
    const settings = getSettings();
    // Merge existing settings with updates
    const newSettings = { ...settings, ...updates };
    saveSettings(newSettings);
    return newSettings;
}


/* ============================================
 * UTILITY FUNCTIONS
 * ============================================ */

/**
 * Reset all data (delete everything)
 * WARNING: This cannot be undone!
 */
function resetAllData() {
    // Remove all data from LocalStorage
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    // Note: Settings are NOT deleted so theme preference is kept
}


/* ============================================
 * SAMPLE DATA INITIALIZATION
 * ============================================ */

/**
 * Initialize sample data if database is empty
 * This runs when the app first loads
 */
function initializeSampleData() {
    const subjects = getSubjects();

    // Only add sample data if no subjects exist
    if (subjects.length === 0) {

        // Add sample subjects
        const math = addSubject({
            name: 'Mathematics',
            priority: 'high',
            color: '#8b5cf6',
            credits: 4,
            professor: 'Dr. Smith',
            description: 'Advanced Calculus and Linear Algebra'
        });

        const physics = addSubject({
            name: 'Physics',
            priority: 'high',
            color: '#3b82f6',
            credits: 4,
            professor: 'Dr. Johnson',
            description: 'Quantum Mechanics and Thermodynamics'
        });

        const cs = addSubject({
            name: 'Computer Science',
            priority: 'medium',
            color: '#10b981',
            credits: 3,
            professor: 'Prof. Williams',
            description: 'Data Structures and Algorithms'
        });

        // Add sample schedules
        addSchedule({
            subjectId: math.id,
            day: 1,              // Monday
            startTime: '09:00',
            endTime: '10:30',
            location: 'Room 101',
            type: 'Lecture'
        });

        addSchedule({
            subjectId: physics.id,
            day: 1,              // Monday
            startTime: '11:00',
            endTime: '12:30',
            location: 'Lab 2',
            type: 'Lab'
        });

        addSchedule({
            subjectId: cs.id,
            day: 2,              // Tuesday
            startTime: '14:00',
            endTime: '15:30',
            location: 'Room 205',
            type: 'Lecture'
        });

        // Add sample tasks with different deadlines
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        addTask({
            subjectId: math.id,
            title: 'Calculus Problem Set 5',
            type: 'assignment',
            deadline: tomorrow.toISOString(),
            priority: 'high',
            description: 'Complete problems 1-20 from Chapter 5'
        });

        addTask({
            subjectId: physics.id,
            title: 'Midterm Exam',
            type: 'exam',
            deadline: nextWeek.toISOString(),
            priority: 'high',
            description: 'Chapters 1-5, bring calculator'
        });

        addTask({
            subjectId: cs.id,
            title: 'Binary Tree Implementation',
            type: 'assignment',
            deadline: nextWeek.toISOString(),
            priority: 'medium',
            description: 'Implement BST with insert, delete, and search operations'
        });
    }
}
