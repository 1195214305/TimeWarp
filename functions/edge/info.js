/**
 * TimeWarp - 边缘信息获取函数
 * 路径: /api/edge/info
 */

export default async function handler(request) {
  const startTime = Date.now();

  // CORS 处理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // 获取请求头中的地理信息
  const headers = request.headers;

  // 阿里云 ESA 提供的地理位置头
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

  // 边缘节点信息
  const edgeNode = headers.get('x-edge-node') ||
                   headers.get('cf-ray')?.split('-')[1] ||
                   'CN-Shanghai';

  // 根据地理位置推荐历史内容
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
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Edge-Time': `${Date.now() - startTime}ms`,
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// 获取国家名称
function getCountryName(code) {
  const countries = {
    'CN': '中国',
    'US': '美国',
    'JP': '日本',
    'KR': '韩国',
    'GB': '英国',
    'DE': '德国',
    'FR': '法国',
    'SG': '新加坡',
    'HK': '香港',
    'TW': '台湾',
  };
  return countries[code] || code;
}

// 根据城市推荐历史内容
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
    '杭州': [
      { era: 'imperial', title: '南宋临安', description: '感受"暖风熏得游人醉"的繁华' },
      { era: 'imperial', title: '白娘子传说', description: '西湖边流传千年的爱情故事' },
    ],
    '南京': [
      { era: 'imperial', title: '六朝古都', description: '探索金陵的千年沧桑' },
      { era: 'modern', title: '民国首都', description: '见证中华民国的兴衰' },
    ],
  };

  return cityRecommendations[city] || [
    { era: 'imperial', title: '华夏文明', description: '探索这片土地的历史记忆' },
  ];
}
