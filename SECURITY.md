# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability within LexLens, please do not disclose it publicly via GitHub issues or discussions.

Instead, please submit reports directly to the project owner:
- **Project Owner**: [Alok Ranjan Singh](https://github.com/arsinghin/)
- **Method**: Open a private vulnerability report via GitHub Security Advisories or contact directly via GitHub profile: [https://github.com/arsinghin/](https://github.com/arsinghin/)

Please include:
1. Document or payload used to reproduce the issue.
2. Step-by-step reproduction instructions.
3. Potential impact (e.g., prompt injection leak, unintended file execution, or data exposure).

We will review and respond to critical vulnerability disclosures within 48 hours.

## Adversarial Robustness & Prompt Injection

LexLens incorporates prompt injection mitigation layers to isolate untrusted contract text from model instructions. Any attempts to bypass evidence grounding or override output schemas are treated as high-priority evaluation benchmark cases (`SEC-001`).
