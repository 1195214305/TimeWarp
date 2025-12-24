import { motion, AnimatePresence } from 'framer-motion'
import { useTimeWarpStore, ERAS } from '../store'

export default function StoryCollection() {
  const { timeCapsules, removeTimeCapsule } = useTimeWarpStore()

  // 确保 timeCapsules 是数组
  const capsules = timeCapsules || []

  // 获取时代信息
  const getEraInfo = (eraId) => {
    return ERAS.find(e => e.id === eraId) || ERAS[0]
  }

  // 格式化日期
  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-sepia-200 shadow-lg"
    >
      <h3 className="text-lg font-bold text-sepia-900 mb-3 flex items-center gap-2 font-serif">
        <span className="text-2xl">📚</span>
        故事收藏夹
        {capsules.length > 0 && (
          <span className="text-xs bg-temporal-100 px-2 py-0.5 rounded-full text-temporal-700">
            {capsules.length}
          </span>
        )}
      </h3>

      <div className="max-h-48 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-sepia-200">
        <AnimatePresence>
          {capsules.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6"
            >
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-sepia-400 text-sm">还没有收藏的故事</p>
              <p className="text-sepia-300 text-xs mt-1">探索历史，保存你喜欢的时光胶囊</p>
            </motion.div>
          ) : (
            capsules.slice(0, 5).map((capsule, idx) => {
              const eraInfo = getEraInfo(capsule.era)

              return (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative bg-sepia-50 hover:bg-sepia-100 rounded-xl p-3 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{eraInfo.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sepia-800 font-medium text-sm truncate">
                        {capsule.title || '未命名胶囊'}
                      </h4>
                      <p className="text-sepia-500 text-xs truncate">
                        {capsule.location?.name || capsule.location || '未知地点'} · {eraInfo.name}
                      </p>
                      <p className="text-sepia-400 text-xs mt-1">
                        {formatDate(capsule.createdAt)}
                      </p>
                    </div>
                    {/* 删除按钮 */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTimeCapsule(capsule.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-lg"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* 预览内容 */}
                  {capsule.content && (
                    <p className="text-sepia-400 text-xs mt-2 line-clamp-2">
                      {capsule.content}
                    </p>
                  )}
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>

      {/* 查看全部按钮 */}
      {capsules.length > 5 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-3 py-2 bg-sepia-100 hover:bg-sepia-200 rounded-lg text-sepia-600 text-sm transition-colors"
        >
          查看全部 {capsules.length} 个收藏
        </motion.button>
      )}

      {/* 快捷操作 */}
      {capsules.length > 0 && (
        <div className="flex gap-2 mt-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 bg-gradient-to-r from-temporal-100 to-temporal-200 hover:from-temporal-200 hover:to-temporal-300 rounded-lg text-temporal-700 text-xs transition-colors flex items-center justify-center gap-1"
          >
            <span>📤</span> 分享收藏
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 bg-sepia-100 hover:bg-sepia-200 rounded-lg text-sepia-600 text-xs transition-colors flex items-center justify-center gap-1"
          >
            <span>🔀</span> 随机回顾
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
