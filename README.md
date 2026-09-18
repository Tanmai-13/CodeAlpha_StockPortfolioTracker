# Portfolio Companion

Build a complete, modern single-page Stock Portfolio Tracker web application named "CodeAlpha Stock Portfolio Tracker" for CodeAlpha Python Programming Internship – Task 2.

Styling & Theme:
- Dark navy and slate blue background theme with cyan and emerald green accents.
- Modern glassmorphism cards (subtle border, backdrop-blur), clean typography, Lucide icons, responsive layout across mobile, tablet, and desktop.
- Currency display in Indian Rupees (₹).

Core Data & Logic:
- Predefined sample stock dictionary (no external APIs, clearly labeled as fictional sample prices):
  * AAPL: ₹180
  * TSLA: ₹250
  * MSFT: ₹350
  * GOOGL: ₹140
  * AMZN: ₹180
- LocalStorage persistence: Save portfolio items so they persist across refreshes, load safely on mount, handle empty/invalid data gracefully.
- Calculations: Total Investment = sum(Price * Quantity), Total Stocks = count of entries, Total Quantity = sum(Quantity).

Page Sections & Components:
1. Navigation Bar:
   - Brand logo & title: "PortfolioTrack" with subtitle "Stock Portfolio Tracker".
   - Links: Dashboard, Portfolio, About (with mobile responsive drawer/menu).
2. Dashboard Header:
   - Title: "My Investment Portfolio"
   - Subtitle: "Track your sample stock investments with ease."
   - Badge: "Demo Portfolio • Sample Prices"
   - Action Button: "+ Add Investment" (smoothly scrolls to or opens the Add Stock form).
3. Summary Cards (4 cards):
   - Total Investment (₹ format)
   - Total Stocks (count of entries)
   - Total Quantity (sum of quantities)
   - Portfolio Status ("Active" when items exist, "Empty" when zero)
4. Add Stock Form ("Add Stock Investment"):
   - Dropdown selection for predefined stocks (AAPL, TSLA, MSFT, GOOGL, AMZN).
   - Quantity input (positive whole integers only, with validation message).
   - Read-only Sample Price field showing selected stock's price clearly labeled "Sample Price".
   - Calculated Total Value preview (Quantity * Sample Price in ₹).
   - "Add Stock" and "Clear Form" buttons. Validation prevents invalid submissions.
5. Portfolio Table ("My Stock Holdings"):
   - Columns: Stock Symbol, Sample Price, Quantity, Total Value, Actions.
   - Clean empty state illustration/message when no stocks exist.
   - Delete button per row with a confirmation modal/dialog before deleting.
   - Total row at the bottom.
6. Action Buttons & Export:
   - "Download CSV": Generates and downloads `portfolio_tracker.csv` with Stock Symbol, Sample Price, Quantity, Total Value. User-friendly notice if empty.
   - "Clear Portfolio": Confirmation dialog to wipe portfolio from LocalStorage and reset state.
7. Toast Notifications:
   - Feedback on stock added, stock deleted, CSV downloaded, portfolio cleared, and validation errors.
8. About Section:
   - "About This Project"
   - Text: "This Stock Portfolio Tracker is developed as a beginner-friendly project for the CodeAlpha Python Programming Internship – Task 2. It demonstrates investment calculations, predefined stock data, form handling, data storage, and CSV export."
   - Explicit disclaimers that this is an educational demo and does not provide live market data or financial advice.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f8c34f96-9434-4826-97b0-7377b93ad437).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
