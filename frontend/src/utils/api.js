import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// 获取边缘节点信息和地理位置
export const getEdgeInfo = async () => {
  try {
    const response = await api.get('/edge/info')
    return response.data
  } catch (error) {
    console.error('获取边缘信息失败:', error)
    return null
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

// 获取历史故事（流式响应）
export const getHistoryStory = async (location, era, onProgress) => {
  try {
    const response = await fetch('/api/history/story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location, era }),
    })

    if (!response.ok) {
      throw new Error('获取历史故事失败')
    }

    // 处理流式响应
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let result = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      result += chunk

      if (onProgress) {
        onProgress(chunk)
      }
    }

    return result
  } catch (error) {
    console.error('获取历史故事失败:', error)
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
  try {
    const response = await api.get('/history/popular')
    return response.data
  } catch (error) {
    console.error('获取热门地点失败:', error)
    return []
  }
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

export default api
