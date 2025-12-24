/**
 * TimeWarp - 边缘时光机
 * 主入口 Edge Function
 */

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = 'sk-54ae495d0e8e4dfb92607467bfcdf357';

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 主请求处理
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // API 路由
  if (path === '/api/edge/info' || path === '/api/edge/info/') {
    return handleEdgeInfo(request);
  }

  if (path === '/api/history/story' || path === '/api/history/story/') {
    return handleHistoryStory(request);
  }

  // 静态文件回退
  if (env && env.ASSETS) {
    return env.ASSETS.fetch(request);
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 边缘信息处理
async function handleEdgeInfo(request) {
  const startTime = Date.now();
  const headers = request.headers;

  const geoInfo = {
    ip: headers.get('x-real-ip') || headers.get('cf-connecting-ip') || 'unknown',
    country: headers.get('x-geo-country') || headers.get('cf-ipcountry') || 'CN',
    countryName: getCountryName(headers.get('x-geo-country') || 'CN'),
    region: headers.get('x-geo-region') || '',
    city: headers.get('x-geo-city') || '',
    latitude: headers.get('x-geo-latitude') || '',
    longitude: headers.get('x-geo-longitude') || '',
    timezone: headers.get('x-geo-timezone') || 'Asia/Shanghai',
  };

  const edgeNode = headers.get('x-edge-node') ||
                   headers.get('cf-ray')?.split('-')[1] ||
                   'CN-Shanghai';

  const recommendations = getHistoricalRecommendations(geoInfo.city || geoInfo.region);

  const response = {
    success: true,
    timestamp: startTime,
    latency: Date.now() - startTime,
    geo: geoInfo,
    edgeNode: edgeNode,
    recommendations: recommendations,
  };

  return new Response(JSON.stringify(response), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Edge-Time': `${Date.now() - startTime}ms`,
    },
  });
}

// 历史故事生成
async function handleHistoryStory(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { location, era } = body;

    if (!location) {
      return new Response(JSON.stringify({ error: 'Location is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildHistoryPrompt(location, era);

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一位博学的历史学家和文学家，擅长用生动、沉浸式的语言讲述历史故事。
你的任务是根据用户提供的地点和时代，生成一段引人入胜的历史叙述。

写作要求：
1. 使用第二人称"你"来增强沉浸感，让读者仿佛身临其境
2. 描述当时的景象、声音、气味，调动读者的感官
3. 融入真实的历史事件和人物
4. 语言优美，富有文学性，避免干巴巴的历史教科书风格
5. 篇幅控制在 400-600 字
6. 不要使用 emoji 或特殊符号`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    // 流式响应
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const json = JSON.parse(data);
                const content = json.choices?.[0]?.delta?.content;
                if (content) {
                  await writer.write(encoder.encode(content));
                }
              } catch (e) {}
            }
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// 辅助函数
function getCountryName(code) {
  const countries = {
    'CN': '中国', 'US': '美国', 'JP': '日本', 'KR': '韩国',
    'GB': '英国', 'DE': '德国', 'FR': '法国', 'SG': '新加坡',
  };
  return countries[code] || code;
}

function getHistoricalRecommendations(city) {
  const cityRecommendations = {
    '北京': [
      { era: 'imperial', title: '紫禁城的故事', description: '探索明清两代皇宫的辉煌历史' },
      { era: 'modern', title: '五四运动', description: '1919年改变中国命运的学生运动' },
    ],
    '上海': [
      { era: 'modern', title: '十里洋场', description: '感受民国时期的繁华与动荡' },
      { era: 'contemporary', title: '浦东开发', description: '见证中国改革开放的奇迹' },
    ],
    '西安': [
      { era: 'ancient', title: '秦始皇陵', description: '探索千古一帝的地下王国' },
      { era: 'imperial', title: '大唐盛世', description: '重温长安城的繁华岁月' },
    ],
  };
  return cityRecommendations[city] || [
    { era: 'imperial', title: '华夏文明', description: '探索这片土地的历史记忆' },
  ];
}

function buildHistoryPrompt(location, era) {
  const eraDescriptions = {
    '远古时代': '公元前3000年至公元前221年，华夏文明的起源时期',
    '帝国时代': '公元前221年至1912年，从秦始皇统一六国到清朝灭亡',
    '近代': '1912年至1949年，从辛亥革命到新中国成立',
    '当代': '1949年至2000年，新中国成立后的建设时期',
    '近年': '2000年至今，中国快速发展的现代化时期',
  };
  const eraDesc = eraDescriptions[era] || eraDescriptions['帝国时代'];

  return `请为我讲述${location}在${era}（${eraDesc}）的历史故事。

要求：
1. 以"你站在${location}的土地上..."或类似的沉浸式开头
2. 描述当时这片土地上发生的重要历史事件
3. 刻画当时人们的生活场景
4. 如果有著名历史人物与此地相关，请融入叙述
5. 结尾可以是对历史的感慨或与现代的对比

请开始你的历史叙述：`;
}

export default {
  fetch: handleRequest
}
