// La Maison du Levain - Main Script

document.addEventListener('DOMContentLoaded', () => {
    initChatWidget();
    initScrollEffects();
});

/* --- Header Scroll Effect --- */
function initScrollEffects() {
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* --- Chat Widget Logic --- */
function initChatWidget() {
    const chatButton = document.getElementById('chat-button');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('chat-messages');

    let isOpen = false;
    let sessionId = null;

    // Toggle Chat
    chatButton.addEventListener('click', () => {
        isOpen = !isOpen;
        chatWindow.style.display = isOpen ? 'flex' : 'none';
        if (isOpen) {
            chatInput.focus();
            chatWindow.style.animation = 'none';
            chatWindow.offsetHeight; /* trigger reflow */
            chatWindow.style.animation = 'openChat 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        }
    });

    // Send Message Function
    async function sendMessage() {
        const msg = chatInput.value.trim();
        if (!msg) return;

        // Add User Message
        addMessage(msg, 'user');
        chatInput.value = '';

        // Create Bot Message Container
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'msg bot';
        messagesContainer.appendChild(botMsgDiv);
        scrollToBottom();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: msg,
                }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);

                        if (data.session_id) {
                            sessionId = data.session_id;
                        }

                        if (data.token) {
                            botMsgDiv.innerText += data.token;
                            scrollToBottom();
                        }

                        if (data.error) {
                            botMsgDiv.innerText += " [Erreur: " + data.error + "]";
                        }
                    } catch (e) {
                        console.error("Error parsing JSON chunk", e);
                    }
                }
            }

        } catch (err) {
            botMsgDiv.innerText = 'Erreur de connexion.';
            console.error(err);
        }
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Helper: Add Message
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `msg ${sender}`;
        div.innerText = text;
        messagesContainer.appendChild(div);
        scrollToBottom();
    }

    // Helper: Scroll to Bottom
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
