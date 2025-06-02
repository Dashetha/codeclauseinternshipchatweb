document.addEventListener('DOMContentLoaded', () => {
    // Initialize Socket.IO connection
    const socket = io();

    // Get DOM elements
    const chatApp = new ChatApp(socket);
});

class ChatApp {
    constructor(socket) {
        this.socket = socket;
        this.currentUser = null;
        this.currentRoom = 'general';
        this.users = new Map();
        this.messages = [];
        this.isTyping = false;
        this.typingTimeout = null;
        this.isAtBottom = true;

        this.initializeElements();
        this.attachEventListeners();
        this.checkMobileView();
        this.setupSocketListeners();
        
        // Simulate some initial users for demo
        this.addUser('Alice', 'alice123');
        this.addUser('Bob', 'bob456');
        this.addUser('Charlie', 'charlie789');
    }

    initializeElements() {
        // Your existing initialization code
        // Landing page elements
        this.landingPage = document.getElementById('landingPage');
        this.joinForm = document.getElementById('joinForm');
        this.usernameInput = document.getElementById('username');
        this.roomSelect = document.getElementById('roomSelect');
        this.customRoomGroup = document.getElementById('customRoomGroup');
        this.customRoomInput = document.getElementById('customRoom');
        this.joinBtn = document.getElementById('joinBtn');

        // Chat elements
        this.chatContainer = document.getElementById('chatContainer');
        this.currentRoomElement = document.getElementById('currentRoom');
        this.roomStatusElement = document.getElementById('roomStatus');
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.usersList = document.getElementById('usersList');
        this.userCountElement = document.getElementById('userCount');
        this.leaveBtn = document.getElementById('leaveBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.scrollBottomBtn = document.getElementById('scrollBottomBtn');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.typingText = document.getElementById('typingText');
        this.emojiBtn = document.getElementById('emojiBtn');
        this.toastContainer = document.getElementById('toastContainer');

        // Mobile elements
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.chatSidebar = document.getElementById('chatSidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
    }

    setupSocketListeners() {
        // Listen for chat messages from server
        this.socket.on('chat message', (msg) => {
            this.addMessage({
                id: 'msg_' + Date.now(),
                text: msg,
                author: 'User', // In a real app, this would come from the server
                authorId: 'server_user',
                timestamp: new Date(),
                room: this.currentRoom
            });
        });

        // Listen for typing events
        this.socket.on('typing', () => {
            this.typingText.textContent = 'Someone is typing';
            this.typingIndicator.classList.add('active');
        });

        this.socket.on('stop typing', () => {
            this.typingIndicator.classList.remove('active');
        });
    }

    attachEventListeners() {
        // Your existing event listeners
        // Landing page events
        this.joinForm.addEventListener('submit', this.handleJoinRoom.bind(this));
        this.roomSelect.addEventListener('change', this.handleRoomSelectChange.bind(this));

        // Chat events
        this.sendBtn.addEventListener('click', this.sendMessage.bind(this));
        this.messageInput.addEventListener('keydown', this.handleMessageKeydown.bind(this));
        this.messageInput.addEventListener('input', this.handleTyping.bind(this));
        this.leaveBtn.addEventListener('click', this.leaveRoom.bind(this));
        this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        this.scrollBottomBtn.addEventListener('click', this.scrollToBottom.bind(this));
        this.emojiBtn.addEventListener('click', this.toggleEmojiPicker.bind(this));

        // Mobile events
        this.mobileMenuBtn.addEventListener('click', this.toggleMobileSidebar.bind(this));
        this.sidebarOverlay.addEventListener('click', this.closeMobileSidebar.bind(this));

        // Scroll detection
        this.chatMessages.addEventListener('scroll', this.handleScroll.bind(this));

        // Window resize
        window.addEventListener('resize', this.checkMobileView.bind(this));
    }

    sendMessage() {
        const messageText = this.messageInput.value.trim();
        if (!messageText) return;

        // Emit the message to the server
        this.socket.emit('chat message', messageText);

        // Add message to UI (for the sender)
        const message = {
            id: 'msg_' + Date.now(),
            text: messageText,
            author: this.currentUser ? this.currentUser.name : 'You',
            authorId: this.currentUser ? this.currentUser.id : 'self',
            timestamp: new Date(),
            room: this.currentRoom,
            isSelf: true
        };

        this.addMessage(message);
        this.messageInput.value = '';
        this.adjustTextareaHeight();
        this.scrollToBottom(true);

        // Stop typing indicator
        this.socket.emit('stop typing');
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing');
        }
        
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.socket.emit('stop typing');
        }, 1000);
        
        this.adjustTextareaHeight();
    }

    // Your other existing methods
    // ...
}

// Initialize theme based on localStorage
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = savedTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
});