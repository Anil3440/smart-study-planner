document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    initializeSampleData();
    const settings = getSettings();
    applyTheme(settings.theme);
    setupNavigation();
    setupModal();
    setupSidebarToggle();
    renderDashboard();
    checkDeadlineAlerts();
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            navigateToSection(section);
        });
    });
}

function navigateToSection(sectionName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(`${sectionName}Section`);
    if (activeSection) {
        activeSection.classList.add('active');
    }

    switch (sectionName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'subjects':
            renderSubjects();
            break;
        case 'schedule':
            renderSchedule();
            break;
        case 'tasks':
            renderTasks();
            break;
        case 'analytics':
            renderAnalytics();
            break;
        case 'settings':
            renderSettings();
            break;
    }

    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
}

function setupModal() {
    const modal = document.getElementById('modal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');

    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
}

function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });
}

function checkDeadlineAlerts() {
    const settings = getSettings();
    if (!settings.notifications) return;

    const tasks = getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const urgentTasks = tasks.filter(task => {
        if (task.completed) return false;

        const deadline = new Date(task.deadline);
        deadline.setHours(0, 0, 0, 0);

        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 1;
    });

    if (urgentTasks.length > 0) {
        const message = urgentTasks.length === 1
            ? `You have 1 task due soon!`
            : `You have ${urgentTasks.length} tasks due soon!`;

        setTimeout(() => {
            showToast(message, 'warning');
        }, 1000);
    }
}

document.getElementById('themeToggle')?.addEventListener('click', () => {
    const settings = getSettings();
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    changeTheme(newTheme);
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (document.getElementById('analyticsSection').classList.contains('active')) {
            renderAnalytics();
        }
    }, 250);
});

document.addEventListener('submit', (e) => {
    if (e.target.tagName === 'FORM') {
        e.preventDefault();
    }
});

