import { expect, test } from 'bun:test';
import { discordAction, discordRequest } from './discord';
import { slackAction, slackRequest } from './slack';
import { sentMessageId, telegramRequest } from './telegram';

test('slack posts the templated text to the trimmed webhook URL', () => {
  const request = slackRequest(
    { webhookUrl: ' https://hooks.slack.com/services/T/B/X ', text: 'New order {order.id}' },
    { order: { id: 'A-1' } },
  );
  expect(request).toEqual({
    url: 'https://hooks.slack.com/services/T/B/X',
    body: { text: 'New order A-1' },
  });
});

test('discord posts content, cut to its 2000 character limit', () => {
  const request = discordRequest(
    { webhookUrl: 'https://discord.com/api/webhooks/1/x', content: '{msg}' },
    { msg: 'x'.repeat(2500) },
  );
  expect(request.url).toBe('https://discord.com/api/webhooks/1/x');
  expect(request.body.content).toHaveLength(2000);
});

test('telegram calls sendMessage with the bot token, chat id and text', () => {
  const request = telegramRequest(
    { botToken: ' 123:ABC ', chatId: '{chat}', text: 'Hi {name}' },
    { chat: -1001, name: 'Ada' },
  );
  expect(request).toEqual({
    url: 'https://api.telegram.org/bot123:ABC/sendMessage',
    body: { chat_id: '-1001', text: 'Hi Ada' },
  });
});

test('reads the message id from a Telegram response', () => {
  expect(sentMessageId('{"ok":true,"result":{"message_id":42}}')).toBe(42);
  expect(sentMessageId('{"ok":true}')).toBeNull();
  expect(sentMessageId('not json')).toBeNull();
});

test('a webhook URL that points at an internal address fails the step', async () => {
  const internal = { webhookUrl: 'http://127.0.0.1:9/hook', text: 'x', content: 'x' };
  await expect(slackAction(internal, {})).rejects.toThrow('private or internal');
  await expect(discordAction(internal, {})).rejects.toThrow('private or internal');
  await expect(slackAction({ webhookUrl: '', text: 'x' }, {})).rejects.toThrow('not valid');
});
