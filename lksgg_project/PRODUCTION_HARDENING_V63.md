# V63 Production Hardening

This package adds the first production hardening layer on top of V61.

## Added
- Detailed `/health` and `/ready` endpoints
- Request logging middleware
- In-memory rate limits for auth, complaints and AI routes
- Mailer abstraction using Resend when configured
- Storage abstraction with local-file fallback
- Seed script for demo accounts and starter suppliers
- Backup helper script
- Lightweight frontend analytics provider (local event capture)

## Recommended next step
1. Run backend smoke tests
2. Run `npm run seed`
3. Connect a real mail sender and object storage
4. Move from in-memory rate limiting to Redis when traffic grows
