# Quasar Directus Integration

A demonstration of integrating Quasar Framework with Directus CMS.

## Features

- Authentication with Directus
- CRUD operations using Directus SDK
- Quasar UI components
- TypeScript support
- Responsive design

## Setup

### Prerequisites

- Node.js (>= 16.x)
- pnpm (>= 6.x)
- Directus instance (self-hosted or cloud)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd quasar-directus
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure Directus connection:

Edit `src/config/directus.ts` and update the `DIRECTUS_URL` with your Directus instance URL:

```typescript
// Directus configuration
export const DIRECTUS_URL = 'https://your-directus-instance-url';
```

4. Start the development server:

```bash
pnpm dev
```

## Project Structure

- `src/boot/directus.ts`: Directus SDK initialization
- `src/stores/auth-store.ts`: Authentication state management
- `src/stores/items-store.ts`: CRUD operations for items
- `src/pages/LoginPage.vue`: User login page
- `src/pages/ItemsPage.vue`: Item management page

## Authentication

The application uses Directus authentication with email and password. When a user logs in, the token is stored in localStorage for persistent sessions.

## Building for Production

```bash
pnpm build
```

## License

MIT
