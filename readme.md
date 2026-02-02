# Integrix

A workflow automation tool that enables users to connect various apps and services to streamline tasks and automate processes. Inspired by Zapier, Integrix allows you to create custom workflows (Zaps) that trigger actions across connected apps.

## 🏗️ Architecture

This is a **Turborepo monorepo** with the following structure:

```
integrix/
├── apps/
│   ├── web/              # Next.js frontend
│   ├── api/              # Express API server
│   ├── hooks/            # Webhook handler
│   ├── processor/        # Kafka message processor
│   └── worker/           # Background worker
├── packages/
│   ├── database/         # Centralized Prisma schema
│   └── tsconfig/         # Shared TypeScript configs
├── docker/               # Dockerfiles for each service
├── docker-compose.yml    # Docker orchestration
└── turbo.json            # Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker & Docker Compose
- PostgreSQL (for local development without Docker)

### Quick Start with Docker

```bash
# Clone and start all services
git clone https://github.com/bixl007/Integrix.git
cd Integrix
docker compose up --build -d
```

**Services will be available at:**
- Frontend: http://localhost:3001
- API: http://localhost:3000
- Hooks: http://localhost:3002

### Local Development

```bash
# Install all dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start all services in development mode
npm run dev
```

### Individual Commands

```bash
# Build all packages
npm run build

# Run linting
npm run lint

# Start Docker services
npm run docker:up

# Build and start Docker services
npm run docker:build

# Stop Docker services
npm run docker:down
```

## 🛠️ Technologies

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Messaging | Apache Kafka |
| Auth | JWT |
| Build | Turborepo |
| Deployment | Docker, Docker Compose |

## 📦 Packages

### `@integrix/database`
Centralized Prisma schema and database client shared across all apps.

### `@integrix/tsconfig`
Shared TypeScript configurations (base, node, nextjs).

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| web | 3001 | Next.js frontend |
| api | 3000 | Primary REST API |
| hooks | 3002 | Webhook receiver |
| processor | - | Kafka message processor |
| worker | - | Background job worker |
| postgres | 5433 | PostgreSQL database |
| kafka | 9092 | Message broker |
| zookeeper | 2181 | Kafka coordination |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC
