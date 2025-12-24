import axios from 'axios'
import { useSettingsStore } from '../store'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// AI API 端点
const AI_ENDPOINTS = {
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
}

// 使用浏览器 Geolocation API 获取位置
const getBrowserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

// 使用 Nominatim (OpenStreetMap) 逆地理编码获取城市名
const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=zh-CN`,
      {
        headers: {
          'User-Agent': 'TimeWarp-App/1.0',
        },
      }
    )
    const data = await response.json()
    const address = data.address || {}
    return {
      city: address.city || address.town || address.county || address.state || '',
      region: address.state || address.province || '',
      country: address.country || '中国',
      countryCode: address.country_code?.toUpperCase() || 'CN',
    }
  } catch (error) {
    console.error('逆地理编码失败:', error)
    return null
  }
}

// 根据城市推荐历史内容
const getHistoricalRecommendations = (city) => {
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
    '成都': [
      { era: 'ancient', title: '古蜀文明', description: '探索三星堆的神秘面纱' },
      { era: 'imperial', title: '三国蜀汉', description: '诸葛亮与刘备的传奇' },
    ],
    '洛阳': [
      { era: 'ancient', title: '东周王城', description: '周天子的都城' },
      { era: 'imperial', title: '神都洛阳', description: '武则天的帝国中心' },
    ],
    '广州': [
      { era: 'imperial', title: '海上丝路', description: '千年商都的繁华' },
      { era: 'modern', title: '辛亥革命', description: '黄花岗起义的壮烈' },
    ],
  }

  // 模糊匹配城市名
  for (const [key, value] of Object.entries(cityRecommendations)) {
    if (city && city.includes(key)) {
      return value
    }
  }

  return [
    { era: 'imperial', title: '华夏文明', description: '探索这片土地的历史记忆' },
  ]
}

// 获取边缘节点信息和地理位置
export const getEdgeInfo = async () => {
  try {
    // 首先尝试调用边缘函数
    const response = await api.get('/edge/info', { timeout: 3000 })
    return response.data
  } catch (error) {
    console.log('边缘函数不可用，使用浏览器定位...')

    // 边缘函数不可用，使用浏览器 Geolocation API
    try {
      const coords = await getBrowserLocation()
      const geoData = await reverseGeocode(coords.latitude, coords.longitude)

      const city = geoData?.city || ''

      return {
        success: true,
        geo: {
          ip: 'browser',
          country: geoData?.countryCode || 'CN',
          countryName: geoData?.country || '中国',
          city: city,
          region: geoData?.region || '',
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        edgeNode: 'Browser-Geolocation',
        recommendations: getHistoricalRecommendations(city),
      }
    } catch (geoError) {
      console.log('浏览器定位失败，使用默认值')
      // 浏览器定位也失败，返回默认值
      return {
        success: true,
        geo: {
          ip: 'unknown',
          country: 'CN',
          countryName: '中国',
          city: '',
          region: '',
        },
        edgeNode: 'Default',
        recommendations: [
          { era: 'imperial', title: '华夏文明', description: '探索这片土地的历史记忆' },
        ],
      }
    }
  }
}

// 根据坐标获取地名
export const getLocationName = async (latitude, longitude) => {
  try {
    const response = await api.get('/location/reverse', {
      params: { lat: latitude, lng: longitude },
    })
    return response.data
  } catch (error) {
    console.error('获取地名失败:', error)
    return null
  }
}

// 获取历史故事（直接调用 AI API）
export const getHistoryStory = async (location, era, onProgress) => {
  const settings = useSettingsStore.getState()
  const { apiProvider, apiKey, deepseekApiKey, selectedModel, streamEnabled, temperature, maxTokens } = settings

  // 获取当前有效的 API Key
  const currentApiKey = apiProvider === 'deepseek' ? deepseekApiKey : apiKey

  if (!currentApiKey) {
    throw new Error('请先在设置中配置 API Key')
  }

  const endpoint = AI_ENDPOINTS[apiProvider]
  const model = selectedModel || (apiProvider === 'qwen' ? 'qwen-turbo' : 'deepseek-chat')

  // 构建历史故事 Prompt
  const eraDescriptions = {
    'ancient': '公元前3000年至公元前221年，这是华夏文明的起源时期，包括夏商周三代',
    '远古时代': '公元前3000年至公元前221年，这是华夏文明的起源时期，包括夏商周三代',
    'imperial': '公元前221年至1912年，从秦始皇统一六国到清朝灭亡，历经两千多年的帝制时代',
    '帝国时代': '公元前221年至1912年，从秦始皇统一六国到清朝灭亡，历经两千多年的帝制时代',
    'modern': '1912年至1949年，从辛亥革命到新中国成立，这是中国历史上最动荡的时期之一',
    '近代': '1912年至1949年，从辛亥革命到新中国成立，这是中国历史上最动荡的时期之一',
    'contemporary': '1949年至2000年，新中国成立后的社会主义建设时期',
    '当代': '1949年至2000年，新中国成立后的社会主义建设时期',
    'recent': '2000年至今，中国快速发展的现代化时期',
    '近年': '2000年至今，中国快速发展的现代化时期',
  }

  const eraDesc = eraDescriptions[era] || eraDescriptions['imperial']
  const eraName = era || '帝国时代'

  const systemPrompt = `你是一位博学的历史学家和文学家，擅长用生动、沉浸式的语言讲述历史故事。
你的任务是根据用户提供的地点和时代，生成一段引人入胜的历史叙述。

写作要求：
1. 使用第二人称"你"来增强沉浸感，让读者仿佛身临其境
2. 描述当时的景象、声音、气味，调动读者的感官
3. 融入真实的历史事件和人物
4. 语言优美，富有文学性，避免干巴巴的历史教科书风格
5. 篇幅控制在 400-600 字
6. 不要使用 emoji 或特殊符号`

  const userPrompt = `请为我讲述${location}在${eraName}（${eraDesc}）的历史故事。

要求：
1. 以"你站在${location}的土地上..."或类似的沉浸式开头
2. 描述当时这片土地上发生的重要历史事件
3. 刻画当时人们的生活场景
4. 如果有著名历史人物与此地相关，请融入叙述
5. 结尾可以是对历史的感慨或与现代的对比

请开始你的历史叙述：`

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: streamEnabled,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API 错误:', errorText)
      throw new Error(`API 请求失败: ${response.status}`)
    }

    if (streamEnabled) {
      // 处理流式响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const json = JSON.parse(data)
              const content = json.choices?.[0]?.delta?.content
              if (content) {
                result += content
                if (onProgress) {
                  onProgress(content)
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      return result
    } else {
      // 非流式响应
      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''
      if (onProgress) {
        onProgress(content)
      }
      return content
    }
  } catch (error) {
    console.error('生成故事失败:', error)
    throw error
  }
}

// 获取历史事件列表
export const getHistoryEvents = async (location, era) => {
  try {
    const response = await api.post('/history/events', { location, era })
    return response.data
  } catch (error) {
    console.error('获取历史事件失败:', error)
    return []
  }
}

// 生成历史场景描述
export const generateSceneDescription = async (location, era, event) => {
  try {
    const response = await api.post('/history/scene', { location, era, event })
    return response.data
  } catch (error) {
    console.error('生成场景描述失败:', error)
    throw error
  }
}

// 搜索历史地点
export const searchHistoricalPlaces = async (query) => {
  try {
    const response = await api.get('/history/search', {
      params: { q: query },
    })
    return response.data
  } catch (error) {
    console.error('搜索失败:', error)
    return []
  }
}

// 获取热门历史地点
export const getPopularPlaces = async () => {
  // 返回预设的热门地点
  return [
    { name: '北京', description: '千年古都，帝王之城' },
    { name: '西安', description: '十三朝古都，丝路起点' },
    { name: '南京', description: '六朝古都，虎踞龙盘' },
    { name: '杭州', description: '人间天堂，南宋临安' },
    { name: '洛阳', description: '神都洛阳，牡丹花城' },
    { name: '成都', description: '天府之国，三国蜀汉' },
  ]
}

// 保存时光胶囊到边缘存储
export const saveTimeCapsule = async (capsule) => {
  try {
    const response = await api.post('/capsule/save', capsule)
    return response.data
  } catch (error) {
    console.error('保存时光胶囊失败:', error)
    throw error
  }
}

// 测量延迟
export const measureLatency = async () => {
  const start = performance.now()
  try {
    await api.get('/ping')
    return Math.round(performance.now() - start)
  } catch {
    return -1
  }
}

// 检查 API 配置是否有效
export const checkApiConfig = () => {
  const settings = useSettingsStore.getState()
  const { apiProvider, apiKey, deepseekApiKey } = settings

  if (apiProvider === 'deepseek') {
    return !!deepseekApiKey
  }
  return !!apiKey
}

export default api
