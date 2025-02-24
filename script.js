document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  const addTaskButton = document.getElementById('addTaskButton');
  const taskList = document.getElementById('taskList');
  const savePdfButton = document.getElementById('savePdfButton');
  const printButton = document.getElementById('printButton');

  // Initially hide the save and print buttons
  savePdfButton.style.display = 'none';
  printButton.style.display = 'none';

  // Function to check if there are tasks and show/hide buttons accordingly
  function updateButtonsVisibility() {
    if (taskList.children.length > 0) {
      savePdfButton.style.display = 'inline-block';
      printButton.style.display = 'inline-block';
    } else {
      savePdfButton.style.display = 'inline-block';
      printButton.style.display = 'inline-block';
    }
  }

  // Load tasks from localStorage
  function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach((task) => addTask(task.text, task.completed));
    updateButtonsVisibility(); // Update buttons based on loaded tasks
  }

  // Save tasks to localStorage
  function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach((taskItem) => {
      tasks.push({
        text: taskItem.querySelector('.editable').textContent,
        completed: taskItem.classList.contains('completed'),
      });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateButtonsVisibility(); // Update buttons after saving tasks
  }

  // Function to add a task
  function addTask(taskText = '', completed = false) {
    taskText = taskText.trim();
    if (taskText === '') return;

    // Create task item
    const taskItem = document.createElement('li');
    taskItem.className = 'task-item';
    if (completed) taskItem.classList.add('completed');

    taskItem.innerHTML = `
      <span contenteditable="true" class="editable">${taskText}</span>
      <button class="complete-btn">${completed ? 'Completed' : 'Mark as Complete'}</button>
      <button class="remove-btn">Remove</button>
    `;

    const taskSpan = taskItem.querySelector('.editable');
    const completeButton = taskItem.querySelector('.complete-btn');
    const removeButton = taskItem.querySelector('.remove-btn');

    // Mark as Complete button functionality
    completeButton.addEventListener('click', () => {
      taskItem.classList.toggle('completed');
      completeButton.textContent = taskItem.classList.contains('completed') ? 'Completed' : 'Mark as Complete';
      saveTasks();
    });

    // Remove button functionality
    removeButton.addEventListener('click', () => {
      taskList.removeChild(taskItem);
      saveTasks();
    });

    // Auto-save edited task
    taskSpan.addEventListener('blur', () => {
      taskSpan.textContent = taskSpan.textContent.trim(); // Remove extra spaces
      saveTasks();
    });

    taskList.appendChild(taskItem);
    taskInput.value = '';

    saveTasks(); // Save tasks and update buttons
  }

  // Add Task on Button Click
  addTaskButton.addEventListener('click', () => addTask(taskInput.value));

  // Add Task on Enter Key Press
  taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addTask(taskInput.value);
    }
  });

  // Save as PDF Functionality
  savePdfButton.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('To-Do List', 10, 10);

    let y = 20; // Position for the first task
    document.querySelectorAll('.task-item').forEach((taskItem, index) => {
      const taskText = taskItem.querySelector('.editable').textContent;
      const isCompleted = taskItem.classList.contains('completed') ? '[Completed] ' : '';
      doc.text(`${index + 1}. ${isCompleted}${taskText}`, 10, y);
      y += 10;
    });

    doc.save('To-Do-List.pdf');
  });

  // Print Functionality (Only Print the Task List)
  printButton.addEventListener('click', () => {
    const taskItems = document.querySelectorAll('.task-item');
    if (taskItems.length === 0) {
      alert('No tasks to print!');
      return;
    }

    let printContent = '<h2>To-Do List</h2><ul>';
    taskItems.forEach((taskItem) => {
      const taskText = taskItem.querySelector('.editable').textContent;
      const isCompleted = taskItem.classList.contains('completed') ? '[Completed] ' : '';
      printContent += `<li>${isCompleted}${taskText}</li>`;
    });
    printContent += '</ul>';

    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print To-Do List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            ul { list-style-type: none; padding: 0; }
            li { font-size: 18px; margin-bottom: 10px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  });

  loadTasks(); // Load tasks on page load
});
