import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTimeWarpStore, useSettingsStore } from '../store'
import { getEdgeInfo } from '../utils/api'

// 图标组件
const Icons = {
  Clock: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

// 热门历史地点
const popularPlaces = [
  { id: 1, name: '北京故宫', location: '北京', era: 'imperial', image: '🏯' },
  { id: 2, name: '西安兵马俑', location: '西安', era: 'ancient', image: '⚔️' },
  { id: 3, name: '上海外滩', location: '上海', era: 'modern', image: '🌃' },
  { id: 4, name: '杭州西湖', location: '杭州', era: 'imperial', image: '🏞️' },
  { id: 5, name: '成都武侯祠', location: '成都', era: 'imperial', image: '🏛️' },
  { id: 6, name: '南京中山陵', location: '南京', era: 'modern', image: '🗿' },
]

// 特性卡片
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="history-card p-6"
  >
    <div className="w-12 h-12 rounded-xl bg-temporal-100 flex items-center justify-center text-temporal-600 mb-4">
      <Icon />
    </div>
    <h3 className="text-lg font-semibold text-sepia-900 mb-2 font-serif">{title}</h3>
    <p className="text-sepia-600 text-sm leading-relaxed">{description}</p>
  </motion.div>
)

// 时光粒子背景
const TimeParticles = () => (
  <div className="time-particles">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="time-particle"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 15}s`,
          animationDuration: `${15 + Math.random() * 10}s`,
        }}
      />
    ))}
  </div>
)

export default function HomePage() {
  const navigate = useNavigate()
  const { setUserLocation, setLocationName, setLocating, setLocationError, setEdgeInfo, edgeInfo } = useTimeWarpStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  // 获取边缘信息
  useEffect(() => {
    const fetchEdgeInfo = async () => {
      const info = await getEdgeInfo()
      if (info) {
        setEdgeInfo(info)
        // 如果有地理信息，自动设置位置
        if (info.geo?.city) {
          setLocationName(info.geo.city)
        }
      }
    }
    fetchEdgeInfo()
  }, [])

  // 获取用户位置
  const handleGetLocation = () => {
    setIsGettingLocation(true)
    setLocating(true)

    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持地理定位')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
        setIsGettingLocation(false)
        // 跳转到探索页面
        navigate('/explore')
      },
      (error) => {
        setLocationError('无法获取您的位置，请手动输入')
        setIsGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // 搜索地点
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore/${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // 选择热门地点
  const handleSelectPlace = (place) => {
    navigate(`/explore/${encodeURIComponent(place.location)}`)
  }

  return (
    <div className="min-h-screen paper-texture relative overflow-hidden">
      <TimeParticles />

      {/* 导航栏 */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-sepia-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="TimeWarp" className="w-10 h-10" />
            <div>
              <span className="text-xl font-bold text-sepia-900 font-serif">TimeWarp</span>
              <span className="text-xs text-sepia-500 block">边缘时光机</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {edgeInfo && (
              <div className="flex items-center gap-2 text-sm text-sepia-500">
                <Icons.Globe />
                <span>{edgeInfo.geo?.city || edgeInfo.edgeNode}</span>
              </div>
            )}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-lg hover:bg-sepia-100 text-sepia-600 hover:text-sepia-900 transition-colors"
              title="设置"
            >
              <Icons.Settings />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero 区域 */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-sepia-900 mb-6 font-serif leading-tight">
            探索你脚下这片土地的
            <br />
            <span className="text-temporal-600">千年历史</span>
          </h1>
          <p className="text-lg text-sepia-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            基于阿里云 ESA 边缘计算，自动识别您的地理位置，
            <br />
            AI 实时生成沉浸式历史故事，穿越时空，感受历史的温度。
          </p>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-3 p-2 bg-white rounded-2xl shadow-lg border border-sepia-200">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Icons.Search />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="输入地点名称，如：北京、西安、上海..."
                  className="flex-1 py-3 bg-transparent outline-none text-sepia-900 placeholder-sepia-400"
                />
              </div>
              <button
                type="submit"
                className="btn-vintage flex items-center gap-2"
              >
                开始探索
                <Icons.ArrowRight />
              </button>
            </div>
          </form>

          {/* 或者使用当前位置 */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-sepia-400">或者</span>
            <button
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              className="btn-vintage-outline flex items-center gap-2"
            >
              <Icons.MapPin />
              {isGettingLocation ? '定位中...' : '使用当前位置'}
            </button>
          </div>
        </motion.div>

        {/* 特性展示 */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={Icons.MapPin}
            title="Geo-IP 智能定位"
            description="基于 ESA 边缘节点自动识别您的地理位置，无需手动输入即可开始历史之旅"
            delay={0.2}
          />
          <FeatureCard
            icon={Icons.Sparkles}
            title="AI 沉浸式叙事"
            description="通义千问大模型实时生成历史故事，流式响应让您身临其境感受历史"
            delay={0.3}
          />
          <FeatureCard
            icon={Icons.Clock}
            title="多时代穿越"
            description="从远古到当代，选择不同时代探索同一地点的历史变迁"
            delay={0.4}
          />
        </div>

        {/* 热门历史地点 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-sepia-900 mb-6 font-serif text-center">
            热门历史地点
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularPlaces.map((place, index) => (
              <motion.button
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => handleSelectPlace(place)}
                className="history-card p-5 text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{place.image}</div>
                  <div>
                    <h3 className="font-semibold text-sepia-900 group-hover:text-temporal-600 transition-colors">
                      {place.name}
                    </h3>
                    <p className="text-sm text-sepia-500">{place.location}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 border-t border-sepia-200 bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-sepia-500">
              <span>Powered by</span>
              <a
                href="https://www.aliyun.com/product/esa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-temporal-600 hover:text-temporal-700 font-medium"
              >
                阿里云 ESA
              </a>
            </div>
            <div className="text-sm text-sepia-400">
              TimeWarp - 边缘时光机 · 探索历史的温度
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
