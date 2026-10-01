# How RushBox operates

The interactive 3D version is in the admin dashboard → **System map**
(`/admin/system`). This is the same content as plain text for the team; the
words for both live in `components/system-map/content.ts`.

## Who's who

| Player | Ours? | App | Money |
|---|---|---|---|
| **RushBox HQ (Robokorda)** | Yes | RushBox Admin (website) | Earns margin, delivery fees, commission |
| **Dark stores** | Yes — and the stock in them | RushBox Store (tablet) | Cost: rent, staff, stock |
| **Customers** | — | RushBox (Android, iPhone, web) | Pay by EcoCash, card or cash |
| **Suppliers** | No | None — purchase orders by email/WhatsApp | Paid on invoice, 7–30 days |
| **Grocery riders** | No — independent, own bikes | RushBox Partner, Rider mode | Fixed fee per drop + per km + tips, weekly |
| **Move drivers** | No — independent, own vehicles | RushBox Partner, Move mode | Agreed price minus commission |
| **Any shop** (Buy-For-Me) | No | None | Runner pays with the customer's prepaid budget |

## Who delivers groceries

Independent riders on **motorbikes and scooters** (bicycles for very short
hops). No bidding: a grocery order has a 20-minute promise, so it is *offered*
to the nearest online rider at a fixed payout the moment the store receives
it, and they arrive as packing finishes. A few anchor riders get a guaranteed
minimum at peak hours so there is always cover.

## A grocery order

| Step | Who | Time |
|---|---|---|
| 1. Customer pays (or picks cash) | Customer | 0:00 |
| 2. Store receives it; nearest rider gets the offer | Store tablet | 0:00 |
| 3. Pick — scan each item | Picker | 0:01–0:04 |
| 4. Check — every item scanned again | Checker | 0:04–0:05 |
| 5. Pack — cold items apart, sealed, QR label | Packer | 0:05–0:06 |
| 6. Final check, ready shelf; rider scans QR to collect | Dispatcher | 0:06–0:08 |
| 7. Ride, tracked live | Rider | 0:08–0:20 |
| 8. Handover only with the customer's 4-digit PIN | Rider + customer | ~0:20 |

Delivery fees are set in **Admin → Pricing & delivery**: the base fee, when
it is free (over a basket size, first order, promo dates), small-basket and
late-night fees, and the delivery radius.

## RushBox Move pricing

Not a flat fee — it overcharges short trips and underpays long ones, so drivers
ignore those jobs. The system **suggests** a price, then it works like inDrive:

1. Suggested = vehicle base fare + per-km rate + weight over 100 kg + helpers.
   The pallet job (12 km, bakkie, 400 kg, one helper) comes to about **$34**.
2. The customer may offer 20% below to 50% above that. Offers under the cost
   floor are blocked.
3. Only verified drivers nearby with a big enough vehicle see the job.
4. Each driver accepts, or sends one counter-offer. Offers expire after 60
   seconds; the customer sees the best five.
5. The customer picks one; every other offer is declined automatically. No
   offers in 3 minutes → the app suggests raising the price 10%.
6. At pickup the driver photographs the load; both confirm the count.
7. Delivery is confirmed with a PIN; both sides rate each other.

## Cash on delivery

**Quick-commerce apps like Blinkit:** the rider never hands over the bag before
payment. A refused order goes back to the store, and customers who refuse lose
the cash option; cash is also capped by order value and history.

**inDrive:** passengers pay the driver directly; inDrive takes its commission
from the driver's in-app balance, and non-payers are reported and blocked.

**RushBox:**

- Groceries: no payment, no handover. The rider marks it refused (photo, GPS),
  support calls within 2 minutes, and the order returns to the store. The rider
  is still paid. Cash is switched off for that customer with a failed-delivery
  fee on their next order; repeat refusals suspend the account.
- New customers get cash only up to a limit; ID-verified customers get more.
- Move: the transport fee is paid by EcoCash at booking and held until
  delivery, or in cash at pickup — drivers never carry goods on credit.
  Buy-For-Me budgets are always prepaid.
- Cash jobs: the driver keeps the cash and the commission comes off their
  partner wallet; a negative wallet must be topped up before more cash jobs.

## How we make money

- **Grocery margin** — we buy wholesale and sell retail, about 20% gross.
- **Delivery fees** — mostly pass through to riders.
- **Move commission** — 12% by default (Admin → Pricing & delivery).
- **Buy-For-Me service fee** — 10% of the shopping budget.
- Later: brands paying for promoted spots, and a free-delivery subscription.

On a $20 basket the customer pays $21.50; about $15.60 goes to suppliers, $1.20
to the rider, $1.80 to store and staff costs, and roughly $2.40 is profit. On
the $34 pallet job the driver keeps about $30.

## The HQ team

Partner recruiter (signs up and verifies riders and drivers) · customer support
· ops monitor (watches live orders and jobs) · procurement · finance (payouts,
cash reconciliation) · marketing. Each dark store has a manager, pickers, a
checker, a packer and a dispatcher.
