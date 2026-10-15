// Cloudflare Pages Function: /api/config
// 部署到 Cloudflare 后，密钥在后台（Secrets）里，前端无需填写，直接开始对话。
// 返回 locked:true 让网页隐藏"填 Key"弹窗并自动打招呼。

export async function onRequest(context) {
  const { request } = context;
  if (request.method === 'POST') {
    // 部署版不需要保存配置，直接返回成功（兼容前端可能的调用）
    return Response.json({ ok: true });
  }
  return Response.json({
    hasKey: true,
    provider: 'workers-ai',
    locked: true
  });
}
