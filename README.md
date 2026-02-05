# Zyphro: Zero-Knowledge Secret Sharing

![Zyphro Banner](https://via.placeholder.com/1200x300/000000/ffffff?text=ZYPHRO+|+Secure+Infrastructure)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Status](https://img.shields.io/badge/Status-Beta-orange)]()
[![Encryption](https://img.shields.io/badge/Encryption-AES--GCM-green)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

**Zyphro** is an open-source, **Zero-Knowledge** secret sharing infrastructure. It allows you to securely send passwords, private keys, and confidential messages that permanently self-destruct after being read ("Burn on read").

Unlike other services, **encryption keys are never sent to the server**. All cryptographic operations occur locally in your browser using the native **Web Crypto API**.

## 🔐 Security Architecture

- **True E2E Encryption:** We utilize hardware-accelerated **AES-256-GCM** on the client side.
- **Zero-Knowledge:** The server only stores encrypted blobs (`ciphertext`) and anonymous metadata. We cannot read your messages even if legally compelled.
- **Guaranteed Self-Destruction:** Data is hard-deleted from the database immediately after the first read or upon expiration.
- **Privacy First:** No tracking logs, IP storage, or user fingerprinting.

## 🚀 Tech Stack

- **Frontend:** React 19 + Vite + TailwindCSS
- **Backend:** Node.js (Express) + Helmet + Rate Limiting
- **Database:** PostgreSQL (Neon Tech) + Prisma ORM
- **Infrastructure:** Vercel (Edge Network)


## 🗺️ Security Roadmap

We are following a strict security hardening path towards SOC 2 compliance.

### Phase 1: Critical Hardening (Current)
- [x] **Modular Architecture:** Refactoring frontend to isolate cryptographic components.
- [ ] **Key Derivation Upgrade:** Implementing **PBKDF2** (310k iterations) to remove the key from the URL hash.
- [ ] **Authenticated Encryption:** Adding AAD (Additional Authenticated Data) to AES-GCM payloads to prevent context confusion.
- [ ] **CSP Headers:** Implementing strict Content-Security-Policy to prevent XSS.

### Phase 2: Advanced Cryptography (Next)
- [ ] **XChaCha20-Poly1305:** Migrating from AES-GCM to XChaCha20 to eliminate nonce-reuse risks (192-bit nonces).
- [ ] **Backend Rate Limiting:** Advanced protection against brute-force attacks.
- [ ] **Passphrase Strength Meter:** Integrated zxcvbn estimator for user passwords.

### Phase 3: Audit & Compliance (2026)
- [ ] **External Audit:** Scheduled security review by firms like Cure53 or Trail of Bits.
- [ ] **Bug Bounty Program:** Launching a public reward program for security researchers.
- [ ] **SOC 2 Type II:** Achieving operational security certification.


## 🛠️ Installation & Self-Hosting

To run your own instance of Zyphro locally:

```bash
# 1. Clone the repository
git clone [https://github.com/YOUR_USERNAME/zyphro-core.git](https://github.com/YOUR_USERNAME/zyphro-core.git)
cd zyphro-core

# 2. Install dependencies (Root, Client, and API)
npm install
cd client && npm install
cd ../api && npm install

# 3. Configure environment variables
# Copy .env.example to .env and fill in your database credentials

# 4. Start development server
npm run dev