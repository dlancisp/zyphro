# Security Policy

At Zyphro, we consider the security of our systems a top priority. But no matter how much effort we put into system security, there can still be vulnerabilities present.

## Supported Versions

We only support the latest deployed version on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1.  **Do NOT open a public issue.** This gives malicious actors a chance to exploit it before we fix it.
2.  Email us at `security@zyphro.com` (or contact the repository maintainer directly).
3.  Include a Proof of Concept (PoC) or detailed steps to reproduce the issue.

We will acknowledge your report within **48 hours** and aim to provide a fix timeline within **5 days**.

## Bug Bounty & Hall of Fame

While we do not currently offer monetary rewards for all reports, valid high-severity submissions will be credited in our **Security Hall of Fame**.

We are specifically interested in:
- Cryptographic weaknesses (e.g., nonce reuse, key leakage).
- Broken access controls (accessing another user's secret).
- XSS vulnerabilities that bypass our CSP.

## Safe Harbor

If you conduct security research on Zyphro in good faith and follow this policy, we pledge not to pursue legal action against you. We consider your research to be authorized and helpful.