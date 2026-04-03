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

// *** Your Updated UPI Information ***
const MY_UPI_ID = "9421864709@upi"; 
const MY_NAME = "Sumit Rathod";

// Event Listeners
addBtn.addEventListener('click', addExpense);
friendCountInput.addEventListener('input', updateCalculations);
decreaseBtn.addEventListener('click', decreaseFriendCount);
increaseBtn.addEventListener('click', increaseFriendCount);
payBox.addEventListener('click', openQRModal);
closeBtn.addEventListener('click', closeQRModal);

// Allow Enter key to add expense
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

// Close modal if user clicks outside of it
window.addEventListener('click', (event) => {
    if (event.target === qrModal) {
        closeQRModal();
    }
});

function decreaseFriendCount() {
    let current = parseInt(friendCountInput.value);
    if (current > 1) {
        friendCountInput.value = current - 1;
        updateCalculations();
    }
}

function increaseFriendCount() {
    let current = parseInt(friendCountInput.value);
    friendCountInput.value = current + 1;
    updateCalculations();
}

function addExpense() {
    let name = expenseNameInput.value.trim();
    const amount = parseFloat(expenseAmountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0.');
        expenseAmountInput.focus();
        return;
    }

    if (name === '') {
        name = `Expense ${defaultNameCounter}`;
        defaultNameCounter++;
    }

    expenses.push({ name, amount });

    expenseNameInput.value = '';
    expenseAmountInput.value = '';
    expenseNameInput.focus();

    renderList();
    updateCalculations();
}

function renderList() {
    if (expenses.length === 0) {
        expenseList.innerHTML = `
            <li class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No expenses added yet</p>
                <span>Start by adding your first expense above</span>
            </li>
        `;
        return;
    }

    expenseList.innerHTML = '';
    expenses.forEach((expense, index) => {
        const li = document.createElement('li');
        
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
    totalAmountDisplay.textContent = `₹${totalSum.toFixed(2)}`;

    let friends = parseInt(friendCountInput.value);
    if (isNaN(friends) || friends < 1) {
        friends = 1;
    }

    currentPerPerson = totalSum / friends;
    perPersonAmountDisplay.textContent = `₹${currentPerPerson.toFixed(2)}`;
}

// --- QR CODE GENERATION LOGIC ---

function openQRModal() {
    if (currentPerPerson <= 0) {
        alert("Add some expenses first!");
        return;
    }

    // Format the amount to 2 decimal places as required by UPI
    const finalAmount = currentPerPerson.toFixed(2);
    
    // Create the UPI Deep Link
    // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR
    const upiString = `upi://pay?pa=${MY_UPI_ID}&pn=${MY_NAME}&am=${finalAmount}&cu=INR`;
    
    // Use a free API to convert the UPI string into a QR code image
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
    
    // Update the modal content
    qrImage.src = qrApiUrl;
    modalAmountDisplay.textContent = `₹${finalAmount}`;
    
    // Show the modal
    qrModal.style.display = 'flex';
}

function closeQRModal() {
    qrModal.style.display = 'none';
}
