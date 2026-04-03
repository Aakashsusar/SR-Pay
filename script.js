// SR-Pay - Smart Money Splitting App
// Get DOM Elements
const expenseNameInput = document.getElementById('expenseName');
const expenseAmountInput = document.getElementById('expenseAmount');
const addBtn = document.getElementById('addBtn');
const expenseList = document.getElementById('expenseList');
const totalAmountDisplay = document.getElementById('totalAmount');
const friendCountInput = document.getElementById('friendCount');
const perPersonAmountDisplay = document.getElementById('perPersonAmount');

// Counter buttons
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');

// Modal Elements
const payBox = document.getElementById('payBox');
const qrModal = document.getElementById('qrModal');
const closeBtn = document.querySelector('.close-btn');
const qrImage = document.getElementById('qrImage');
const modalAmountDisplay = document.getElementById('modalAmountDisplay');

// State Variables
let expenses = [];
let defaultNameCounter = 1;
let currentPerPerson = 0;

// UPI Configuration
const MY_UPI_ID = "9421864709@upi"; 
const MY_NAME = "Sumit Rathod";

// Event Listeners
addBtn.addEventListener('click', addExpense);
friendCountInput.addEventListener('input', updateCalculations);
decreaseBtn.addEventListener('click', decreaseFriendCount);
increaseBtn.addEventListener('click', increaseFriendCount);
payBox.addEventListener('click', openQRModal);
closeBtn.addEventListener('click', closeQRModal);

// Keyboard shortcuts
expenseAmountInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addExpense();
    }
});

expenseNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addExpense();
    }
});

// Close modal on outside click
window.addEventListener('click', (event) => {
    if (event.target === qrModal) {
        closeQRModal();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    updateCalculations();
    expenseNameInput.focus();
});

function decreaseFriendCount() {
    let current = parseInt(friendCountInput.value);
    if (current > 1) {
        friendCountInput.value = current - 1;
        updateCalculations();
        animateCounter();
    }
}

function increaseFriendCount() {
    let current = parseInt(friendCountInput.value);
    if (current < 50) { // Reasonable limit
        friendCountInput.value = current + 1;
        updateCalculations();
        animateCounter();
    }
}

function animateCounter() {
    const counterDisplay = document.querySelector('.counter-display');
    counterDisplay.style.transform = 'scale(1.1)';
    setTimeout(() => {
        counterDisplay.style.transform = 'scale(1)';
    }, 150);
}

function addExpense() {
    let name = expenseNameInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);

    // Validation
    if (isNaN(amount) || amount <= 0) {
        showError('Please enter a valid amount greater than 0');
        expenseAmountInput.focus();
        return;
    }

    if (amount > 1000000) {
        showError('Amount cannot exceed ₹10,00,000');
        expenseAmountInput.focus();
        return;
    }

    if (name === '') {
        name = `Expense ${defaultNameCounter}`;
        defaultNameCounter++;
    }

    // Add expense with animation
    expenses.push({ 
        id: Date.now(),
        name, 
        amount,
        timestamp: new Date()
    });

    // Clear inputs
    expenseNameInput.value = '';
    expenseAmountInput.value = '';
    expenseNameInput.focus();

    // Update UI
    renderList();
    updateCalculations();
    
    // Success feedback
    showSuccess('Expense added successfully!');
}

function showError(message) {
    // Simple error feedback - you can enhance this with toast notifications
    const addBtn = document.getElementById('addBtn');
    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
    addBtn.style.background = '#ea4335';
    
    setTimeout(() => {
        addBtn.innerHTML = originalText;
        addBtn.style.background = '';
    }, 2000);
    
    console.error(message);
}

function showSuccess(message) {
    const addBtn = document.getElementById('addBtn');
    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = '<i class="fas fa-check"></i> Added';
    
    setTimeout(() => {
        addBtn.innerHTML = originalText;
    }, 1500);
    
    console.log(message);
}

function renderList() {
    if (expenses.length === 0) {
        expenseList.innerHTML = `
            <li class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-receipt"></i>
                </div>
                <p>No expenses yet</p>
                <span>Add your first expense to get started</span>
            </li>
        `;
        return;
    }

    expenseList.innerHTML = '';
    
    // Sort expenses by timestamp (newest first)
    const sortedExpenses = [...expenses].sort((a, b) => b.timestamp - a.timestamp);
    
    sortedExpenses.forEach((expense, index) => {
        const li = document.createElement('li');
        li.style.animationDelay = `${index * 0.1}s`;
        li.classList.add('expense-item');
        
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('expense-name');
        nameSpan.textContent = expense.name;
        
        const amountSpan = document.createElement('span');
        amountSpan.classList.add('expense-amount');
        amountSpan.textContent = `₹${expense.amount.toFixed(2)}`;

        li.appendChild(nameSpan);
        li.appendChild(amountSpan);
        
        expenseList.appendChild(li);
    });
}

function updateCalculations() {
    const totalSum = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    totalAmountDisplay.textContent = `₹${formatAmount(totalSum)}`;

    let friends = parseInt(friendCountInput.value);
    if (isNaN(friends) || friends < 1) {
        friends = 1;
        friendCountInput.value = 1;
    }

    currentPerPerson = totalSum / friends;
    perPersonAmountDisplay.textContent = `₹${formatAmount(currentPerPerson)}`;
    
    // Update payment button state
    const paymentBtn = document.getElementById('payBox');
    if (currentPerPerson > 0) {
        paymentBtn.style.opacity = '1';
        paymentBtn.style.pointerEvents = 'auto';
    } else {
        paymentBtn.style.opacity = '0.6';
        paymentBtn.style.pointerEvents = 'none';
    }
}

function formatAmount(amount) {
    if (amount >= 10000000) { // 1 crore
        return `${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) { // 1 lakh
        return `${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) { // 1 thousand
        return `${(amount / 1000).toFixed(1)}K`;
    } else {
        return amount.toFixed(2);
    }
}

function openQRModal() {
    if (currentPerPerson <= 0) {
        showError("Add some expenses first!");
        return;
    }

    // Format the amount to 2 decimal places
    const finalAmount = currentPerPerson.toFixed(2);
    
    // Create UPI Deep Link
    const upiString = `upi://pay?pa=${MY_UPI_ID}&pn=${encodeURIComponent(MY_NAME)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent('SR-Pay Split Payment')}`;
    
    // Generate QR code using API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&data=${encodeURIComponent(upiString)}`;
    
    // Update modal content
    qrImage.src = qrApiUrl;
    modalAmountDisplay.textContent = `₹${finalAmount}`;
    
    // Show modal with animation
    qrModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Track QR generation (you can add analytics here)
    console.log('QR Code generated for amount:', finalAmount);
}

function closeQRModal() {
    qrModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Add some CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    .expense-item {
        animation: slideInRight 0.3s ease-out forwards;
        opacity: 0;
        transform: translateX(20px);
    }
    
    @keyframes slideInRight {
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .counter-display {
        transition: transform 0.15s ease;
    }
`;
document.head.appendChild(style);

// Service Worker registration for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
