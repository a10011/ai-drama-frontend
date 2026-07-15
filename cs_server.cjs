const http = require('http');
const crypto = require('crypto');

const PORT = parseInt(process.argv[2] || '3457');
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

function json(res, data, code = 200) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
  });
}

const AGENT_ROUTES = {
  drama: { name: '剧本创作', keywords: ['剧本','剧情','角色','创作','故事','脚本','台词','情节','人物','对白'] },
  video: { name: '视频生成', keywords: ['视频','生成','制作','剪辑','配音','转场','特效','动画','渲染'] },
  account: { name: '账户助手', keywords: ['积分','充值','会员','vip','余额','套餐','价格','支付','购买','订阅','到期'] },
};

function routeAgent(msg) {
  const m = msg.toLowerCase();
  for (const [key, val] of Object.entries(AGENT_ROUTES)) {
    if (val.keywords.some(k => m.includes(k))) return key;
  }
  return 'general';
}

const REPLIES = {
  drama: '我来帮您创作剧本！请告诉我您想写什么类型的短剧？\n\n悬疑 | 爱情 | 喜剧 | 古装 | 科幻 | 都市\n\n或者直接描述您的故事梗概，我来帮您展开成完整剧本。也可以转接专业剧本创作智能体为您服务。',
  video: '关于视频生成，我可以帮您：\n\n1. 在「创作」页面选择剧本后一键生成视频\n2. 上传素材让AI自动剪辑\n3. 选择AI配音和背景音乐\n4. 调整转场和特效\n\n需要我帮您操作哪一步？或者转接视频制作智能体？',
  account: '我来帮您处理账户问题！\n\n⭐ 查询积分：个人中心可查看\n💎 充值会员：点击头像→会员中心\n💰 购买套餐：商城页面有多种套餐可选\n\n您具体需要什么帮助？',
  general: '欢迎使用AI短剧平台！🎬\n\n常见问题：\n• 如何开始创作？→ 点击「新建剧本」\n• 怎么生成视频？→ 剧本页点击「生成视频」\n• 忘记密码？→ 登录页点击「忘记密码」\n\n您可以直接描述问题，我来帮您解决！需要更专业的帮助时，我可以转接专门的智能体处理。'
};

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = req.url;
  
  if ((req.method === 'POST' && url === '/api/cs/chat') || req.url.startsWith('/api/cs/chat?msg=')) {
    let message = '';
    let session = [];

    if (req.method === 'GET' && req.url.startsWith('/api/cs/chat?msg=')) {
      const parsed = new URL(req.url, 'http://localhost');
      message = parsed.searchParams.get('msg') || '';
      session = [];
    } else {
      const body = await readBody(req);
      message = body.message || '';
      session = body.session || [];
    }
    
    if (!message) return json(res, { error: '请输入消息' }, 400);
    
    const agent = routeAgent(message);
    const reply = REPLIES[agent] || REPLIES.general;
    json(res, { reply, agent });
    return;
  }
  
  if (url === '/health' || url === '/api/cs/health') {
    return json(res, { status: 'ok', uptime: process.uptime() });
  }
  
  res.writeHead(404); res.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('客服服务 http://0.0.0.0:' + PORT);
  console.log('POST /api/cs/chat');
});
