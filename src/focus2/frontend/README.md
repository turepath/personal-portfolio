
# Room Integration Guide

The Focus Companion Room UI is built for flexibility and low-cognitive load during deep work.

## Component Architecture

- `RoomLayout.tsx`: The orchestrator. It manages timer state, layout switching (Grid vs Ring), and chat visibility.
- `VideoPane.tsx`: A robust wrapper for raw video streams or virtualized placeholders.
- `ChatSidebar.tsx`: Handles two separate data flows: **Tasks** (pinned) and **Chat** (streaming).

## Modes and Props

| Mode | Description | Key Features |
|------|-------------|--------------|
| `1:1-virtual` | Default paired focus | PIP Layout, Magic Wand available |
| `1:1-real` | Authentic accountability | Magic Wand hidden, header badge |
| `1:many-virtual` | Community focus | Grid/Ring switchers, Paging (10/pg) |
| `1:many-real` | Authentic community | No virtual avatars allowed |
| `1:1-special` | Pro/Deep work | Unique dark theme background |

## Back-end Integration (RTC)

To hook up a real RTC provider (like Agora or WebRTC):

1. In `RoomLayout.tsx`, initialize your RTC client within a `useEffect`.
2. Fetch your token via `GET /api/rooms/:id/token`.
3. Map the provider's remote tracks to the `VideoPane` component.

```typescript
// Example Placeholder Integration
const [token, setToken] = useState(null);

useEffect(() => {
  fetch(`/api/rooms/${roomId}/token`)
    .then(res => res.json())
    .then(data => setToken(data.token));
}, [roomId]);
```

## CSS Tokens

All components rely on `room-tokens.css`. Ensure this is imported in your main entry file or room page.

- `--room-bg`: Default session background.
- `--room-special-bg`: Pro-tier dark background.
- `--accent`: Peaceful Earth Tone (#8A9B6E).
