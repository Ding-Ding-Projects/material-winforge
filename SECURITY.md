# Security policy

## Supported state

Until the first published release is independently verified, the project should be treated as preview source. Published release notes will identify supported versions and their exact assets.

## Reporting a vulnerability

Use GitHub’s private security-advisory feature for vulnerabilities that could expose user data, execute unintended code, weaken update integrity, or cross the documented preview boundary. Do not open a public issue containing exploit details, credentials, private paths, or personal data.

Include the affected commit or version, reproducible behavior, impact, and the smallest safe proof. Never include real secrets.

## Security boundaries

- The website does not request operating-system privileges, credentials, analytics consent, or remote font access.
- Site preferences remain in browser storage and contain presentation choices only.
- Installer links remain disabled until a versioned manifest identifies a published asset and integrity data.
- Windows installers are intentionally unsigned and may trigger unknown-publisher or SmartScreen warnings.
- Code-signing credentials, certificates, and signing services must not be added to this project.
- Desktop controls must not claim to change Windows until their integration, recovery, and permission behavior is separately implemented and verified.
