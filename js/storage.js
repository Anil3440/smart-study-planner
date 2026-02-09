

const STORAGE_KEYS = {
    SUBJECTS: 'studyPlanner_subjects',
    SCHEDULES: 'studyPlanner_schedules',
    TASKS: 'studyPlanner_tasks',
    SETTINGS: 'studyPlanner_settings'
};



function getSubjects() {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : [];
}

function saveSubjects(subjects) {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

function addSubject(subject) {
    const subjects = getSubjects();
    const newSubject = {
        id: generateId(),
        ...subject,
        createdAt: new Date().toISOString()
    };
    subjects.push(newSubject);
    saveSubjects(subjects);
    return newSubject;
}

function updateSubject(id, updates) {
    const subjects = getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index !== -1) {
        subjects[index] = { ...subjects[index], ...updates };
        saveSubjects(subjects);
        return subjects[index];
    }
    return null;
}

function deleteSubject(id) {
    const subjects = getSubjects();
    const filtered = subjects.filter(s => s.id !== id);
    saveSubjects(filtered);


    const schedules = getSchedules().filter(s => s.subjectId !== id);
    saveSchedules(schedules);

    const tasks = getTasks().filter(t => t.subjectId !== id);
    saveTasks(tasks);
}

function getSubjectById(id) {
    const subjects = getSubjects();
    return subjects.find(s => s.id === id);
}



function getSchedules() {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    return data ? JSON.parse(data) : [];
}

function saveSchedules(schedules) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
}

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

function deleteSchedule(id) {
    const schedules = getSchedules();
    const filtered = schedules.filter(s => s.id !== id);
    saveSchedules(filtered);
}

function getSchedulesByDay(day) {
    const schedules = getSchedules();
    return schedules.filter(s => s.day === day);
}



function getTasks() {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
}

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
}

function addTask(task) {
    const tasks = getTasks();
    const newTask = {
        id: generateId(),
        ...task,
        completed: false,
        createdAt: new Date().toISOString()
    };
    tasks.push(newTask);
    saveTasks(tasks);
    return newTask;
}

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

function deleteTask(id) {
    const tasks = getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    saveTasks(filtered);
}

function toggleTaskComplete(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        return task;
    }
    return null;
}



function getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
        theme: 'light',
        notifications: true
    };
}

function saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

function updateSettings(updates) {
    const settings = getSettings();
    const newSettings = { ...settings, ...updates };
    saveSettings(newSettings);
    return newSettings;
}



function resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULES);
    localStorage.removeItem(STORAGE_KEYS.TASKS);

}



function initializeSampleData() {
    const subjects = getSubjects();

    if (subjects.length === 0) {

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


        addSchedule({
            subjectId: math.id,
            day: 1, // Monday
            startTime: '09:00',
            endTime: '10:30',
            location: 'Room 101',
            type: 'Lecture'
        });

        addSchedule({
            subjectId: physics.id,
            day: 1,
            startTime: '11:00',
            endTime: '12:30',
            location: 'Lab 2',
            type: 'Lab'
        });

        addSchedule({
            subjectId: cs.id,
            day: 2, // Tuesday
            startTime: '14:00',
            endTime: '15:30',
            location: 'Room 205',
            type: 'Lecture'
        });


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
