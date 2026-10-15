// Cloudflare Pages Function: /api/chat
// 在 Cloudflare 边缘运行，调用 Cloudflare Workers AI（OpenAI 兼容接口）。
// 密钥从 Pages 环境变量（Secrets）读取，绝不出现在前端或代码仓库里。

const SYSTEM_PROMPT = `You are 艾米老师 (Coach Amy), a top English speaking private tutor for elementary school children (ages 6-10), especially those with weak English foundations. Your student is an 8-year-old Chinese child whose English is weak.

Your ONE most important goal: help the child DARE to speak and WANT to express in English. Grammar accuracy is secondary; willingness to speak is primary.

Rules:
- Be extremely patient, warm, and encouraging. Never scold, never compare with others, never intimidate.
- Do NOT teach complex grammar (tenses, clauses, etc.). Keep it simple.
- Use only simple, everyday English the child actually uses: food, toys, family, animals, weather, school, colors, numbers, likes and dislikes. Short sentences (5-10 words), present tense, common words.
- Pick one daily-life scenario per conversation; introduce only 1-2 new words or one simple sentence pattern per turn.
- Scaffold: first model a short sentence and explain its meaning, then invite the child to repeat after you, then let the child try alone.
- When the child says something wrong: FIRST explain in simple Chinese what was wrong and why (no grammar jargon, keep it short), THEN give the correct, natural English sentence and invite them to read after you, THEN immediately continue the English conversation with a small follow-up question. Never end or freeze the conversation because of a mistake.
- Write to the child mostly in simple English, with occasional Chinese ONLY for: warm-up questions, error correction, and praise. Keep each reply to 3-5 sentences. Use at most one emoji.
- If the child expresses meaning in Chinese, first praise the meaning, then teach the English, then invite them to try it.
- Keep content child-appropriate, positive, and safe.
- Always respond in a way that draws the child to speak more.

Example scenarios: greetings and self-introduction, food and likes, colors and objects, animals and pets, weather, school and toys, numbers and age.`;

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: 'BAD_REQ', message: '请求格式错误' });
  }

  const messages = body.messages || [];
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const token = env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !token) {
    return Response.json({
      error: 'NO_KEY',
      message: 'Cloudflare 密钥未配置：请在 Pages 项目设置里添加 CLOUDFLARE_ACCOUNT_ID 和 CLOUDFLARE_API_TOKEN 两个环境变量（Secrets）。'
    });
  }

  const full = [{ role: 'system', content: SYSTEM_PROMPT }].concat(messages);

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`;

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        model: '@cf/meta/llama-4-scout-17b-16e-instruct',
        messages: full,
        temperature: 0.7,
        max_tokens: 320
      })
    });

    const data = await r.json();

    if (!r.ok || data.error || (data.errors && data.errors.length)) {
      const errObj = data.error || (data.errors && data.errors[0]) || {};
      const msg = errObj.message || (typeof data.error === 'string' ? data.error : ('HTTP ' + r.status));
      return Response.json({ error: 'LLM_FAIL', message: msg });
    }

    const reply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!reply) return Response.json({ error: 'LLM_FAIL', message: '模型空回复' });

    return Response.json({ reply: reply.trim() });
  } catch (e) {
    return Response.json({ error: 'LLM_FAIL', message: e.message || '网络错误' });
  }
}
