// netlify/functions/health.js
export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
}
