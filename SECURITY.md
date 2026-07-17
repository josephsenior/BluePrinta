# Security Policy

## Supported versions

BluePrinta is under active development. Security fixes are applied to the latest commit on the default branch; older commits and unofficial deployments are not maintained as separate release lines.

## Report a vulnerability

Please report suspected vulnerabilities through [GitHub private vulnerability reporting](https://github.com/josephsenior/BluePrinta/security/advisories/new).

Do not open a public issue for an undisclosed vulnerability. Include, where possible:

- the affected component and commit
- expected and observed behavior
- reproduction steps or a minimal proof of concept
- potential impact
- a suggested remediation, if you have one

Reports will be acknowledged as soon as practical. Please allow time to validate and prepare a fix before public disclosure.

## Secrets and local configuration

- Never commit API keys, database credentials, tokens, or populated `.env` files.
- Use `.env.example` only as a template.
- Rotate a credential immediately if it is accidentally exposed.
- Treat generated exports and logs as potentially sensitive before sharing them.

## Deployment responsibility

This repository is a self-hosted reference application, not a managed service. Operators are responsible for authentication, network controls, database security, secret storage, dependency updates, backups, monitoring, and compliance requirements in their own environment.

The project has automated checks, but it does not claim an independent security audit or certification.
