import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function StoryPage() {
  const { storyId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen paper-texture flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-sepia-900 mb-4 font-serif">
          故事详情页
        </h1>
        <p className="text-sepia-600 mb-6">Story ID: {storyId}</p>
        <button
          onClick={() => navigate(-1)}
          className="btn-vintage"
        >
          返回
        </button>
      </motion.div>
    </div>
  )
}
