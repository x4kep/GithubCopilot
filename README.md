# Income Expense Tracker

Track your monthly income, expenses, and loan payments with visual progress indicators.

## Features

- 📊 Monthly income and expense tracking
- 💰 Loan management with overpayment tracking
- 📈 Visual progress bars for loan payoff
- 💶 Euro currency support
- 📅 Multi-year data storage
- 📱 Responsive design

## Getting Started

### Installation

```bash
npm install
```

### Running the Application

Open `index.html` in your browser or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (http-server)
npx http-server
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Project Structure

```
BasicFE/
├── assets/           # Images and static files
├── components/       # Web Components
├── services/         # Business logic and data management
├── utils/            # Utility functions
├── tests/            # Unit tests
├── styles.css        # Global styles
├── script.js         # Application constants
└── index.html        # Main HTML file
```

## Testing

The project uses Jest for unit testing. Tests cover:

- **Utility Functions**: Currency formatting, validation, rounding
- **Loan Service**: Payment calculations, balance tracking, overpayments
- **Data Service**: Storage operations, data persistence

Test coverage reports are generated in the `coverage/` directory.

## Technologies

- Vanilla JavaScript (ES6+)
- Web Components
- Bootstrap 5
- Chart.js
- Jest (Testing)

## License

MIT
