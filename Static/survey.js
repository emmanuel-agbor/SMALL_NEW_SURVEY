// ================= SURVEY.JS - COMBINED PHASES 1 & 2 =================

// Global Variables
let questionCount = 1; // Track total number of questions
const MAX_QUESTIONS = 5; // Maximum allowed questions
const MIN_QUESTIONS = 1; // Minimum required questions
const STORAGE_KEY = 'survey_form_data'; // Local storage key
let autoSaveTimeout; // For debounced auto-save

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing survey form...');
    
    // Get important elements
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');
    const cancelBtn = document.querySelector('.cancel-btn');
    const surveyForm = document.getElementById('survey-form');
    
    // Check if elements exist
    if (!addQuestionBtn || !questionsContainer) {
        console.error('Required elements not found!');
        return;
    }
    
    // Event listeners
    addQuestionBtn.addEventListener('click', addNewQuestion);
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', clearFormWithConfirmation);
    }
    
    if (surveyForm) {
        surveyForm.addEventListener('submit', handleFormSubmission);
    }
    
    // Setup auto-save functionality
    setupAutoSave();
    
    // Event listener for Remove buttons (for existing questions)
    attachRemoveListeners();
    
    // Load saved data on page load
    loadSavedFormData();
    
    console.log('Survey form initialized successfully');
});

// ================= ADD QUESTION FUNCTIONALITY =================
function addNewQuestion() {
    console.log(`Attempting to add new question. Current count: ${questionCount}`);
    
    // Check if we've reached maximum questions
    if (questionCount >= MAX_QUESTIONS) {
        alert(`Maximum ${MAX_QUESTIONS} questions allowed!`);
        return;
    }
    
    // Increment question count
    questionCount++;
    
    // Create new question block
    const newQuestionBlock = createQuestionBlock(questionCount);
    
    // Add new question to container
    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.appendChild(newQuestionBlock);
    
    // Attach remove listener to new question
    attachRemoveListeners();
    
    // Attach auto-save listeners to new question
    attachAutoSaveToQuestions();
    
    // Update Add Question button state
    updateAddButtonState();
    
    // Auto-save after adding question
    debounceAutoSave();
    
    console.log(`Added Question ${questionCount}. Total questions: ${questionCount}`);
}

// ================= CREATE QUESTION BLOCK =================
function createQuestionBlock(questionNumber) {
    // Create the main question block div
    const questionBlock = document.createElement('div');
    questionBlock.id = `question-${questionNumber}`;
    questionBlock.className = 'question-block';
    
    // Create the HTML content for new question (blank fields)
    questionBlock.innerHTML = `
        <div class="question-header">
            <span class="question-number">Question ${questionNumber}</span>
            <button type="button" id="remove-question-${questionNumber}" class="remove-btn">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>

        <div class="form-group">
            <label for="question-text-${questionNumber}" class="form-label">
                Question Text <span class="required">*</span>
            </label>
            <input type="text" id="question-text-${questionNumber}" 
                   name="question-text-${questionNumber}" class="form-input" required>
        </div>

        <div class="question-settings">
            <div class="form-group">
                <label for="question-type-${questionNumber}" class="form-label">Question Type</label>
                <select id="question-type-${questionNumber}" name="question-type-${questionNumber}" class="form-select">
                    <option value="text">Text Response</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="rating">Rating</option>
                </select>
            </div>

            <div class="checkbox-group">
                <input type="checkbox" id="required-${questionNumber}" name="required-${questionNumber}" class="form-checkbox">
                <label for="required-${questionNumber}" class="checkbox-label">Required</label>
            </div>
        </div>
    `;
    
    return questionBlock;
}

// ================= REMOVE QUESTION FUNCTIONALITY =================
function removeQuestion(questionNumber) {
    console.log(`Attempting to remove question ${questionNumber}`);
    
    // Check if we're at minimum questions
    if (questionCount <= MIN_QUESTIONS) {
        alert(`You must have at least ${MIN_QUESTIONS} question!`);
        return;
    }
    
    // Confirmation dialog
    const confirmRemove = confirm(`Are you sure you want to remove Question ${questionNumber}?`);
    
    if (!confirmRemove) {
        return; // User cancelled
    }
    
    // Remove the question block from DOM
    const questionBlock = document.getElementById(`question-${questionNumber}`);
    if (questionBlock) {
        questionBlock.remove();
        
        // Decrease question count
        questionCount--;
        
        // Renumber all remaining questions
        renumberQuestions();
        
        // Update Add Question button state
        updateAddButtonState();
        
        // Auto-save after removing question
        debounceAutoSave();
        
        console.log(`Removed Question ${questionNumber}. Total questions: ${questionCount}`);
    }
}

// ================= RENUMBER QUESTIONS =================
function renumberQuestions() {
    const questionsContainer = document.getElementById('questions-container');
    const questionBlocks = questionsContainer.querySelectorAll('.question-block');
    
    // Reset question count to actual number of blocks
    questionCount = questionBlocks.length;
    
    // Loop through each question block and renumber
    questionBlocks.forEach((block, index) => {
        const newQuestionNumber = index + 1;
        
        // Update block ID
        block.id = `question-${newQuestionNumber}`;
        
        // Update question number display
        const questionNumberSpan = block.querySelector('.question-number');
        questionNumberSpan.textContent = `Question ${newQuestionNumber}`;
        
        // Update all IDs and names in the block
        updateQuestionBlockIds(block, newQuestionNumber);
    });
    
    // Re-attach event listeners after renumbering
    attachRemoveListeners();
    attachAutoSaveToQuestions();
    
    console.log(`Renumbered questions. Total count: ${questionCount}`);
}

// ================= UPDATE QUESTION BLOCK IDS =================
function updateQuestionBlockIds(block, questionNumber) {
    // Update remove button
    const removeBtn = block.querySelector('.remove-btn');
    if (removeBtn) {
        removeBtn.id = `remove-question-${questionNumber}`;
    }
    
    // Update question text input
    const questionTextInput = block.querySelector('.form-input');
    if (questionTextInput) {
        questionTextInput.id = `question-text-${questionNumber}`;
        questionTextInput.name = `question-text-${questionNumber}`;
    }
    
    // Update question text label
    const questionTextLabel = block.querySelector('.form-label');
    if (questionTextLabel) {
        questionTextLabel.setAttribute('for', `question-text-${questionNumber}`);
    }
    
    // Update question type select
    const questionTypeSelect = block.querySelector('.form-select');
    if (questionTypeSelect) {
        questionTypeSelect.id = `question-type-${questionNumber}`;
        questionTypeSelect.name = `question-type-${questionNumber}`;
    }
    
    // Update question type label
    const questionTypeLabels = block.querySelectorAll('.form-label');
    if (questionTypeLabels[1]) {
        questionTypeLabels[1].setAttribute('for', `question-type-${questionNumber}`);
    }
    
    // Update required checkbox
    const requiredCheckbox = block.querySelector('.form-checkbox');
    if (requiredCheckbox) {
        requiredCheckbox.id = `required-${questionNumber}`;
        requiredCheckbox.name = `required-${questionNumber}`;
    }
    
    // Update required checkbox label
    const requiredLabel = block.querySelector('.checkbox-label');
    if (requiredLabel) {
        requiredLabel.setAttribute('for', `required-${questionNumber}`);
    }
}

// ================= ATTACH REMOVE LISTENERS =================
function attachRemoveListeners() {
    // Get all remove buttons
    const removeButtons = document.querySelectorAll('.remove-btn');
    
    // Remove existing listeners by cloning nodes
    removeButtons.forEach(button => {
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Add listeners to all remove buttons
    const newRemoveButtons = document.querySelectorAll('.remove-btn');
    newRemoveButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Extract question number from button ID
            const questionNumber = button.id.replace('remove-question-', '');
            removeQuestion(parseInt(questionNumber));
        });
    });
}

// ================= UPDATE ADD BUTTON STATE =================
function updateAddButtonState() {
    const addQuestionBtn = document.getElementById('add-question-btn');
    
    if (!addQuestionBtn) return;
    
    if (questionCount >= MAX_QUESTIONS) {
        addQuestionBtn.disabled = true;
        addQuestionBtn.innerHTML = '<i class="fas fa-plus"></i> Maximum Questions Reached';
        addQuestionBtn.style.opacity = '0.6';
        addQuestionBtn.style.cursor = 'not-allowed';
    } else {
        addQuestionBtn.disabled = false;
        addQuestionBtn.innerHTML = '<i class="fas fa-plus"></i> Add Question';
        addQuestionBtn.style.opacity = '1';
        addQuestionBtn.style.cursor = 'pointer';
    }
}

// ================= FORM MANAGEMENT & LOCAL STORAGE =================

// Clear Form with Confirmation
function clearFormWithConfirmation() {
    const confirmClear = confirm('Are you sure you want to clear all form data? This action cannot be undone.');
    
    if (!confirmClear) {
        return; // User cancelled
    }
    
    clearForm();
}

// Clear Form Function
function clearForm() {
    console.log('Clearing form...');
    
    // Clear survey title and description
    const surveyTitle = document.getElementById('survey-title');
    const surveyDescription = document.getElementById('survey-description');
    
    if (surveyTitle) surveyTitle.value = '';
    if (surveyDescription) surveyDescription.value = '';
    
    // Remove all questions except the first one
    const questionsContainer = document.getElementById('questions-container');
    const questionBlocks = questionsContainer.querySelectorAll('.question-block');
    
    // Remove all questions except the first
    for (let i = questionBlocks.length - 1; i > 0; i--) {
        questionBlocks[i].remove();
    }
    
    // Reset question count
    questionCount = 1;
    
    // Clear first question
    const questionText1 = document.getElementById('question-text-1');
    const questionType1 = document.getElementById('question-type-1');
    const required1 = document.getElementById('required-1');
    
    if (questionText1) questionText1.value = '';
    if (questionType1) questionType1.value = 'text';
    if (required1) required1.checked = false;
    
    // Update add button state
    updateAddButtonState();
    
    // Clear local storage
    clearSavedFormData();
    
    console.log('Form cleared successfully');
}

// Setup Auto-Save Functionality
function setupAutoSave() {
    console.log('Setting up auto-save...');
    
    // Get all form inputs
    const surveyTitle = document.getElementById('survey-title');
    const surveyDescription = document.getElementById('survey-description');
    
    // Add auto-save listeners to main form fields
    if (surveyTitle) {
        surveyTitle.addEventListener('input', debounceAutoSave);
    }
    if (surveyDescription) {
        surveyDescription.addEventListener('input', debounceAutoSave);
    }
    
    // Add listeners to existing question fields
    attachAutoSaveToQuestions();
}

// Attach Auto-Save to Question Fields
function attachAutoSaveToQuestions() {
    const questionBlocks = document.querySelectorAll('.question-block');
    
    questionBlocks.forEach(block => {
        const questionText = block.querySelector('.form-input');
        const questionType = block.querySelector('.form-select');
        const required = block.querySelector('.form-checkbox');
        
        // Remove existing listeners by cloning nodes
        if (questionText) {
            const newQuestionText = questionText.cloneNode(true);
            questionText.parentNode.replaceChild(newQuestionText, questionText);
            newQuestionText.addEventListener('input', debounceAutoSave);
        }
        
        if (questionType) {
            const newQuestionType = questionType.cloneNode(true);
            questionType.parentNode.replaceChild(newQuestionType, questionType);
            newQuestionType.addEventListener('change', debounceAutoSave);
        }
        
        if (required) {
            const newRequired = required.cloneNode(true);
            required.parentNode.replaceChild(newRequired, required);
            newRequired.addEventListener('change', debounceAutoSave);
        }
    });
}

// Debounced Auto-Save (saves 1 second after user stops typing)
function debounceAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(autoSaveFormData, 1000);
}

// Auto-Save Form Data to Local Storage
function autoSaveFormData() {
    try {
        const surveyTitle = document.getElementById('survey-title');
        const surveyDescription = document.getElementById('survey-description');
        
        const formData = {
            surveyTitle: surveyTitle ? surveyTitle.value : '',
            surveyDescription: surveyDescription ? surveyDescription.value : '',
            questionCount: questionCount,
            questions: []
        };
        
        // Save all questions
        for (let i = 1; i <= questionCount; i++) {
            const questionText = document.getElementById(`question-text-${i}`);
            const questionType = document.getElementById(`question-type-${i}`);
            const required = document.getElementById(`required-${i}`);
            
            if (questionText && questionType && required) {
                formData.questions.push({
                    text: questionText.value,
                    type: questionType.value,
                    required: required.checked
                });
            }
        }
        
        // Save to local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        console.log('Form data auto-saved');
        
    } catch (error) {
        console.error('Error saving form data:', error);
    }
}

// Load Saved Form Data from Local Storage
function loadSavedFormData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (!savedData) {
            console.log('No saved form data found');
            return;
        }
        
        const formData = JSON.parse(savedData);
        
        // Restore main form fields
        const surveyTitle = document.getElementById('survey-title');
        const surveyDescription = document.getElementById('survey-description');
        
        if (surveyTitle) surveyTitle.value = formData.surveyTitle || '';
        if (surveyDescription) surveyDescription.value = formData.surveyDescription || '';
        
        // Restore questions
        if (formData.questions && formData.questions.length > 0) {
            // First, clear existing questions except the first one
            const questionsContainer = document.getElementById('questions-container');
            const questionBlocks = questionsContainer.querySelectorAll('.question-block');
            for (let i = questionBlocks.length - 1; i > 0; i--) {
                questionBlocks[i].remove();
            }
            
            // Reset question count
            questionCount = 1;
            
            // Restore first question
            const firstQuestion = formData.questions[0];
            const questionText1 = document.getElementById('question-text-1');
            const questionType1 = document.getElementById('question-type-1');
            const required1 = document.getElementById('required-1');
            
            if (questionText1) questionText1.value = firstQuestion.text || '';
            if (questionType1) questionType1.value = firstQuestion.type || 'text';
            if (required1) required1.checked = firstQuestion.required || false;
            
            // Add remaining questions
            for (let i = 1; i < formData.questions.length && i < MAX_QUESTIONS; i++) {
                addNewQuestion();
                
                const question = formData.questions[i];
                const questionNum = i + 1;
                
                const questionText = document.getElementById(`question-text-${questionNum}`);
                const questionType = document.getElementById(`question-type-${questionNum}`);
                const required = document.getElementById(`required-${questionNum}`);
                
                if (questionText) questionText.value = question.text || '';
                if (questionType) questionType.value = question.type || 'text';
                if (required) required.checked = question.required || false;
            }
        }
        
        // Re-attach auto-save listeners
        setupAutoSave();
        
        console.log('Form data loaded from saved state');
        
    } catch (error) {
        console.error('Error loading saved form data:', error);
        // Clear corrupted data
        clearSavedFormData();
    }
}

// Clear Saved Form Data from Local Storage
function clearSavedFormData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Saved form data cleared');
    } catch (error) {
        console.error('Error clearing saved form data:', error);
    }
}

// Handle Form Submission
function handleFormSubmission(event) {
    event.preventDefault(); // Prevent default form submission
    
    console.log('Form submission attempted');
    
    // Validate form
    if (!validateForm()) {
        return false;
    }
    
    // If validation passes, clear saved data and proceed
    clearSavedFormData();
    
    // Here you can add code to submit form data to backend
    alert('Survey created successfully! (This will redirect to dashboard in the final version)');
    
    console.log('Form submitted successfully');
    return true;
}

// Form Validation
function validateForm() {
    let isValid = true;
    const errors = [];
    
    // Validate survey title
    const surveyTitle = document.getElementById('survey-title');
    const titleValue = surveyTitle ? surveyTitle.value.trim() : '';
    
    if (!titleValue) {
        errors.push('Survey Title is required');
        highlightField('survey-title', true);
        isValid = false;
    } else {
        highlightField('survey-title', false);
    }
    
    // Validate questions
    for (let i = 1; i <= questionCount; i++) {
        const questionText = document.getElementById(`question-text-${i}`);
        if (questionText && !questionText.value.trim()) {
            errors.push(`Question ${i} text is required`);
            highlightField(`question-text-${i}`, true);
            isValid = false;
        } else if (questionText) {
            highlightField(`question-text-${i}`, false);
        }
    }
    
    // Show errors if validation fails
    if (!isValid) {
        alert('Please fix the following errors:\n\n' + errors.join('\n'));
    }
    
    return isValid;
}

// Highlight Field for Validation Errors
function highlightField(fieldId, hasError) {
    const field = document.getElementById(fieldId);
    if (field) {
        if (hasError) {
            field.style.borderColor = '#dc2626';
            field.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
        } else {
            field.style.borderColor = '#e5e7eb';
            field.style.boxShadow = 'none';
        }
    }
}

// ================= UTILITY FUNCTIONS =================
// Get current number of questions
function getCurrentQuestionCount() {
    return questionCount;
}

// Check if max questions reached
function isMaxQuestionsReached() {
    return questionCount >= MAX_QUESTIONS;
}

// Check if min questions reached
function isMinQuestionsReached() {
    return questionCount <= MIN_QUESTIONS;
}