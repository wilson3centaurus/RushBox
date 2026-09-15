# RushBox — Project Overview

RushBox is one app, two products:

1. **RushBox Groceries** — Blinkit-style dark store model. RushBox owns the inventory and warehouses (groceries, medicine, essentials) and delivers fast. Not a marketplace of third-party shops — it's our stock, our pricing, our quality control.
2. **RushBox Move** — inDrive-style marketplace connecting people who need something transported or bought with independent transporters/runners who bid a fair price. Born from getting quoted $50 for a short pallet haul from Electrosales with zero competition — Move fixes that by letting multiple transporters bid on the job.

**Objective:** Be the app people open both for "I need milk in 20 minutes" and "I need these pallets moved / this parcel sent / this shopping list bought — at a fair, competitive price."

---

## RushBox Move — job types

All three run on the same bidding marketplace (post job → nearby transporters/runners bid → customer picks one):

- **Cargo/Goods Transport** — bulky items, building materials, furniture, hardware store runs (the pallets use case). Customer specifies pickup, drop-off, item description/photos, vehicle type needed (bakkie, truck, van).
- **Parcel Delivery** — smaller point-to-point courier jobs, lighter vehicles (bike/car), quicker turnaround.
- **Buy-For-Me (Errand)** — customer doesn't have the goods yet. They specify the shop, its location, the items wanted, and a budget. A runner buys the items and delivers them. Customer reimburses the purchase cost plus a service fee (needs a receipt-upload step and an escrow/pre-funded wallet so the runner isn't out of pocket).

---

## Feature List by Role

### 🔑 Shared / Core
- Signup/Login (phone OTP primary, email + Google optional)
- Unified profile (one account for Groceries and Move)
- Home screen with entry points: **Order Groceries** / **Move Goods**
- Notifications (push, SMS, in-app)
- Payments: mobile money (EcoCash etc.), card, cash-on-delivery/handover
- Wallet + transaction history (also holds pre-funded escrow for Buy-For-Me jobs)
- Ratings & reviews (products, riders, transporters/runners)
- Support/help chat

### 🛒 Customer — Groceries side
- Browse categories, search, product detail pages
- Cart, checkout, delivery address book, delivery slots
- Live order tracking (map + rider ETA)
- Order history / reorder
- Promotions & coupons

### 🚚 Customer — Move side
- Post a job, choosing type: Cargo / Parcel / Buy-For-Me
  - Cargo & Parcel: pickup/drop-off location, description, photos, size/weight, vehicle type
  - Buy-For-Me: shop name/location, item list, budget, delivery address
- Receive live bids from nearby transporters/runners
- Compare bids by price, rating, ETA; accept one
- In-app chat/call with transporter/runner
- Live GPS tracking
- Counter-offer / negotiate price
- Receipt upload & reimbursement confirmation (Buy-For-Me)
- Rate transporter/runner, trip history

### 🚛 Transporter/Runner App
- Signup + verification (ID, vehicle docs/photos, vehicle type & capacity — not needed for on-foot runners)
- Online/offline availability toggle
- See nearby job requests by type, submit bids
- Accept job → navigate → mark picked up/bought/delivered
- Upload purchase receipt & request reimbursement (Buy-For-Me)
- Earnings dashboard & payout history
- Customer ratings

### 🏬 Dark Store Ops (Groceries fulfillment — RushBox-owned)
- Inventory management (stock levels, restock alerts, per-store)
- Order fulfillment queue (pick & pack)
- Assign delivery rider
- Delivery rider app (lightweight: accept job, navigate, mark delivered)

### 🛠 Admin Dashboard (RushBox HQ)
- Analytics overview (orders, GMV, active users/transporters, both product lines)
- User management (customers, transporters/runners, dark store staff, riders)
- Inventory & pricing management across dark stores
- Live order/job monitoring map (Groceries + Move, all job types)
- Transporter/runner verification & approval queue
- Commission & pricing rules (delivery fees, Move platform cut)
- Promotions/coupon management
- Disputes/support ticket handling (esp. Buy-For-Me reimbursement disputes)
- Reports & exports
