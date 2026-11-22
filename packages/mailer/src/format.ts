const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => entities[c] ?? c);

/** One-line subject: newlines and runs of spaces from templated values collapse to one space. */
export const formatSubject = (subject: string) => subject.replace(/\s+/g, ' ').trim();

/**
 * Plain text as a minimal HTML email: blank lines split paragraphs, single newlines become
 * line breaks, and all text is escaped so payload values can't inject markup.
 */
export function textToHtml(text: string) {
  const paragraphs = text
    .trim()
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 16px">${escapeHtml(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
  // Inline styles and a table-free single column: the subset mail clients render consistently.
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#fafafa;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#171717"><div style="max-width:560px;margin:0 auto;padding:32px;background:#ffffff;border:1px solid #ebebeb;border-radius:12px">${paragraphs}</div><p style="max-width:560px;margin:16px auto 0;font-size:12px;color:#666666;text-align:center">Sent by Integrix</p></body></html>`;
}
