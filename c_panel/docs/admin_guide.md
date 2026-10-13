# Jog & Joy Admin Panel: Comprehensive User Guide

Welcome to the Jog & Joy Admin Panel. This document serves as a complete manual for navigating the backend of your e-commerce platform. It details every feature, sub-feature, and the direct impact your actions have on the storefront and your business operations.

---

## 1. Dashboard (`/admin`)
**Purpose**: A high-level, real-time pulse of your store's performance and operational bottlenecks.

- **Global KPIs (Key Performance Indicators)**: View Total Sales, Store Sessions, Orders, and Conversion Rate, complete with percentage changes compared to the previous period.
- **Action Required (To-Do List)**: The system automatically flags urgent tasks requiring your attention:
  - **Pending Orders**: Orders waiting to be packed and shipped.
  - **Low Stock Alerts**: Products that have fallen below their inventory thresholds.
  - **Unresolved Messages**: Customer support tickets awaiting a reply.
  - *Impact*: Clicking any of these alerts takes you directly to the respective module to resolve the issue.
- **Sales Over Time**: A 7-day bar chart visualizing your revenue trend.
- **Recent Activity Feed**: A chronological audit log of everything happening in your store (e.g., new orders placed, shipments dispatched, inventory adjustments, and failed payments).

---

## 2. Products (`/admin/products`)
**Purpose**: Full control over your product catalog and how items are presented to customers.

### List View
- **Tabs & Filters**: Quickly filter products by status: *All, Live, Pending Review, Drafts, Archived, Low Stock, and Out of Stock*.
- **Quick Actions**: Hover over a product to edit, archive, or permanently delete it.

### Edit / Create Product (Sub-Features)
- **General Information**: Set the Product Title, Description, Vendor, and Type.
  - **Publishing Status**: 
    - *Draft*: Hidden from the public while you work on it.
    - *Pending Review*: Requires manager approval before going live.
    - *Live*: Visible and purchasable by customers.
- **Media**: Upload product images (JPG, PNG, WEBP). The first image becomes the main display image.
- **Pricing**: 
  - *Base Price*: What the customer pays.
  - *Compare-at Price*: The original higher price (creates a visually appealing "Strikethrough / Sale" effect).
  - *Cost per Item*: Internal cost to automatically calculate your profit margins.
- **Variants**: Add sizes (e.g., 2-3Y, 4-5Y) and colors. Each variant can have its own SKU and stock level.
- **Inventory Settings**: 
  - *Track Quantity*: Automatically deducts stock when an order is placed.
  - *Allow Backorders*: Allows customers to keep buying even if stock reaches 0.
- **Shipping details**: Define weight and dimensions (crucial for accurate carrier rate calculations at checkout).
- **Organization & SEO**: Assign Categories, Collections, Tags, and customize the Page Title / Meta Description for Google Search rankings.

---

## 3. Orders (`/admin/orders`)
**Purpose**: Track and manage the lifecycle of customer purchases.

- **List View**: Sort orders by lifecycle stage: *Unfulfilled, Processing, Shipped, Delivered, Cancelled, On Hold*.
- **Create Draft Order**: Manually create an order on behalf of a customer (e.g., for B2B sales or phone orders). You can input their email, custom items, pricing, and quantities.
- **Order Detail View**:
  - **Status Management**: Mark an order as *Processing*, *On Hold*, or *Cancelled*.
  - **Fulfillment**: Click "Fulfill Items" to move items from unfulfilled to Shipped.
  - **Refunds**: Issue full or partial refunds directly to the customer's original payment method.
  - **Fraud Analysis**: Visual indicator showing if the transaction is High, Medium, or Low Risk based on payment behavior.
  - **Customer Details**: Quick access to the shipping address and contact email.
  - **Timeline**: An uneditable audit trail of exactly when the order was placed, paid, and shipped.

---

## 4. Inventory (`/admin/inventory`)
**Purpose**: A centralized ledger for multi-location stock management.

- **Stock Overview / Alerts**: A master table showing On Hand, Committed (ordered but not shipped), Available, and Incoming stock.
  - *Impact*: Clicking on any row allows you to perform an instant manual stock adjustment (e.g., if you discover damaged goods).
- **Purchase Orders (POs)**: Draft POs to suppliers (e.g., Acme Corp). Tracks incoming inventory dates.
- **Transfers**: Move stock from one location to another (e.g., Main Warehouse -> Retail Store).
- **Locations & Suppliers**: Manage addresses and contact details for your physical nodes.

---

## 5. Shipping (`/admin/shipping`)
**Purpose**: Streamlined warehouse fulfillment.

- **Fulfillment Queue**: Specifically isolates orders that are paid but not yet packed.
  - *Order Age*: Highlights orders that have been waiting too long (turns Orange at 24 hours, Red at 48 hours).
  - *Pack & Ship Action*: A one-click button that marks the order as Shipped, generates a mockup tracking number (AWB), and removes it from the queue.
- *(Future Modules)*: Shipping Zones & Rates, Carrier integrations, and standard Packaging dimensions.

---

## 6. Promotions (`/admin/promotions`)
**Purpose**: Configure discounts and sales campaigns.

- **Discount Types**: 
  - *Percentage* (e.g., 20% off)
  - *Fixed Amount* (e.g., ₹500 off)
  - *Free Shipping*
  - *Buy X Get Y*
- **Application Method**:
  - *Discount Code*: Customer must type a code (e.g., SUMMER20) at checkout.
  - *Automatic*: Applies seamlessly at checkout without a code.
- **Applies To**: Restrict the promotion to the Entire Order, Specific Collections, or Specific Products.
- **Status Toggle**: Instantly pause a promotion by toggling it to "Inactive".

---

## 7. Reviews (`/admin/reviews`)
**Purpose**: Protect your brand image and engage with customer feedback.

- **Moderation Queue**: Read through new reviews left by customers.
- **Actions**:
  - *Approve*: Pushes the review live to the storefront product page.
  - *Reject*: Hides the review (useful for inappropriate content).
  - *Mark as Spam*: Flags the reviewer.
- **Merchant Reply**: Once a review is approved, you can write a public response (e.g., "Thank you for your purchase!" or addressing a concern). This builds public trust.

---

## 8. Messages (`/admin/messages`)
**Purpose**: A centralized inbox for customer support.

- **Ticketing System**: Filter conversations by Open, Pending, or Resolved. Agents can click "Assign to me" to claim a ticket.
- **Conversation Interface**: 
  - Chat bubbles clearly distinguish between customer inquiries and agent replies.
  - **Internal Notes**: Toggle "Internal Note" to leave a private, yellow-highlighted message for other staff members. The customer will *never* see this.
  - **Canned Responses**: Quickly insert pre-written templates for common questions to save time.

---

## 9. Analytics (`/admin/analytics`)
**Purpose**: Data-driven insights to guide business decisions.

- **Time Periods**: Filter data by Today, Last 7 Days, Last 30 Days, This Year, or All Time.
- **Global Metrics**: Deep dive into Total Revenue, Average Order Value, Conversion Rates, and Returning Customer Rates.
- **Reports**:
  - *Sales*: Bar charts showing day-by-day revenue, plus a breakdown of Online vs Point-of-Sale.
  - *Products*: Identifies your best-sellers by Units Sold and Revenue generated.
  - *Acquisition*: Shows where traffic is coming from (Direct, Organic Google Search, Social Media).
- **Export**: Download any report as a CSV file for Excel/Accounting software.

---

## 10. Financials (`/admin/financials`)
**Purpose**: Financial ledger tracking money in and out.

- **Transactions Log**: View the exact Gross and Net amounts for every individual order and refund.
- **Payout Schedule**: See when your aggregated funds will be deposited into your bank account.
- **Taxes**: Tracks your tax liability (Sales Subject to Tax vs Tax Collected) broken down by region (e.g., State/Country).
- **Fees & Expenses**: Transparent breakdown of Payment Gateway transaction fees and monthly platform subscriptions.

---

## 11. Settings (`/admin/settings`)
**Purpose**: Master configuration for how the store behaves.

- **General Details**: Set Store Name, Contact Email, Currency, Timezone, and unit metrics (kg vs lbs, cm vs inches).
- **Admin Automation**: 
  - Toggle *Auto-Approve Products* to bypass the "Pending Review" state.
  - Toggle *Auto-Approve Reviews* if you prefer not to manually moderate feedback.
- **Checkout Rules**: 
  - Toggle whether Guest Checkout is allowed (or if users must create an account).
  - Define the time window (in hours) a customer has to edit their order before it locks.
  - Set how many hours pass before an Abandoned Cart email is triggered.
- **Taxes**: Decide whether your listed prices are *Tax Inclusive* or *Tax Exclusive* (added at checkout), and set the global Base Tax Rate percentage.

---

### End of Guide
By mastering these modules, you will have complete command over the Jog & Joy platform's operations, marketing, and fulfillment workflows.
