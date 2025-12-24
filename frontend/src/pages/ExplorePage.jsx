import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTimeWarpStore, useAIStore, ERAS } from '../store'
import { getHistoryStory, getEdgeInfo } from '../utils/api'

// 图标
const Icons = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bookmark: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  Share: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

// 时代选择器
const EraSelector = ({ selectedEra, onSelect }) => (
  <div className="era-selector">
    {ERAS.map((era) => (
      <button
        key={era.id}
        onClick={() => onSelect(era.id)}
        className={`era-option ${selectedEra === era.id ? 'active' : ''}`}
      >
        <span className="mr-1">{era.icon}</span>
        {era.name}
      </button>
    ))}
  </div>
)

// 历史故事卡片
const StoryCard = ({ story, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="story-card p-6 md:p-8"
  >
    {isLoading ? (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="loading-hourglass text-temporal-600 mb-4">⏳</div>
          <p className="text-sepia-600">正在穿越时空...</p>
          <p className="text-sm text-sepia-400 mt-2">AI 正在为您生成历史故事</p>
        </div>
      </div>
    ) : story ? (
      <div className="prose prose-sepia max-w-none">
        <div className="whitespace-pre-wrap text-sepia-800 leading-relaxed font-serif text-lg">
          {story}
        </div>
      </div>
    ) : (
      <div className="text-center py-12 text-sepia-500">
        选择一个时代，开始您的历史之旅
      </div>
    )}
  </motion.div>
)

// 时间线组件
const Timeline = ({ events }) => (
  <div className="timeline py-8">
    {events.map((event, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`timeline-item flex ${index % 2 === 0 ? 'justify-end pr-[52%]' : 'justify-start pl-[52%]'}`}
      >
        <div className="history-card p-4 max-w-sm">
          <div className="text-sm text-temporal-600 font-medium mb-1">{event.year}</div>
          <h4 className="font-semibold text-sepia-900 mb-2">{event.title}</h4>
          <p className="text-sm text-sepia-600">{event.description}</p>
        </div>
      </motion.div>
    ))}
  </div>
)

export default function ExplorePage() {
  const { location } = useParams()
  const navigate = useNavigate()

  const {
    selectedEra,
    selectEra,
    locationName,
    setLocationName,
    addTimeCapsule,
    edgeInfo,
    setEdgeInfo,
  } = useTimeWarpStore()

  const {
    isGenerating,
    setGenerating,
    streamContent,
    setStreamContent,
    appendStreamContent,
    reset: resetAI,
  } = useAIStore()

  const [story, setStory] = useState('')
  const [events, setEvents] = useState([])

  // 解码位置参数
  const decodedLocation = location ? decodeURIComponent(location) : locationName || '北京'

  // 获取边缘信息
  useEffect(() => {
    const fetchEdgeInfo = async () => {
      if (!edgeInfo) {
        const info = await getEdgeInfo()
        if (info) {
          setEdgeInfo(info)
        }
      }
    }
    fetchEdgeInfo()
  }, [])

  // 设置位置名称
  useEffect(() => {
    if (decodedLocation) {
      setLocationName(decodedLocation)
    }
  }, [decodedLocation])

  // 生成历史故事
  const generateStory = async () => {
    setGenerating(true)
    setStreamContent('')
    setStory('')

    try {
      const era = ERAS.find((e) => e.id === selectedEra)
      await getHistoryStory(
        decodedLocation,
        era?.name || '帝国时代',
        (chunk) => {
          appendStreamContent(chunk)
        }
      )
    } catch (error) {
      console.error('生成故事失败:', error)
      setStreamContent('抱歉，生成历史故事时出现错误，请稍后重试。')
    } finally {
      setGenerating(false)
    }
  }

  // 当时代或位置改变时，自动生成故事
  useEffect(() => {
    if (decodedLocation && selectedEra) {
      generateStory()
    }
  }, [selectedEra, decodedLocation])

  // 模拟历史事件
  useEffect(() => {
    const mockEvents = [
      { year: '公元前221年', title: '秦统一六国', description: '秦始皇统一中国，建立第一个中央集权制国家' },
      { year: '公元618年', title: '唐朝建立', description: '李渊建立唐朝，开启盛唐时代' },
      { year: '公元1368年', title: '明朝建立', description: '朱元璋建立明朝，定都南京' },
      { year: '公元1644年', title: '清朝入关', description: '清军入关，建立清朝统治' },
    ]
    setEvents(mockEvents)
  }, [decodedLocation])

  // 保存到时光胶囊
  const handleSave = () => {
    if (streamContent) {
      addTimeCapsule({
        location: decodedLocation,
        era: selectedEra,
        content: streamContent,
      })
      alert('已保存到时光胶囊！')
    }
  }

  // 分享
  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('链接已复制到剪贴板！')
  }

  return (
    <div className="min-h-screen paper-texture">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-sepia-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 rounded-lg hover:bg-sepia-100 text-sepia-600 transition-colors"
              >
                <Icons.ArrowLeft />
              </button>
              <div className="flex items-center gap-2">
                <Icons.MapPin />
                <h1 className="text-xl font-bold text-sepia-900 font-serif">
                  {decodedLocation}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={!streamContent || isGenerating}
                className="p-2 rounded-lg hover:bg-sepia-100 text-sepia-600 transition-colors disabled:opacity-50"
                title="保存到时光胶囊"
              >
                <Icons.Bookmark />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-sepia-100 text-sepia-600 transition-colors"
                title="分享"
              >
                <Icons.Share />
              </button>
              <button
                onClick={generateStory}
                disabled={isGenerating}
                className="p-2 rounded-lg hover:bg-sepia-100 text-sepia-600 transition-colors disabled:opacity-50"
                title="重新生成"
              >
                <Icons.Refresh />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* 时代选择器 */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-sm text-sepia-500 mb-2">选择历史时代</h2>
            <EraSelector selectedEra={selectedEra} onSelect={selectEra} />
          </div>
          {edgeInfo && (
            <div className="text-sm text-sepia-500">
              边缘节点: {edgeInfo.edgeNode} · 延迟: {edgeInfo.latency || '--'}ms
            </div>
          )}
        </div>

        {/* 当前时代信息 */}
        <motion.div
          key={selectedEra}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-6 bg-gradient-to-r from-temporal-50 to-antique-50 rounded-2xl border border-temporal-200"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">
              {ERAS.find((e) => e.id === selectedEra)?.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-sepia-900 font-serif">
                {ERAS.find((e) => e.id === selectedEra)?.name}
              </h3>
              <p className="text-sepia-600">
                {ERAS.find((e) => e.id === selectedEra)?.range}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 历史故事 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 主故事区域 */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-sepia-900 mb-4 font-serif flex items-center gap-2">
              <Icons.Clock />
              历史故事
            </h2>
            <StoryCard story={streamContent} isLoading={isGenerating} />
          </div>

          {/* 侧边栏 - 历史事件时间线 */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-sepia-900 mb-4 font-serif">
              重要历史事件
            </h2>
            <div className="space-y-4">
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="history-card p-4"
                >
                  <div className="text-sm text-temporal-600 font-medium mb-1">
                    {event.year}
                  </div>
                  <h4 className="font-semibold text-sepia-900 mb-1 font-serif">
                    {event.title}
                  </h4>
                  <p className="text-sm text-sepia-600">{event.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-sepia-200 bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-sepia-500">
          <p>
            历史故事由 AI 生成，仅供参考 ·
            <a
              href="https://www.aliyun.com/product/esa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-temporal-600 hover:text-temporal-700 ml-1"
            >
              Powered by 阿里云 ESA
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
