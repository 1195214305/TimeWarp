import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AIChatBox({ location, era, onAskQuestion }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const suggestedQuestions = [
    '这里发生过什么重大事件？',
    '有什么历史名人来过这里？',
    '这个时代的生活是什么样的？',
    '有什么有趣的历史故事？',
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    const userMessage = question.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setQuestion('')
    setIsLoading(true)

    try {
      // 调用父组件的问答函数
      if (onAskQuestion) {
        const answer = await onAskQuestion(userMessage, location, era)
        setMessages(prev => [...prev, { role: 'assistant', content: answer }])
      } else {
        // 模拟回答
        await new Promise(resolve => setTimeout(resolve, 1000))
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `关于"${userMessage}"，在${location || '这个地方'}的${era || '历史'}中，有很多有趣的故事等待探索...`
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '抱歉，暂时无法回答这个问题，请稍后再试。'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestedQuestion = (q) => {
    setQuestion(q)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-sepia-200 shadow-lg"
    >
      <h3 className="text-lg font-bold text-sepia-900 mb-3 flex items-center gap-2 font-serif">
        <span className="text-2xl">💬</span>
        AI 历史问答
      </h3>

      {/* 消息列表 */}
      <div className="h-32 overflow-y-auto mb-3 space-y-2 scrollbar-thin scrollbar-thumb-sepia-200">
        <AnimatePresence>
          {messages.length === 0 ? (
            <p className="text-sepia-400 text-sm text-center py-4">
              问我任何关于历史的问题...
            </p>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-temporal-100 text-sepia-800 ml-4'
                    : 'bg-sepia-100 text-sepia-700 mr-4'
                }`}
              >
                {msg.content}
              </motion.div>
            ))
          )}
        </AnimatePresence>
        {isLoading && (
          <div className="flex items-center gap-2 text-sepia-400 text-sm p-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-temporal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-temporal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-temporal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            思考中...
          </div>
        )}
      </div>

      {/* 快捷问题 */}
      <div className="flex flex-wrap gap-1 mb-3">
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestedQuestion(q)}
            className="text-xs bg-sepia-100 hover:bg-sepia-200 text-sepia-600 px-2 py-1 rounded-full transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="输入你的问题..."
          className="flex-1 bg-white border border-sepia-200 rounded-lg px-3 py-2 text-sepia-800 text-sm placeholder-sepia-400 focus:outline-none focus:ring-2 focus:ring-temporal-300"
        />
        <motion.button
          type="submit"
          disabled={isLoading || !question.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-temporal-500 to-temporal-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          发送
        </motion.button>
      </form>
    </motion.div>
  )
}
