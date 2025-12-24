import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSettingsStore, AI_MODELS } from '../store'

// 图标
const Icons = {
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Key: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const {
    apiProvider,
    apiKey,
    deepseekApiKey,
    selectedModel,
    streamEnabled,
    temperature,
    maxTokens,
    setApiProvider,
    setApiKey,
    setDeepseekApiKey,
    setSelectedModel,
    setStreamEnabled,
    setTemperature,
    setMaxTokens,
    resetSettings,
  } = useSettingsStore()

  const [showQwenKey, setShowQwenKey] = useState(false)
  const [showDeepseekKey, setShowDeepseekKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const qwenModels = AI_MODELS.filter(m => m.provider === 'qwen')
  const deepseekModels = AI_MODELS.filter(m => m.provider === 'deepseek')

  return (
    <div className="min-h-screen paper-texture">
      {/* 头部 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sepia-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sepia-600 hover:text-sepia-800 transition-colors"
          >
            <Icons.ArrowLeft />
            <span>返回</span>
          </button>
          <h1 className="text-xl font-serif text-sepia-800 flex items-center gap-2">
            <Icons.Settings />
            设置
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* API 提供商选择 */}
          <section className="bg-white rounded-xl shadow-sm border border-sepia-200 p-6">
            <h2 className="text-lg font-semibold text-sepia-800 mb-4 flex items-center gap-2">
              <Icons.Key />
              AI 模型配置
            </h2>

            <div className="space-y-6">
              {/* 提供商选择 */}
              <div>
                <label className="block text-sm font-medium text-sepia-700 mb-3">
                  选择 AI 提供商
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setApiProvider('qwen')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      apiProvider === 'qwen'
                        ? 'border-time-500 bg-time-50'
                        : 'border-sepia-200 hover:border-sepia-300'
                    }`}
                  >
                    <div className="font-medium text-sepia-800">通义千问</div>
                    <div className="text-sm text-sepia-500 mt-1">阿里云大模型</div>
                  </button>
                  <button
                    onClick={() => setApiProvider('deepseek')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      apiProvider === 'deepseek'
                        ? 'border-time-500 bg-time-50'
                        : 'border-sepia-200 hover:border-sepia-300'
                    }`}
                  >
                    <div className="font-medium text-sepia-800">DeepSeek</div>
                    <div className="text-sm text-sepia-500 mt-1">高性价比选择</div>
                  </button>
                </div>
              </div>

              {/* 通义千问配置 */}
              <div className={apiProvider === 'qwen' ? '' : 'opacity-50 pointer-events-none'}>
                <label className="block text-sm font-medium text-sepia-700 mb-2">
                  通义千问 API Key
                </label>
                <div className="relative">
                  <input
                    type={showQwenKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-sepia-200 focus:border-time-500 focus:ring-2 focus:ring-time-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowQwenKey(!showQwenKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sepia-400 hover:text-sepia-600"
                  >
                    {showQwenKey ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
                <p className="mt-2 text-sm text-sepia-500">
                  获取方式：访问 <a href="https://dashscope.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-time-600 hover:underline">阿里云百炼控制台</a> 创建 API Key
                </p>

                {/* 模型选择 */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-sepia-700 mb-2">
                    选择模型
                  </label>
                  <div className="space-y-2">
                    {qwenModels.map((model) => (
                      <label
                        key={model.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedModel === model.id
                            ? 'border-time-500 bg-time-50'
                            : 'border-sepia-200 hover:border-sepia-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="qwen-model"
                          value={model.id}
                          checked={selectedModel === model.id}
                          onChange={() => setSelectedModel(model.id)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sepia-800">{model.name}</div>
                          <div className="text-sm text-sepia-500">{model.description}</div>
                        </div>
                        {selectedModel === model.id && (
                          <Icons.Check />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* DeepSeek 配置 */}
              <div className={apiProvider === 'deepseek' ? '' : 'opacity-50 pointer-events-none'}>
                <label className="block text-sm font-medium text-sepia-700 mb-2">
                  DeepSeek API Key
                </label>
                <div className="relative">
                  <input
                    type={showDeepseekKey ? 'text' : 'password'}
                    value={deepseekApiKey}
                    onChange={(e) => setDeepseekApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-sepia-200 focus:border-time-500 focus:ring-2 focus:ring-time-500/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sepia-400 hover:text-sepia-600"
                  >
                    {showDeepseekKey ? <Icons.EyeOff /> : <Icons.Eye />}
                  </button>
                </div>
                <p className="mt-2 text-sm text-sepia-500">
                  获取方式：访问 <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-time-600 hover:underline">DeepSeek 开放平台</a> 创建 API Key
                </p>

                {/* 模型选择 */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-sepia-700 mb-2">
                    选择模型
                  </label>
                  <div className="space-y-2">
                    {deepseekModels.map((model) => (
                      <label
                        key={model.id}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedModel === model.id
                            ? 'border-time-500 bg-time-50'
                            : 'border-sepia-200 hover:border-sepia-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deepseek-model"
                          value={model.id}
                          checked={selectedModel === model.id}
                          onChange={() => setSelectedModel(model.id)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sepia-800">{model.name}</div>
                          <div className="text-sm text-sepia-500">{model.description}</div>
                        </div>
                        {selectedModel === model.id && (
                          <Icons.Check />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 高级设置 */}
          <section className="bg-white rounded-xl shadow-sm border border-sepia-200 p-6">
            <h2 className="text-lg font-semibold text-sepia-800 mb-4">
              高级设置
            </h2>

            <div className="space-y-6">
              {/* 流式响应 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sepia-800">流式响应</div>
                  <div className="text-sm text-sepia-500">实时显示 AI 生成内容</div>
                </div>
                <button
                  onClick={() => setStreamEnabled(!streamEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    streamEnabled ? 'bg-time-500' : 'bg-sepia-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      streamEnabled ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* 温度 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-sepia-800">创意度 (Temperature)</div>
                    <div className="text-sm text-sepia-500">值越高，生成内容越有创意</div>
                  </div>
                  <span className="text-time-600 font-medium">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-sepia-200 rounded-lg appearance-none cursor-pointer accent-time-500"
                />
                <div className="flex justify-between text-xs text-sepia-400 mt-1">
                  <span>精确</span>
                  <span>创意</span>
                </div>
              </div>

              {/* 最大 tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-sepia-800">最大长度 (Max Tokens)</div>
                    <div className="text-sm text-sepia-500">生成内容的最大长度</div>
                  </div>
                  <span className="text-time-600 font-medium">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="100"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-2 bg-sepia-200 rounded-lg appearance-none cursor-pointer accent-time-500"
                />
                <div className="flex justify-between text-xs text-sepia-400 mt-1">
                  <span>500</span>
                  <span>4000</span>
                </div>
              </div>
            </div>
          </section>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-time-600 text-white rounded-lg font-medium hover:bg-time-700 transition-colors flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <Icons.Check />
                  已保存
                </>
              ) : (
                '保存设置'
              )}
            </button>
            <button
              onClick={resetSettings}
              className="px-6 py-3 border border-sepia-300 text-sepia-600 rounded-lg font-medium hover:bg-sepia-50 transition-colors"
            >
              重置
            </button>
          </div>

          {/* 提示信息 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>安全提示：</strong>API Key 仅保存在您的浏览器本地存储中，不会上传到服务器。请妥善保管您的 API Key，不要分享给他人。
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
