import { motion } from 'framer-motion'
import { ERAS } from '../store'

export default function EraDetailCard({ currentEra, onEraChange }) {
  const era = ERAS.find(e => e.id === currentEra) || ERAS[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-sepia-200 shadow-lg"
    >
      <h3 className="text-lg font-bold text-sepia-900 mb-3 flex items-center gap-2 font-serif">
        <span className="text-2xl">{era.icon}</span>
        时代切换
      </h3>

      {/* 当前时代详情 */}
      <div className={`bg-gradient-to-r ${era.color} rounded-xl p-4 mb-4`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xl font-bold text-white">{era.name}</h4>
          <span className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
            {era.range}
          </span>
        </div>
        <p className="text-white/90 text-sm mb-3">{era.description}</p>

        {/* 时代特点 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {era.features.map((feature, idx) => (
            <span
              key={idx}
              className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* 代表人物 */}
        <div className="border-t border-white/20 pt-2">
          <span className="text-xs text-white/70">代表人物：</span>
          <span className="text-sm text-white ml-1">
            {era.figures.join('、')}
          </span>
        </div>
      </div>

      {/* 时代选择器 */}
      <div className="grid grid-cols-5 gap-1">
        {ERAS.map((e) => (
          <motion.button
            key={e.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEraChange(e.id)}
            className={`p-2 rounded-lg text-center transition-all ${
              e.id === currentEra
                ? 'bg-temporal-100 ring-2 ring-temporal-400'
                : 'bg-sepia-50 hover:bg-sepia-100'
            }`}
          >
            <span className="text-xl block">{e.icon}</span>
            <span className="text-[10px] text-sepia-600 block truncate">{e.name}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
