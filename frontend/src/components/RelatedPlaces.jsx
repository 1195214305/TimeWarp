import { motion } from 'framer-motion'
import { RELATED_PLACES, ERAS } from '../store'

export default function RelatedPlaces({ location, currentEra }) {
  // 获取当前位置的相关地点，如果没有则使用默认
  const cityName = location?.city || location?.name || ''
  const places = RELATED_PLACES[cityName] || RELATED_PLACES['default']

  // 获取时代信息
  const getEraInfo = (eraId) => {
    return ERAS.find(e => e.id === eraId) || ERAS[0]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-sepia-200 shadow-lg"
    >
      <h3 className="text-lg font-bold text-sepia-900 mb-3 flex items-center gap-2 font-serif">
        <span className="text-2xl">📍</span>
        附近历史名胜
        {cityName && (
          <span className="text-sm font-normal text-sepia-500">· {cityName}</span>
        )}
      </h3>

      <div className="space-y-2">
        {places.map((place, idx) => {
          const eraInfo = getEraInfo(place.era)
          const isCurrentEra = place.era === currentEra

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                isCurrentEra
                  ? 'bg-gradient-to-r ' + eraInfo.color + ' ring-2 ring-temporal-300'
                  : 'bg-sepia-50 hover:bg-sepia-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{eraInfo.icon}</span>
                  <div>
                    <h4 className={`font-medium ${isCurrentEra ? 'text-white' : 'text-sepia-800'}`}>
                      {place.name}
                    </h4>
                    <p className={`text-xs ${isCurrentEra ? 'text-white/70' : 'text-sepia-500'}`}>
                      {place.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isCurrentEra ? 'bg-white/30 text-white' : 'bg-sepia-200 text-sepia-600'
                  }`}>
                    {eraInfo.name}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 探索更多按钮 */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-3 py-2 bg-sepia-100 hover:bg-sepia-200 rounded-lg text-sepia-600 text-sm transition-colors flex items-center justify-center gap-2"
      >
        <span>🗺️</span>
        探索更多地点
      </motion.button>
    </motion.div>
  )
}
