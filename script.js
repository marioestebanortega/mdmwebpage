document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-overlay');
    const body = document.body;

    // Función para alternar el menú
    const toggleMenu = () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        navOverlay.classList.toggle('active');
        body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    };

    // Event listeners
    menuToggle.addEventListener('click', toggleMenu);
    navOverlay.addEventListener('click', toggleMenu);

    // Cerrar menú al hacer clic en un enlace
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Cerrar menú al redimensionar la ventana
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Funcionalidad del Chat IA
    const chatFloatButton = document.getElementById('chatFloatButton');
    const chatModal = document.getElementById('chatModal');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    let sessionId = 'sess-' + Math.random().toString(36).substr(2, 9);

    // Abrir modal del chat
    chatFloatButton.addEventListener('click', () => {
        chatModal.classList.add('active');
        chatInput.focus();
    });

    // Cerrar modal del chat
    chatCloseBtn.addEventListener('click', () => {
        chatModal.classList.remove('active');
    });

    // Cerrar modal al hacer clic fuera
    chatModal.addEventListener('click', (e) => {
        if (e.target === chatModal) {
            chatModal.classList.remove('active');
        }
    });

    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && chatModal.classList.contains('active')) {
            chatModal.classList.remove('active');
        }
    });

    // Función para agregar mensaje del usuario
    const addUserMessage = (text) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        // Procesar Markdown si existe
        if (text.includes('**') || text.includes('*') || text.includes('`') || text.includes('#') || text.includes('-') || text.includes('[')) {
            messageDiv.innerHTML = `<div class="markdown-content">${marked.parse(text)}</div>`;
        } else {
            messageDiv.innerHTML = `<p>${text}</p>`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Función para agregar mensaje del bot
    const addBotMessage = (text) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Procesar Markdown si existe
        if (text.includes('**') || text.includes('*') || text.includes('`') || text.includes('#') || text.includes('-') || text.includes('[')) {
            messageDiv.innerHTML = `<div class="markdown-content">${marked.parse(text)}</div>`;
        } else {
            messageDiv.innerHTML = `<p>${text}</p>`;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Función para enviar mensaje al webhook
    const sendMessageToWebhook = async (text) => {
        try {
            const response = await fetch('https://n8n.mdmsolutions.co/webhook/5d02c33c-9d62-4133-be0a-8e247f2186c6', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    sessionId: sessionId
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                // Intentar mostrar la respuesta real del webhook
                if (data && data.reply) {
                    addBotMessage(data.reply);
                } else if (data && data.response) {
                    addBotMessage(data.response);
                } else if (data && data.message) {
                    addBotMessage(data.message);
                } else if (data && typeof data === 'string') {
                    addBotMessage(data);
                } else {
                    addBotMessage('Mensaje recibido. Procesando respuesta...');
                }
            } else {
                addBotMessage(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            addBotMessage('Lo siento, hubo un error de conexión. Por favor, inténtalo de nuevo.');
        }
    };

    // Event listener para el botón de enviar
    sendButton.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (message) {
            addUserMessage(message);
            chatInput.value = '';
            sendMessageToWebhook(message);
        }
    });

    // Event listener para la tecla Enter
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const message = chatInput.value.trim();
            if (message) {
                addUserMessage(message);
                chatInput.value = '';
                sendMessageToWebhook(message);
            }
        }
    });
}); 