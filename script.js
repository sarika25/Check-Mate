// Wait until full DOM is loaded before accessing elements
document.addEventListener('DOMContentLoaded', () => {

    // Input field and buttons
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');

    // Task list container
    const taskList = document.getElementById('task-list');

    // Empty state image when no tasks exist
    const emptyImage = document.getElementsByClassName('empty-image')[0];
    // const emptyImage = document.querySelector('.empty-image');

    // Main container for responsive layout handling
    const todosContainer = document.querySelector('.todos-container');

    // Progress bar elements
    const progressBar = document.getElementById('progress');
    const progressNumbers = document.getElementById('numbers');

    // Tooltip element (created once and reused)
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);


    // Attach tooltip only when text overflows
    function attachTooltip(span) {

        span.addEventListener('mouseenter', () => {
            // Show tooltip only if text is truncated
            if (span.scrollWidth <= span.clientWidth) return;
            tooltip.textContent = span.textContent;
            tooltip.classList.add('show');

            // Position tooltip above hovered text
            const rect = span.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8 + window.scrollY}px`;
            tooltip.style.left = `${rect.left + window.scrollX}px`;
        });

        // Hide tooltip on mouse leave
        span.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
    }

    window.addEventListener('load', () => {
        document.body.style.opacity = '1';
    });

    // Toggle image when no tasks are present
    const toggleEmptyState = () => {
        if (taskList.children.length === 0){
            emptyImage.style.display = 'block';
        }else{
            emptyImage.style.display = 'none';
        }
        // emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        todosContainer.style.width = taskList.children.length > 0 ? '100%' : '50%';
    }

    let hasCelebrated = false;

    // Update progress bar and task count
    const updateProgress = (checkCompletion = true) => {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;

        // Update progress bar width
        progressBar.style.width = totalTasks ? `${(completedTasks /totalTasks) * 100}%` : '0%';

        // Update progress text
        progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;

        // Trigger celebration when all tasks are completed
        if(checkCompletion && totalTasks > 0 && completedTasks === totalTasks){
            if (!hasCelebrated) {
                // confetti({
                //     particleCount: 150,
                //     spread: 70,
                //     origin: { y: 0.6 }
                // });

                confetti({
                    particleCount: 200,
                    spread: 120,
                    startVelocity: 40,
                    scalar: 1.2
                });

                // const shootConfetti = () => {
                //     confetti({ particleCount: 100, spread: 70 });
                //     setTimeout(() => confetti({ particleCount: 100, spread: 100 }), 200);
                //     setTimeout(() => confetti({ particleCount: 100, spread: 120 }), 400);
                // };
                // shootConfetti();

                hasCelebrated = true;
            }
        } else {
            // Reset celebration flag if tasks change
            hasCelebrated = false; // reset if user unchecks
        }
    };

    // Save tasks in browser localStorage
    const saveTaskToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => ({
            text: li.querySelector('span').textContent,
            completed: li.querySelector('.checkbox').checked
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Load saved tasks from localStorage on page reload
    const loadTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        savedTasks.forEach(({text, completed}) => addTask(text, completed, false));
        toggleEmptyState();
        updateProgress();
    }

    // Function to create and add a new task
    const addTask = (text, completed = false, checkCompletion = true) => {
        // event.preventDefault();
        const taskText = text || taskInput.value.trim();

        // Prevent adding empty tasks
        if(!taskText){
            return;
        }

        // Create task element
        const li = document.createElement('li');
        li.innerHTML = `
        <label class="task-label">
            <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''}>
            <span>${taskText}</span>
        </label>
        <div class="task-buttons">
            <button class = "edit-btn"><i class="fa-solid fa-pen"></i></button>
            <button class = "delete-btn"><i class="fa-solid fa-trash"></i></button>
        </div>
        `;

        const checkbox = li.querySelector('.checkbox');
        const editBtn = li.querySelector('.edit-btn');


        // Handle pre-completed tasks
        if (completed) {
            li.classList.add('completed');
            editBtn.disabled = true;
            editBtn.style.opacity = '0.5';
            editBtn.style.pointerEvents = 'none';
        }

        // Checkbox toggle logic
        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed',isChecked);

            // Disable editing if task is completed
            editBtn.disabled = isChecked;
            editBtn.style.opacity = isChecked ? '0.5' : '1';
            editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';

            updateProgress();
            saveTaskToLocalStorage();
        })

        // Edit task (only if not completed)
        editBtn.addEventListener('click', () => {
            if(!checkbox.checked){
                taskInput.value = li.querySelector('span').textContent;
                li.remove();
                toggleEmptyState();
                updateProgress(false);
                saveTaskToLocalStorage();
            }
        })

        // Delete task
        li.querySelector('.delete-btn').addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
            updateProgress();
            saveTaskToLocalStorage();
        })

        const span = li.querySelector('span');

        // Attach tooltip behavior
        attachTooltip(span);

        // Append task to list
        taskList.appendChild(li);

        // Reset input field
        taskInput.value = '';

        toggleEmptyState()
        updateProgress(checkCompletion);
        saveTaskToLocalStorage();
    };

    // Add task on button click
    addTaskBtn.addEventListener('click',() => addTask());
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter'){
            e.preventDefault();
            addTask();
        }
    })

    // Initialize app with saved tasks
    loadTasksFromLocalStorage();
});
