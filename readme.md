# Integrix

Integrix is a workflow automation platform (Zapier-style) built with a Turborepo monorepo. You can create a webhook trigger and chain actions such as Solana transfer and Email delivery.

## Supported Actions

- Solana
- Email

More integrations are planned and will be added in future releases.

## Architecture

```text
integrix/
├── apps/
│   ├── web/        # Next.js frontend
│   ├── api/        # Express API (auth + zap management)
│   ├── hooks/      # Incoming webhook receiver
│   ├── processor/  # Kafka outbox processor
│   └── worker/     # Executes action steps (solana/email)
├── packages/
│   ├── database/   # Prisma schema + client
│   └── tsconfig/   # Shared TypeScript configs
├── docker/
└── docker-compose.yml
```

## Tech Stack

- Frontend: Next.js, React, Tailwind, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL + Prisma
- Queue/Events: Kafka
- Auth: JWT
- Infra: Docker + Docker Compose

## Ports

- Web: http://localhost:3001
- API: http://localhost:3000
- Hooks: http://localhost:3002
- Postgres: localhost:5433
- Kafka: localhost:9092

## Environment Variables

Create a `.env` file in repository root.

### Example `.env`

```env
# Solana sender account secret key
SOL_PRIVATE_KEY=YOUR_SOLANA_PRIVATE_KEY

# SMTP settings (Gmail example)
SMTP_ENDPOINT=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_gmail@gmail.com
SMTP_PASSWORD=your_gmail_app_password
FROM_EMAIL=your_gmail@gmail.com

# Optional API auth secret
JWT_PASSWORD=super-secret-jwt-key
```

Notes:

- For Gmail, use an App Password (not your normal account password).
- If you use another SMTP provider, change endpoint/username/password accordingly.

## Run Locally

## 1) Quick start with Docker (recommended)

```bash
git clone https://github.com/bixl007/Integrix.git
cd Integrix
docker compose up --build -d
```

Check status:

```bash
docker compose ps
```

Stop all services:

```bash
docker compose down
```

## 2) Run without Docker (advanced)

Requirements:

- Node.js 20+
- npm 10+
- Running PostgreSQL and Kafka

Commands:

```bash
npm install
npm run db:generate
npm run db:migrate
npm --workspace @integrix/database run db:seed
npm run dev
```

## Create a Webhook Automation (Solana + Gmail)

This project supports a `webhook` trigger and action chain execution in order.

Example flow:

1. Trigger: Webhook
2. Action 1: Solana
3. Action 2: Email

The worker resolves placeholders from webhook payload values using this template style:

- `{amount}`
- `{address}`
- `{email}`
- `{name}`
- Nested values are also supported: `{user.email}`

## Action field formats

### Solana action metadata format

```json
{
	"amount": "{amount}",
	"address": "{address}"
}
```

### Email action metadata format

```json
{
	"email": "{email}",
	"body": "Hi {name}, your amount is {amount}"
}
```

## API-based setup example

## 1) Sign up and get token

```bash
curl -X POST http://localhost:3000/api/v1/user/signup \
	-H "Content-Type: application/json" \
	-d '{
		"username": "demo.user@gmail.com",
		"password": "password123",
		"name": "Demo User"
	}'
```

Use returned `token` in `Authorization` header for protected endpoints.

## 2) Get available trigger and actions

```bash
curl http://localhost:3000/api/v1/trigger/available
curl http://localhost:3000/api/v1/action/available
```

Expected IDs:

- Trigger: `webhook`
- Actions: `solana`, `email`

## 3) Create Zap (Webhook -> Solana -> Email)

```bash
curl -X POST http://localhost:3000/api/v1/zap \
	-H "Content-Type: application/json" \
	-H "Authorization: YOUR_JWT_TOKEN" \
	-d '{
		"availableTriggerId": "webhook",
		"triggerMetadata": {},
		"actions": [
			{
				"availableActionId": "solana",
				"actionMetadata": {
					"amount": "{amount}",
					"address": "{address}"
				}
			},
			{
				"availableActionId": "email",
				"actionMetadata": {
					"email": "{email}",
					"body": "Hi {name}, your amount is {amount}"
				}
			}
		]
	}'
```

Response includes `zapId`.

## 4) Send webhook event (dummy request)

Webhook URL format:

```text
http://localhost:3002/hooks/catch/:userId/:zapId
```

Dummy payload example:

```bash
curl -X POST http://localhost:3002/hooks/catch/1/YOUR_ZAP_ID \
	-H "Content-Type: application/json" \
	-d '{
		"name": "Sunny Kumar",
		"email": "receiver@gmail.com",
		"amount": "0.1",
		"address": "G4wJLrP971arCEKvcCJnW6K2932GRtAeHtKRMYSZsSja"
	}'
```

This payload satisfies both action templates above.

## Useful Commands

```bash
npm run docker:build   # build and run all services
npm run docker:up      # run services
npm run docker:down    # stop services
npm run dev            # run all apps in dev mode
npm run build          # build all workspaces
npm run lint           # lint all workspaces
```

## Troubleshooting

- Solana insufficient balance:
	- Error: `insufficient lamports`
	- Fix: reduce `amount` or fund sender wallet from `SOL_PRIVATE_KEY`.
- Email not sending:
	- Check SMTP credentials in `.env`.
	- For Gmail, ensure App Password is used and `FROM_EMAIL` matches account.
- Worker still uses old env values:
	- Recreate services: `docker compose up --build -d`.


