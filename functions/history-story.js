/**
 * TimeWarp - 历史故事生成边缘函数
 * 路径: /api/history-story
 */

const QWEN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const API_KEY = 'sk-54ae495d0e8e4dfb92607467bfcdf357';

export default async function handler(request) {
  // CORS 处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    const body = await request.json();
    const { location, era } = body;

    if (!location) {
      return new Response(JSON.stringify({ error: 'Location is required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 构建历史故事生成 Prompt
    const prompt = buildHistoryPrompt(location, era);

    // 调用通义千问 API（流式响应）
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
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.85,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    // 创建流式响应
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // 处理流式响应
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
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Edge-AI': 'streaming',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('History story generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// 构建历史故事 Prompt
function buildHistoryPrompt(location, era) {
  const eraDescriptions = {
    '远古时代': '公元前3000年至公元前221年，这是华夏文明的起源时期，包括夏商周三代',
    '帝国时代': '公元前221年至1912年，从秦始皇统一六国到清朝灭亡，历经两千多年的帝制时代',
    '近代': '1912年至1949年，从辛亥革命到新中国成立，这是中国历史上最动荡的时期之一',
    '当代': '1949年至2000年，新中国成立后的社会主义建设时期',
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
