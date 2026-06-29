# Security & Testing Strategy

---

## 1. Security Architecture
* **API Protection & Rate Limiting**: Limit API requests using Express Rate Limiter to prevent DOS attacks.
* **Authentication**: Firebase Admin SDK validation of Authorization headers (JWT Bearer tokens).
* **Data Protection**: Encryption of payment transactions and personal details (PCI-DSS compliance via Stripe elements).
* **SQL Injection Prevention**: Using PostgreSQL parameter binding/prepared statements across all queries.

---

## 2. Testing Framework
* **Unit Testing (Jest)**: Testing booking availability algorithms and cart arithmetic.
* **API Testing (Supertest)**: Verifying endpoints return proper JSON responses and status codes.
* **E2E Testing (Playwright)**: Automating visual validation of the Vibe Dial, cart drawers, and checkout checkout flows.

---

## 3. CI/CD Deployment Pipeline (GitHub Actions)
```yaml
name: Production Deployment Pipeline

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Dependencies
        run: npm ci
      - name: Run Tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Frontend to Vercel
        run: npx vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
      - name: Build & Push Docker to Render
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```
