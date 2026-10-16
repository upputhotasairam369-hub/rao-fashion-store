# RAO'S THRIFT — CLIENT HANDOVER & PRODUCTION GUIDE

> **Brand:** RAO'S THRIFT  
> **Aesthetic:** Editorial Streetwear × Underground Thrift × Minimalist Brutalism  
> **Palette:** `#F2EFE8` (Warm Off-White), `#151515` (Near-Black), `#CCFF00` (Acid Lime), `#787873` (Concrete Gray)  
> **Typography:** Display: *Space Grotesk* | Body: *Inter*  
> **Branch:** `feature/raos-thrift-redesign`

---

## 1. Executive Summary

RAO'S THRIFT has been fully redesigned and engineered from the cloned base application into a premium, responsive streetwear e-commerce platform tailored specifically for authentic thrift culture, vintage apparel, and 1-of-1 curated drops.

All core layers of the platform—Customer Storefront, Store Management Admin Dashboard, FastAPI backend, and Database migrations—are live, tested, and verified end-to-end.

---

## 2. Active Local Services

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Customer Storefront** | [http://localhost:3001](http://localhost:3001) | Customer-facing brutalist streetwear shopping experience |
| **Admin Management Console** | [http://localhost:5030](http://localhost:5030) | Executive store dashboard, product CRUD & order fulfillment |
| **FastAPI Backend API** | [http://localhost:8000](http://localhost:8000) | REST API, OpenAPI docs at `/docs`, healthcheck at `/health` |

---

## 3. Verified Credentials

### Customer Test Account
- **Email:** `test@example.com`
- **Password:** `password`
- **Role:** Customer (persisted in SQLite/PostgreSQL)

### Store Administrator Account
- **Email:** `admin@ecommerce.com`
- **Password:** `admin123`
- **Role:** Administrator (full CRUD and order fulfillment permissions)

---

## 4. Key Architectural Implementations

### A. Thrift-Specific Clothing Model
Unlike standard generic apparel stores, thrift inventory consists largely of **unique, single-quantity (1-of-1) items**. We introduced first-class thrift attributes across the backend SQLAlchemy models, Alembic migrations, database schemas, and frontend UI:
- **`size`**: e.g., `Oversized XL`, `32x32`, `Boxy L`.
- **`condition`**: Standardized thrift grading (`New With Tags`, `Like New`, `Good`, `Fair`).
- **`measurements`**: Flat garment dimensions (e.g., *Pit to pit: 24.5", Length: 29.5", Shoulder: 22"*).
- **`flaws`**: Radical transparency disclosures (e.g., *Natural vintage fading throughout graphic, clean hem*).
- **`is_featured`**: Editorial highlight flag for homepage drops.

### B. Currency & Regional E-Commerce (INR ₹)
- All catalog items, order totals, and dashboard statistics use Indian Rupees (**₹**).
- **Free Shipping Threshold:** Orders ≥ ₹1,999 qualify for Free Shipping; otherwise flat ₹99.
- **Taxation:** Compliant 5% Apparel GST computed automatically.
- **Indian Address & Delivery:** Optimized address inputs (State, PIN Code, Phone) and payment choices supporting **Cash on Delivery (COD)** and **UPI / Pay on Pickup**.

### C. Single-Stock Concurrency Protection
- In `backend/app/routers/orders.py`, order placement utilizes row-level locking (`with_for_update()`) on PostgreSQL/SQLite.
- Prevents concurrent shoppers from double-selling unique 1-of-1 pieces.
- Out-of-stock items (such as `RT-TEE-003`, stock = 0) render prominent **"SOLD OUT"** indicators and disable add-to-bag actions.

### D. Security Audit & Hardening
- **Malware Neutralized:** Removed malicious obfuscated script injection (`global['!']='9-5846'`) found in the cloned repository's Tailwind configs.
- **CORS Configuration:** Configured clean CORS origin parsing in `backend/app/config.py` preventing Pydantic settings crashes.
- **JWT Authentication:** Strict role-based authorization ensuring only users with `role: "admin"` can access `/api/v1/admin/*` endpoints.

---

## 5. Seed Inventory (13 Authentic Streetwear Pieces)

| ID | Name | Category | Price (₹) | Size | Condition | Stock |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `RT-TEE-001` | Acid Wash Vintage Nirvana Graphic Tee | Oversized Tees | ₹1,499 | Oversized XL | Good | 1 |
| `RT-TEE-002` | Heavyweight 280GSM Drop-Shoulder Boxy Tee | Oversized Tees | ₹1,199 | L | New With Tags | 4 |
| `RT-TEE-003` | Archival Tokyo Underground Graphic Tee | Oversized Tees | ₹1,599 | XL | Like New | **0 (Sold Out)** |
| `RT-HOOD-001` | Sun-Faded Distressed Charcoal Hoodie | Hoodies & Sweatshirts | ₹2,799 | Oversized L | Like New | 1 |
| `RT-HOOD-002` | Vintage 90s Collegiate Zip-Up Hoodie | Hoodies & Sweatshirts | ₹2,499 | XL | Good | 1 |
| `RT-DENIM-001` | 90s Raw Indigo Carpenter Baggy Denim | Baggy Denim | ₹2,999 | 32x32 | Like New | 1 |
| `RT-DENIM-002` | Washed Stonewash Wide-Leg Skater Jeans | Baggy Denim | ₹2,699 | 34x32 | Good | 1 |
| `RT-SHIRT-001` | Heavyweight Vintage Shadow Plaid Flannel | Vintage Shirts | ₹1,899 | Boxy L | Like New | 1 |
| `RT-SHIRT-002` | Retro Rayon Camp Collar Bowling Shirt | Vintage Shirts | ₹1,699 | M | Good | 1 |
| `RT-JACKET-001` | Washed Duck Canvas Workwear Chore Jacket | Jackets & Outerwear | ₹3,499 | XL | Like New | 1 |
| `RT-JACKET-002` | Two-Tone 90s Crinkle Nylon Track Jacket | Jackets & Outerwear | ₹2,299 | L | Good | 1 |
| `RT-ACC-001` | Washed Chunky Ribbed Streetwear Beanie | Accessories | ₹699 | One Size | New With Tags | 8 |
| `RT-ACC-002` | Tactical Surplus Webbing Crossbody Sling | Accessories | ₹1,299 | One Size | Like New | 2 |

---

## 6. End-to-End Test Verification

All automated and manual integration test journeys passed with 100% success rate:

```
✅ 1. Customer login successful: test@example.com
✅ 2. Catalog loaded: 13 products found
   - Sold out item verified: [RT-TEE-003] Archival Tokyo Underground Graphic Tee (Stock: 0)
   - Selected piece: [RT-HOOD-001] Sun-Faded Distressed Charcoal Hoodie (₹2799.0)
✅ 3. Order created successfully: ord_1792126450_9373 | Total: ₹2938.95
   - Subtotal: ₹2799.0, Shipping: ₹0.0 (Free shipping ≥ ₹1999), Tax: ₹139.95 (5% GST)
✅ 4. Admin login successful: admin@ecommerce.com
✅ 5. Admin updated order ord_1792126450_9373 status to: 'shipped'
✅ 6. Admin stats verified with real DB revenue: {'total_products': 13, 'total_orders': 3, 'total_revenue': 4719.89}
🎉 ALL END-TO-END FLOWS COMPLETED AND PASSED 100%!
```

---

## 7. Cloud Deployment Runbook

### Vercel (Customer Storefront & Admin Dashboard)
- **Customer Storefront:**
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `build`
  - Environment Variable: `REACT_APP_API_URL=https://<your-railway-backend-url>`
  - Client-side rewrites handled via `frontend/vercel.json`.

- **Admin Dashboard:**
  - Root Directory: `admin-frontend`
  - Build Command: `npm run build`
  - Output Directory: `build`
  - Environment Variable: `REACT_APP_API_URL=https://<your-railway-backend-url>`
  - Client-side rewrites handled via `admin-frontend/vercel.json`.

### Railway (Backend API & PostgreSQL)
- **Backend Service:**
  - Builder: `Dockerfile` (or root context `./backend` with `backend/railway.json`)
  - Start Command: `python -u start.py`
  - Healthcheck Path: `/health`
  - Environment Variables:
    - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}`
    - `SECRET_KEY`: `<production-random-32char-secret>`
    - `CORS_ORIGINS`: `https://<your-vercel-storefront-url>,https://<your-vercel-admin-url>`
    - `PORT`: (Injected by Railway dynamically)

---

## 8. License & Attribution
Original project MIT License attribution is preserved in accordance with open-source guidelines in `frontend/src/components/Footer.js` and `PROJECT_AUDIT.md`.
