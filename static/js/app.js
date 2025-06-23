class FEASolver {
    constructor() {
        this.isProcessing = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('feaForm');
        const textarea = document.getElementById('problem');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.solveProblem();
        });

        // Auto-resize textarea
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });

        // Enable Enter to submit (Shift+Enter for new line)
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.solveProblem();
            }
        });
    }

    solveProblem() {
        if (this.isProcessing) return;

        const problemText = document.getElementById('problem').value.trim();
        if (!problemText) {
            this.showError('Please enter a problem description');
            return;
        }

        this.isProcessing = true;
        this.showUserMessage(problemText);
        this.showTypingIndicator();
        this.updateSendButton(true);

        // Clear input
        document.getElementById('problem').value = '';
        document.getElementById('problem').style.height = 'auto';
        updateCharCount();

        // Hide welcome section
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('messagesContainer').style.display = 'block';

        // Make request
        fetch('/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem: problemText })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            this.hideTypingIndicator();
            
            if (data.error) {
                this.showError(data.error);
                this.completeProcessing();
                return;
            }
            
            // Show assistant message with results
            this.showAssistantMessage();
            this.addResponseSection('Gemini AI', 'fas fa-robot', data.gemini_response, 'AI Model');
            
            if (data.numerical_value !== null) {
                this.showNumericalResult(data.numerical_value);
            } else {
                this.showAverageError('No valid numeric response found');
            }
            
            this.completeProcessing();
        }).catch(error => {
            console.error('Fetch error:', error);
            this.hideTypingIndicator();
            this.showError('Connection error. Please try again.');
            this.completeProcessing();
        });
    }

    handleStreamData(data) {
        if (data.error) {
            this.hideTypingIndicator();
            this.showError(data.error);
            this.completeProcessing();
            return;
        }

        if (data.status === 'processing') {
            this.updateTypingText(data.message);
        }

        if (data.type === 'gemini_response') {
            this.hideTypingIndicator();
            this.showAssistantMessage();
            this.addResponseSection('Gemini AI', 'fas fa-robot', data.content, 'Model 1');
            this.showTypingIndicator();
        }

        if (data.type === 'openai_response') {
            this.addResponseSection('OpenAI', 'fas fa-brain', data.content, 'Model 2');
        }

        if (data.type === 'average') {
            if (data.error) {
                this.showAverageError(data.error);
            } else {
                this.showAverage(data.value, data.values);
            }
        }

        if (data.status === 'complete') {
            this.hideTypingIndicator();
            this.completeProcessing();
        }
    }

    showUserMessage(text) {
        const messagesContainer = document.getElementById('messagesContainer');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-user slide-up';
        
        messageDiv.innerHTML = `
            <div class="message-content">${this.escapeHtml(text)}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showAssistantMessage() {
        const messagesContainer = document.getElementById('messagesContainer');
        
        // Create unique ID for each response
        const responseId = 'responseContent_' + Date.now();
        
        this.currentAssistantMessage = document.createElement('div');
        this.currentAssistantMessage.className = 'message message-assistant slide-up';
        this.currentAssistantMessage.setAttribute('data-response-id', responseId);
        
        this.currentAssistantMessage.innerHTML = `
            <div class="message-header">
                <i class="fas fa-robot"></i>
                <span>FEA Solver</span>
            </div>
            <div class="message-content">
                <div id="${responseId}" class="response-content-container"></div>
            </div>
        `;
        
        messagesContainer.appendChild(this.currentAssistantMessage);
        this.currentResponseId = responseId;
        this.scrollToBottom();
    }

    addResponseSection(title, icon, content, badge) {
        const responseContent = document.getElementById(this.currentResponseId);
        
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'response-section';
        
        sectionDiv.innerHTML = `
            <div class="response-header">
                <div class="response-title">
                    <i class="${icon}"></i>
                    <span>${title} Response</span>
                </div>
                <span class="response-badge">${badge}</span>
            </div>
            <div class="response-content">${this.escapeHtml(content)}</div>
        `;
        
        responseContent.appendChild(sectionDiv);
        this.scrollToBottom();
    }

    showAverage(value, values) {
        const responseContent = document.getElementById('responseContent');
        
        const averageDiv = document.createElement('div');
        averageDiv.className = 'average-result';
        
        let detailsHtml = '';
        if (values && values.length > 0) {
            detailsHtml = `
                <div class="average-details">
                    Calculated from ${values.length} model response${values.length > 1 ? 's' : ''}: 
                    ${values.map(v => v.toFixed(5)).join(', ')}
                </div>
            `;
        }
        
        averageDiv.innerHTML = `
            <div class="average-value">${value.toFixed(5)}</div>
            <div class="average-label">Average Result</div>
            ${detailsHtml}
        `;
        
        responseContent.appendChild(averageDiv);
        this.scrollToBottom();
    }

    showNumericalResult(value) {
        const responseContent = document.getElementById(this.currentResponseId);
        
        const resultDiv = document.createElement('div');
        resultDiv.className = 'average-result';
        
        resultDiv.innerHTML = `
            <div class="average-value">${value.toFixed(5)}</div>
            <div class="average-label">Numerical Result</div>
            <div class="average-details">
                Final answer from Gemini AI
            </div>
        `;
        
        responseContent.appendChild(resultDiv);
        this.scrollToBottom();
    }

    showAverageError(error) {
        const responseContent = document.getElementById(this.currentResponseId);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${error}</span>
        `;
        
        responseContent.appendChild(errorDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('messagesContainer');
        
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'message message-assistant';
        this.typingIndicator.id = 'typingIndicator';
        
        this.typingIndicator.innerHTML = `
            <div class="message-header">
                <i class="fas fa-robot"></i>
                <span>FEA Solver</span>
            </div>
            <div class="typing-indicator">
                <span id="typingText">Processing your problem...</span>
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(this.typingIndicator);
        this.scrollToBottom();
    }

    updateTypingText(text) {
        const typingText = document.getElementById('typingText');
        if (typingText) {
            typingText.textContent = text;
        }
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
            this.typingIndicator = null;
        }
    }

    showError(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        
        // Hide welcome section if showing
        document.getElementById('welcomeSection').style.display = 'none';
        document.getElementById('messagesContainer').style.display = 'block';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message message-assistant slide-up';
        
        errorDiv.innerHTML = `
            <div class="message-header">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Error</span>
            </div>
            <div class="message-content">
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(errorDiv);
        this.scrollToBottom();
    }

    updateSendButton(isLoading) {
        const sendBtn = document.getElementById('solveBtn');
        
        if (isLoading) {
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    }

    completeProcessing() {
        this.isProcessing = false;
        this.updateSendButton(false);
        this.currentAssistantMessage = null;
    }

    scrollToBottom() {
        const chatContainer = document.querySelector('.chat-container');
        setTimeout(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new FEASolver();
    
    // Set focus on textarea
    document.getElementById('problem').focus();
});

function updateCharCount() {
    const textarea = document.getElementById('problem');
    const charCount = document.getElementById('charCount');
    if (charCount) {
        charCount.textContent = textarea.value.length;
    }
}