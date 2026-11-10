
# Focus Companion Backend

A production-minded MVP backend for real-time focus sessions.

## Quick Start

1. Ensure Docker is running.
2. Run the setup script:
   ```bash
   chmod +x scripts/setup-dev.sh
   ./scripts/setup-dev.sh
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

## API Documentation

### Auth Flow
1. `POST /api/auth/register` (email, password, displayName)
2. Receive verification token in logs (dev mode) or email.
3. `GET /api/auth/verify?token=...`
4. `POST /api/auth/login` - returns user object and sets `token` cookie.

### Rooms
- `GET /api/rooms` - List all rooms.
- `POST /api/rooms` (Protected) - Create new session.
- `GET /api/rooms/:id/token` - Get Agora RTC token for joining.

## Real-time (Socket.io)
Connect to root namespace.
- **Events**: `join-room`, `leave-room`, `send-message`.
- **Broadcasts**: `user-joined`, `user-left`, `new-message`.

## Integrations
- **Agora**: Set `AGORA_APP_ID` and `AGORA_APP_CERT` in `.env` to enable secure tokens.
- **Stripe**: Set `STRIPE_SECRET_KEY` to enable payments.
