import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { DocsToc } from '@/components/docs/docs-toc';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { CodeBlock } from '@/components/ui/code-block';
import { ArrowRightIcon } from '@/components/ui/icons';
import { actionFields } from '@/components/zap/action-fields';
import { integrationCatalog } from '@/components/zap/integration-catalog';
import { IntegrationIcon } from '@/components/zap/integration-icon';
import { webhookCurl } from '@/components/zap/sample-payload';
import { webhookSenders } from '@/components/zap/webhook-senders';
import { templateRequestBody, zapTemplates } from '@/components/zap/zap-templates';
import { cn } from '@/lib/cn';
import { links, REPO_URL } from '@/lib/links';

// Server component: static HTML; the copy buttons and the section nav are the only client islands.

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Build webhook automations with Integrix: concepts, connectors, templates and API.',
};

const toc = [
  { id: 'overview', label: 'Overview' },
  { id: 'quick-start', label: 'Quick start' },
  { id: 'concepts', label: 'Core concepts' },
  { id: 'templating', label: 'Templating' },
  { id: 'connectors', label: 'Connectors' },
  { id: 'sample-integrations', label: 'Sample integrations' },
  { id: 'webhooks', label: 'Calling a webhook' },
  { id: 'senders', label: 'Webhook senders' },
  { id: 'connections', label: 'Connections' },
  { id: 'run-history', label: 'Run history' },
  { id: 'api', label: 'API reference' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'self-hosting', label: 'Self-hosting' },
  { id: 'add-connector', label: 'Adding a connector' },
] as const;

type SectionId = (typeof toc)[number]['id'];

const concepts: { term: string; body: string }[] = [
  {
    term: 'Zap',
    body: 'One automation: a trigger followed by one or more actions. Turn it off with its switch, and rename it, edit its steps or delete it from its menu.',
  },
  {
    term: 'Trigger',
    body: 'What starts a zap: a webhook (every zap gets its own URL) or a schedule that runs it every hour or every day.',
  },
  { term: 'Action', body: 'A step that does something, such as sending an email or SOL.' },
  {
    term: 'Connector',
    body: 'A trigger or action type you can pick in the builder (Webhook, Schedule, Email, HTTP request, Slack, Discord, Telegram, Filter, Delay, Solana).',
  },
  {
    term: 'Run',
    body: 'One execution of a zap, started by one webhook request and its body. Its status and step results appear on the zap’s History tab.',
  },
  {
    term: 'Stage',
    body: 'One action within a run. Stages execute in order, each as its own queued job.',
  },
];

const templatingExamples: { template: string; result: string }[] = [
  { template: 'Hi {name}', result: 'Hi Ada' },
  { template: '{user.email}', result: 'ada@example.com' },
  { template: 'Items: {cart}', result: 'Items: ["pen","ink"]' },
  { template: 'Hi {nickname}', result: 'Hi {nickname}' },
];

const templatingPayload = `{
  "name": "Ada",
  "user": { "email": "ada@example.com" },
  "cart": ["pen", "ink"]
}`;

const endpoints: { method: string; path: string; returns: string; note: string }[] = [
  {
    method: 'POST',
    path: '/user/signup',
    returns: '{ otpRequired, email }',
    note: 'Emails a code',
  },
  {
    method: 'POST',
    path: '/user/signin',
    returns: '{ otpRequired, email }',
    note: 'Emails a code',
  },
  {
    method: 'POST',
    path: '/user/verify-otp',
    returns: '{ user }',
    note: 'Sets the session cookie',
  },
  { method: 'POST', path: '/user/logout', returns: '{ ok }', note: 'Revokes the session' },
  { method: 'GET', path: '/auth/session', returns: '{ user | null }', note: 'Always 200' },
  { method: 'GET', path: '/trigger/available', returns: '{ availableTriggers }', note: 'Public' },
  { method: 'GET', path: '/action/available', returns: '{ availableActions }', note: 'Public' },
  { method: 'POST', path: '/zap', returns: '{ zapId }', note: 'Optional name; session required' },
  { method: 'GET', path: '/zap', returns: '{ zaps }', note: 'Newest first' },
  { method: 'GET', path: '/zap/:zapId', returns: '{ zap }', note: 'null if not yours' },
  {
    method: 'PATCH',
    path: '/zap/:zapId',
    returns: '{ zap }',
    note: 'Body { name?, enabled? }; an empty name resets the title',
  },
  {
    method: 'PUT',
    path: '/zap/:zapId',
    returns: '{ zap }',
    note: 'Same body as POST /zap; replaces the steps',
  },
  {
    method: 'DELETE',
    path: '/zap/:zapId',
    returns: '{ ok }',
    note: 'Also deletes its runs',
  },
  {
    method: 'GET',
    path: '/zap/:zapId/runs',
    returns: '{ runs }',
    note: 'Latest 20 runs with their steps',
  },
  {
    method: 'POST',
    path: '/zap/:zapId/runs/:runId/replay',
    returns: '{ ok }',
    note: 'Re-queues a failed run from its failed step',
  },
  { method: 'GET', path: '/connection', returns: '{ connections }', note: 'Names only' },
  {
    method: 'POST',
    path: '/connection',
    returns: '{ connection }',
    note: 'Body { connectorId, name, values }',
  },
  { method: 'DELETE', path: '/connection/:id', returns: '{ ok }', note: 'Steps using it fail' },
  { method: 'GET', path: '/usage', returns: '{ months }', note: 'Steps run per month, last 6' },
  { method: 'GET', path: '/profile', returns: '{ profile }', note: 'Name, email, password set' },
];

const runStatuses: { status: string; meaning: string }[] = [
  {
    status: 'Queued',
    meaning: 'The request was recorded and its first step has not finished yet.',
  },
  { status: 'Running', meaning: 'At least one step finished and more are still to run.' },
  { status: 'Waiting', meaning: 'A Delay step is holding the run until its time is up.' },
  { status: 'Success', meaning: 'Every step finished.' },
  {
    status: 'Failed',
    meaning: 'A step still failed after its retries. Later steps did not run.',
  },
  { status: 'Halted', meaning: 'A step ended the run on purpose, without an error.' },
  { status: 'Not recorded', meaning: 'The run happened before run history existed.' },
];

const curlFor = (payload: unknown) => webhookCurl('$ZAP_URL', payload);

const createZapCurl = (body: unknown) =>
  `curl -X POST "$API_URL/api/v1/zap" -b cookies.txt \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body, null, 2)}'`;

const builtIns = Object.entries(integrationCatalog);

export default function DocsPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[200px_1fr]">
      <aside className="hidden lg:block">
        <DocsToc items={toc} />
      </aside>

      <article className="flex min-w-0 animate-fade-in flex-col gap-16">
        <header>
          <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            Documentation
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Build with Integrix</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Everything you need to turn a webhook into a reliable chain of actions, from your first
            zap to running the stack yourself.
          </p>
        </header>

        <Section id="overview" title="Overview">
          <p>
            Integrix is an automation platform. You create a <strong>zap</strong>: a trigger (a
            webhook URL or a schedule) followed by steps such as sending an email, calling an API,
            posting to Slack, Discord or Telegram, or transferring SOL. Filter and Delay steps
            decide whether and when a run goes on. Every JSON POST to the zap&apos;s URL, or every
            scheduled firing, starts a <strong>run</strong>. Its steps execute in order in the
            background, with values from the request and from earlier steps inserted wherever you
            use <Code>{'{placeholders}'}</Code>.
          </p>
          <p>
            Runs are durable: a request is written to Postgres together with an outbox row before
            anything is queued, then Kafka carries each step to a worker. A failing step is retried
            on its own a few times without re-running the steps before it. If it still fails, that
            run stops there, you get an email, and you can replay it from that step once the cause
            is fixed. Every run and step is listed on the zap&apos;s History tab.
          </p>
        </Section>

        <Section id="quick-start" title="Quick start">
          <ol className="flex flex-col gap-4">
            {[
              <>
                <Link href="/signup" className="text-foreground underline underline-offset-4">
                  Sign up
                </Link>{' '}
                and confirm the 6-digit code we email you (or continue with Google).
              </>,
              <>
                Click <strong>Create Zap</strong>, give it a name if you like, choose the{' '}
                <strong>Webhook</strong> trigger (or <strong>Schedule</strong> to run it every hour
                or day), then add steps and fill their fields. Or start from a{' '}
                <a
                  href="#sample-integrations"
                  className="text-foreground underline underline-offset-4"
                >
                  sample integration
                </a>
                .
              </>,
              <>
                Drag a step by its handle (or use its arrows) to change the order.{' '}
                <strong>Publish</strong>, open the zap and copy its webhook URL. The zap page also
                shows a ready-made curl listing every field your steps use, and clicking a step
                shows its full settings.
              </>,
              <>Send it a JSON POST from any service or from your terminal:</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs text-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <CodeBlock code={curlFor({ name: 'Ada', email: 'ada@example.com' })} />
          <p>
            The hooks service answers <Code>{'{ "message": "Webhook received" }'}</Code> right away;
            the steps run a moment later. Open the zap&apos;s <strong>History</strong> tab to see
            how the run went.
          </p>
        </Section>

        <Section id="concepts" title="Core concepts">
          <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {concepts.map((c) => (
              <div key={c.term} className="bg-background p-4">
                <dt className="font-medium text-foreground">{c.term}</dt>
                <dd className="mt-1 text-sm">{c.body}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="templating" title="Templating">
          <p>
            Every action field is a template. <Code>{'{field}'}</Code> inserts a value from the
            webhook body and <Code>{'{parent.child}'}</Code> walks into nested objects (a field that
            holds a JSON string is parsed on the way). Objects and arrays are inserted as JSON, and
            a placeholder with no matching value is left exactly as written, so typos are easy to
            spot.
          </p>
          <p>Given this webhook body:</p>
          <CodeBlock code={templatingPayload} />
          <Table head={['Template', 'Result']}>
            {templatingExamples.map((row) => (
              <tr key={row.template}>
                <Td mono>{row.template}</Td>
                <Td mono>{row.result}</Td>
              </tr>
            ))}
          </Table>
          <p>
            A step can also read what an earlier step produced, with{' '}
            <Code>{'{steps.N.field}'}</Code>. Steps are numbered as in the builder: the trigger is
            step 1 and the first action is step 2. For example, after a Solana step at position 2,{' '}
            <Code>{'{steps.2.signature}'}</Code> is that transfer&apos;s signature. Email produces{' '}
            <Code>to</Code> and <Code>subject</Code>, and Filter produces <Code>passed</Code>. A
            run&apos;s History shows each step&apos;s output.
          </p>
          <p>
            When you edit a zap that has already received a request, the step dialog lists the
            fields of the latest request and the outputs of earlier steps. Click one to insert it
            into the field you last edited.
          </p>
        </Section>

        <Section id="connectors" title="Connectors">
          <p>
            Connectors are the trigger and action types available in the builder. Each action lists
            the fields you fill in; all of them accept templates.
          </p>
          <div className="flex flex-col gap-4">
            {builtIns.map(([id, info]) => {
              const fields = actionFields[id] ?? [];
              return (
                <div key={id} className="rounded-lg border border-border p-5">
                  <div className="flex items-center gap-3">
                    <IntegrationIcon integration={{ id, name: info.name, image: '' }} />
                    <h3 className="font-medium text-foreground">{info.name}</h3>
                    <Badge variant={info.kind === 'trigger' ? 'accent' : 'neutral'}>
                      {info.kind === 'trigger' ? 'Trigger' : 'Action'}
                    </Badge>
                    <Code className="ml-auto">{id}</Code>
                  </div>
                  <p className="mt-3 text-sm">{info.description}</p>
                  {fields.length > 0 ? (
                    <Table head={['Field', 'Key', 'Example']} className="mt-4">
                      {fields.map((f) => (
                        <tr key={f.key}>
                          <Td>{f.label}</Td>
                          <Td mono>{f.key}</Td>
                          <Td mono>{f.placeholder}</Td>
                        </tr>
                      ))}
                    </Table>
                  ) : (
                    <p className="mt-2 text-sm">No settings.</p>
                  )}
                </div>
              );
            })}
          </div>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
            <li>
              HTTP request calls a public <Code>http</Code> or <Code>https</Code> URL. It waits at
              most 10 seconds, does not follow redirects, and fails the step on any response outside
              2xx. Addresses inside the server&apos;s own network (localhost, private and link-local
              ranges) are refused. Write headers as one <Code>Name: value</Code> per line; a body
              without a <Code>Content-Type</Code> header is sent as JSON. Its output is{' '}
              <Code>status</Code> and <Code>body</Code> (parsed when the response is JSON, up to 64
              KB), so a later step can read <Code>{'{steps.2.body.id}'}</Code>.
            </li>
            <li>
              Slack and Discord post to a webhook URL you create in the channel&apos;s settings.
              Telegram sends as your bot: get a token from @BotFather and use the ID of a chat the
              bot has been added to. All three are free. Each service limits how fast you can post
              (roughly one message per second for Slack and for a Telegram chat, and 30 per minute
              for a Discord webhook); a rejected message fails the step after its retries. Discord
              messages are cut at 2,000 characters and Telegram messages at 4,096.
            </li>
            <li>
              Webhook URLs, the bot token and HTTP headers are credentials. They are typed like a
              password, stored on the server, never sent back to the browser (you see dots), and not
              templated. When you edit a zap, leave the dots to keep the saved value. A step keeps
              its credential when you move it to another position.
            </li>
            <li>
              Schedule starts a run every hour or every day, counted from when the zap was created,
              edited or switched back on. There is no request body, but templates can read{' '}
              <Code>{'{scheduledFor}'}</Code>. If the server was down when a run was due, one run
              starts when it is back and the missed ones are skipped. A scheduled zap has no webhook
              URL.
            </li>
            <li>
              Delay pauses a run for an amount of minutes, hours or days (decimals allowed, at most
              30 days) and shows the run as Waiting. Nothing is kept running while it waits. Its
              output is <Code>resumeAt</Code>.
            </li>
            <li>
              Filter compares <Code>field</Code> with <Code>value</Code> (both templates). The{' '}
              <Code>operator</Code> is one of <Code>equals</Code>, <Code>not_equals</Code>,{' '}
              <Code>contains</Code>, <Code>not_contains</Code>, <Code>greater_than</Code>,{' '}
              <Code>less_than</Code>, <Code>is_empty</Code> or <Code>is_not_empty</Code>. Text
              comparisons are case-sensitive, the two numeric ones compare numbers, and a field
              missing from the request counts as empty. When the condition fails, the run ends as
              Halted: later steps don&apos;t run and no failure email is sent.
            </li>
            <li>
              Email is sent from the Gmail connection you pick under <strong>Send from</strong>, or
              from the server&apos;s mail account when you pick none. It goes out as plain text plus
              a simple HTML version. In the body, a blank line starts a new paragraph and a single
              newline is a line break. Values from the payload are escaped, so they can&apos;t add
              markup.
            </li>
            <li>
              Solana sends devnet SOL from the wallet connection you pick under{' '}
              <strong>Pay from</strong>, or from the server&apos;s wallet (
              <Code>SOL_PRIVATE_KEY</Code>) when you pick none. It waits up to 10 seconds for
              confirmation. Its output is the <Code>signature</Code> and whether it was{' '}
              <Code>confirmed</Code> in that time. The amount is in SOL, for example{' '}
              <Code>0.01</Code>.
            </li>
          </ul>
        </Section>

        <Section id="sample-integrations" title="Sample integrations">
          <p>
            Ready-made zaps you can add in one click. <strong>Use template</strong> opens the
            builder with every step filled in (sign in first), so you only review and publish.{' '}
            <Code>you@example.com</Code> is replaced with your account email. Each sample includes a
            payload to test it with.
          </p>
          <div className="flex flex-col gap-6">
            {zapTemplates.map((t) => (
              <div key={t.id} id={`template-${t.id}`} className="rounded-lg border border-border">
                <div className="flex flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground">{t.name}</h3>
                      <p className="mt-1 text-sm">{t.summary}</p>
                    </div>
                    <Link
                      href={`/zap/create?template=${t.id}`}
                      className={buttonVariants({ size: 'sm' })}
                    >
                      Use template <ArrowRightIcon />
                    </Link>
                  </div>
                  <ol aria-label="Steps" className="flex flex-wrap items-center gap-2 text-sm">
                    {[t.triggerId, ...t.actions.map((a) => a.actionId)].map((id, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {i > 0 && <ArrowRightIcon aria-hidden className="size-3" />}
                        <span className="inline-flex items-center gap-2 rounded-md border border-border px-2 py-1 text-foreground">
                          <IntegrationIcon
                            integration={{
                              id,
                              name: integrationCatalog[id]?.name ?? id,
                              image: '',
                            }}
                            className="size-5"
                          />
                          {integrationCatalog[id]?.name ?? id}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <Table head={['Step', 'Field', 'Value']}>
                    {t.actions.flatMap((a, i) =>
                      Object.entries(a.metadata).map(([key, value]) => (
                        <tr key={`${i}-${key}`}>
                          <Td>
                            {i + 1}. {integrationCatalog[a.actionId]?.name ?? a.actionId}
                          </Td>
                          <Td mono>{key}</Td>
                          <Td mono>{value || '(your own value)'}</Td>
                        </tr>
                      )),
                    )}
                  </Table>
                  <p className="text-sm">Test it with:</p>
                  <CodeBlock code={curlFor(t.samplePayload)} />
                </div>
                <details className="border-t border-border bg-background-subtle px-5 py-3 text-sm">
                  <summary className="cursor-pointer text-foreground">
                    Create it with the API
                  </summary>
                  <p className="mt-3 text-muted-foreground">
                    Replace <Code>you@example.com</Code> with a real address first.
                  </p>
                  <div className="mt-3">
                    <CodeBlock code={createZapCurl(templateRequestBody(t))} />
                  </div>
                </details>
              </div>
            ))}
          </div>
        </Section>

        <Section id="webhooks" title="Calling a webhook">
          <CodeBlock code="POST {HOOKS_URL}/hooks/catch/{userId}/{zapId}" />
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              Send <Code>Content-Type: application/json</Code> with a body up to 100 KB. The body is
              stored as the run&apos;s payload and is what templates read from.
            </li>
            <li>
              The response only confirms the run was recorded. Actions run asynchronously, one stage
              at a time.
            </li>
            <li>
              Delivery is at-least-once: after a crash or retry a step can run again, so prefer
              downstream systems that tolerate duplicates.
            </li>
            <li>
              A zap that is turned off answers <Code>403</Code> and records nothing. An unknown zap
              id answers <Code>404</Code>.
            </li>
            <li>
              Editing a zap replaces its steps for new runs only. A run that already started
              finishes with the steps it started with.
            </li>
            <li>
              Without a signing secret, anyone who has the URL can start a run, so treat the URL
              like a password. Set a secret on the webhook trigger (Edit steps, then the trigger) to
              accept signed requests only; anything else answers <Code>401</Code>.
            </li>
            <li>
              The user id in the URL must be the zap owner&apos;s. A URL with another id answers{' '}
              <Code>404</Code>, the same as an unknown zap.
            </li>
          </ul>
        </Section>

        <Section id="senders" title="Webhook senders">
          <p>
            Pick the sender on the webhook trigger and give it the same secret you set on the
            sender&apos;s side. Each request is then checked against that sender&apos;s signature
            header, computed over the exact body it sent. For a sender that isn&apos;t listed, use{' '}
            <strong>Any sender</strong>.
          </p>
          <Table head={['Sender', 'Checked header', 'Setup']}>
            {webhookSenders.map((s) => (
              <tr key={s.id}>
                <Td>{s.name}</Td>
                <Td mono>{s.verifiedBy}</Td>
                <Td>{s.setup}</Td>
              </tr>
            ))}
          </Table>
          <p>
            Example bodies, trimmed to the fields you are most likely to use. The builder suggests
            these fields before your zap has received its first request.
          </p>
          <div className="flex flex-col gap-2">
            {webhookSenders
              .filter((s) => s.samplePayload)
              .map((s) => (
                <details key={s.id} className="rounded-md border border-border">
                  <summary className="cursor-pointer px-3 py-2.5 text-sm font-medium text-foreground hover:bg-background-subtle">
                    {s.name}
                  </summary>
                  <div className="border-t border-border p-3">
                    <CodeBlock code={JSON.stringify(s.samplePayload, null, 2)} />
                  </div>
                </details>
              ))}
          </div>
          <p>
            A sender that posts a list, such as Helius, is read by position:{' '}
            <Code>{'{0.signature}'}</Code> is the signature of the first item, and{' '}
            <Code>{'{items.1.name}'}</Code> reads the second entry of a list inside the body.
          </p>
        </Section>

        <Section id="connections" title="Connections">
          <p>
            A connection is your own account for a connector, saved once under{' '}
            <strong>Settings</strong> and picked on any step that can use it. Without one, a step
            uses the server&apos;s account.
          </p>
          <Table head={['Connection', 'What you enter', 'Used by']}>
            <tr>
              <Td>Gmail account</Td>
              <Td>
                Your Gmail address and an app password (Google Account, Security, 2-Step
                Verification, App passwords). Not your Google password.
              </Td>
              <Td>Email steps, under Send from. Mail is sent from your address.</Td>
            </tr>
            <tr>
              <Td>Solana wallet</Td>
              <Td>The base58 secret key of a devnet wallet.</Td>
              <Td>Solana steps, under Pay from. Transfers are paid from that wallet.</Td>
            </tr>
          </Table>
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              Credentials are encrypted on the server and are never shown again or sent back to the
              browser. To change one, remove the connection and add it again.
            </li>
            <li>
              If you remove a connection, steps that use it fail with a message saying so until you
              pick another one.
            </li>
            <li>
              Gmail limits a free account to about 500 recipients a day. Sign-in codes and
              run-failure emails always come from the server&apos;s own mail account, not from a
              connection.
            </li>
            <li>
              Transfers run on Solana devnet only. Never enter the key of a wallet that holds real
              funds.
            </li>
          </ul>
        </Section>

        <Section id="run-history" title="Run history">
          <p>
            Open a zap and choose <strong>History</strong> to see its latest 20 runs with their
            status, start time and duration. Open a run to see each step: its result, how long it
            took, the error if it failed and any output it produced. The list updates when you press
            Refresh.
          </p>
          <Table head={['Status', 'Meaning']}>
            {runStatuses.map((s) => (
              <tr key={s.status}>
                <Td>{s.status}</Td>
                <Td>{s.meaning}</Td>
              </tr>
            ))}
          </Table>
          <p>
            A failing step is retried three times (after 1, 5 and 10 seconds). If it still fails,
            the run stops and the zap&apos;s owner gets an email with the step, the error and a link
            to the history. A step with no handler on the server is shown as Skipped and the run
            continues.
          </p>
          <p>
            The <strong>Usage</strong> page in the app shows how many steps your zaps ran in each of
            the last six months (UTC).
          </p>
          <p>
            A failed run has a <strong>Replay from failed step</strong> button. It runs the step at
            the failed position again with the run&apos;s original request and the zap&apos;s
            current steps, then continues, so you can fix a setting first and then replay. Steps
            that already passed are not repeated, and their outputs stay available to later steps.
          </p>
        </Section>

        <Section id="api" title="API reference">
          <p>
            The REST API lives under <Code>/api/v1</Code> on the API service. It authenticates with
            an httpOnly session cookie set by <Code>/user/verify-otp</Code> or Google sign-in, so
            pass <Code>-c</Code>/<Code>-b cookies.txt</Code> with curl. Errors return{' '}
            <Code>{'{ message }'}</Code>.
          </p>
          <Table head={['Method', 'Path', 'Returns', 'Notes']}>
            {endpoints.map((e) => (
              <tr key={`${e.method} ${e.path}`}>
                <Td mono>{e.method}</Td>
                <Td mono>{e.path}</Td>
                <Td mono>{e.returns}</Td>
                <Td>{e.note}</Td>
              </tr>
            ))}
          </Table>
          <p>
            Profile updates, email change and password endpoints are listed in the{' '}
            <a
              href={`${REPO_URL}/blob/main/okf/api.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              API guide
            </a>
            .
          </p>
        </Section>

        <Section id="architecture" title="Architecture">
          <CodeBlock
            code={`web ──REST──▶ api ──────────┐
                            ▼
caller ──POST──▶ hooks ──▶ Postgres     ZapRun + outbox row, one transaction
                            │
                        processor       publishes due stages, starts scheduled runs
                            ▼
                  Kafka "zap-events" ◀──── stage n+1 ────┐
                            │                            │
                            └──────────▶ worker ─────────┘
                                           │
                              Email · Solana · step results`}
          />
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              <strong>web</strong> (Next.js) is the UI; <strong>api</strong> (Express) handles auth
              and zaps.
            </li>
            <li>
              <strong>hooks</strong> records each request as a run plus an outbox row in one
              transaction, so no accepted event is lost.
            </li>
            <li>
              <strong>processor</strong> publishes due outbox rows to Kafka (stage 0 for a new run),
              backing off when idle.
            </li>
            <li>
              <strong>worker</strong> runs one action per message, records the step on the run,
              queues the next stage, then commits.
            </li>
          </ul>
          <p>
            The full design, data model and failure handling are in{' '}
            <a
              href={links.architecture}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              ARCHITECTURE.md
            </a>
            .
          </p>
        </Section>

        <Section id="self-hosting" title="Self-hosting">
          <CodeBlock
            code={`git clone ${REPO_URL}.git && cd Integrix
cp .env.example .env   # add SMTP for emails, SOL_PRIVATE_KEY for Solana, CONNECTION_SECRET for connections
docker compose up --build -d`}
          />
          <p>
            Open <Code>http://localhost:3001</Code>. Environment variables, local development and
            troubleshooting are in the{' '}
            <a
              href={links.selfHosting}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              README
            </a>
            .
          </p>
        </Section>

        <Section id="add-connector" title="Adding a connector">
          <p>
            Connectors are registries keyed by one id, so a new one touches no existing branches:
          </p>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            <li>
              Add the id to <Code>packages/database/src/catalog.ts</Code>, with the settings that
              are credentials.
            </li>
            <li>
              Write a handler in <Code>apps/worker/src/actions/</Code> and register it in{' '}
              <Code>index.ts</Code>. Reach external URLs only through the guarded client in{' '}
              <Code>src/http.ts</Code>.
            </li>
            <li>
              Add its form fields to <Code>apps/web/components/zap/action-fields.ts</Code> and its
              copy to <Code>integration-catalog.ts</Code>.
            </li>
            <li>
              Optionally add a sample to <Code>zap-templates.ts</Code>; it appears here.
            </li>
          </ol>
          <p>
            The full checklist is in the{' '}
            <a
              href={`${REPO_URL}/blob/main/okf/connectors.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4"
            >
              connectors guide
            </a>
            .
          </p>
        </Section>
      </article>
    </div>
  );
}

function Section({ id, title, children }: { id: SectionId; title: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-4 text-muted-foreground">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Code({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        'rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground',
        className,
      )}
    >
      {children}
    </code>
  );
}

function Table({
  head,
  children,
  className,
}: {
  head: string[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-x-auto rounded-md border border-border', className)}>
      <table className="w-full text-left text-sm">
        <thead className="bg-background-subtle text-xs text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border border-t border-border">{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, mono }: { children: ReactNode; mono?: boolean }) {
  return (
    <td
      className={
        mono
          ? 'px-3 py-2 font-mono text-xs break-words whitespace-pre-wrap text-foreground'
          : 'px-3 py-2'
      }
    >
      {children}
    </td>
  );
}
