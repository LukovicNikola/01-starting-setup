import './ExpenseItem.css';

function ExpenseItem() {
    const expenseDateDay = new Date().getDay();
    const expenseDateMonth = new Date().getMonth();
    const expenseDateYear = new Date().getFullYear();
    const expenseTitle = 'Car Insurance';
    const expenseAmount = 255.55;

    return (
        <div className="expense-item">
            <div>{expenseDateDay}.{expenseDateMonth}.{expenseDateYear}</div>
            <div className="expense-item__description">
                <h2 className="expense-item h2">{expenseTitle}</h2>
            </div>
            <div className="expense-item__price">${expenseAmount}</div>
        </div>
    );
}

export default ExpenseItem;