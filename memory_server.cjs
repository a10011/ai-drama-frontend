#!/usr/bin/env node
// 记忆 + 客服服务
const http = require('http');
const url = require('url');

const PORT = parseInt(process.argv[2] || '3456');
const memories = {};

const REPLIES = {
  drama: '我来帮您创作剧本！请告诉我您想写什么类型的短剧？\n\n悬疑 | 爱情 | 喜剧 | 古装 | 科幻 | 都市\n\n或者直接描述故事梗概，我来帮您展开成完整剧本。也可以转接专业剧本创作智能体为您服务。',
  video: '关于视频生成，我可以帮您：\n\n1. 在「创作」页面选择剧本后一键生成视频\n2. 上传素材让AI自动剪辑\n3. 选择AI配音和背景音乐\n\n需要我帮您操作哪一步？或者转接视频制作智能体？',
  account: '我来帮您处理账户问题！\n\n积分查询：个人中心可查看\n充值会员：点击头像进入会员中心\n购买套餐：商城页面有多种套餐可选\n\n您具体需要什么帮助？',
  general: '欢迎使用AI短剧平台！\n\n常见问题：\n如何开始创作？点击「新建剧本」\n怎么生成视频？剧本页点击「生成视频」\n忘记密码？登录页点击「忘记密码」\n\n您可以直接描述问题，我来帮您解决！',
};

const ROUTES = {
  drama: ['剧本','剧情','角色','创作','故事','脚本','台词','情节','人物','对白','大纲','梗概'],
  video: ['视频','生成','制作','剪辑','配音','转场','特效','动画','渲染','导出'],
  account: ['积分','充值','会员','vip','余额','套餐','价格','支付','购买','订阅','到期','钱包'],
};

function routeAgent(msg) {
  const m = msg.toLowerCase();
  for (const [key, kws] of Object.entries(ROUTES)) {
    if (kws.some(k => m.includes(k))) return key;
  }
  return 'general';
}

function json(res, data, code) {
  if (!code) code = 200;
  const s = JSON.stringify(data);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(s);
}

function readBody(req) {
  return new Promise(function(resolve) {
    var b = '';
    req.on('data', function(c) { b += c; });
    req.on('end', function() {
      try { resolve(JSON.parse(b)); } catch(e) { resolve({}); }
    });
  });
}

var server = http.createServer(async function(req, res) {
  var uri = url.parse(req.url, true);
  var path = uri.pathname;

  // 客服聊天 - 支持GET（避免nginx拦截POST）
  if (path === '/api/cs/chat' || path === '/api/memory/cs/chat') {
    var message = '';
    if (req.method === 'GET') {
      message = uri.query.msg || '';
    } else {
      var body = await readBody(req);
      message = body.message || '';
    }
    if (!message) {
      json(res, { error: '请输入消息' }, 400);
      return;
    }
    var agent = routeAgent(message);
    var reply = REPLIES[agent] || REPLIES.general;
    json(res, { reply: reply, agent: agent });
    return;
  }

  // 记忆查询
  if (req.method === 'GET' && path === '/api/memory/query') {
    var q = uri.query.q || '';
    var key = uri.query.key || 'default';
    var limit = parseInt(uri.query.limit || '10');
    var items = (memories[key] || []).filter(function(m) { return !q || (m.content || '').toLowerCase().indexOf(q.toLowerCase()) >= 0; }).slice(-limit);
    json(res, { success: true, data: items });
    return;
  }

  if (path === '/health' || path === '/api/memory/health') {
    json(res, { status: 'ok' });
    return;
  }

  json(res, { error: 'Not Found' }, 404);
});

server.listen(PORT, '0.0.0.0', function() {
  console.log('OK port ' + PORT);
});
