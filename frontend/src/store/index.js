import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 历史时代定义（增强版）
export const ERAS = [
  {
    id: 'ancient',
    name: '远古时代',
    range: '公元前3000年-公元前221年',
    icon: '🏛️',
    description: '华夏文明的起源，夏商周三代更迭，诸子百家争鸣',
    features: ['甲骨文', '青铜器', '诸子百家', '春秋战国'],
    figures: ['黄帝', '大禹', '周公', '孔子', '老子'],
    color: 'from-amber-500 to-orange-600'
  },
  {
    id: 'imperial',
    name: '帝国时代',
    range: '公元前221年-公元1912年',
    icon: '👑',
    description: '从秦统一到清朝灭亡，两千年帝制王朝的兴衰更替',
    features: ['中央集权', '科举制度', '丝绸之路', '四大发明'],
    figures: ['秦始皇', '汉武帝', '唐太宗', '康熙帝'],
    color: 'from-red-500 to-rose-600'
  },
  {
    id: 'modern',
    name: '近代',
    range: '1912年-1949年',
    icon: '🏭',
    description: '辛亥革命推翻帝制，民国建立，抗日战争，解放战争',
    features: ['辛亥革命', '五四运动', '抗日战争', '解放战争'],
    figures: ['孙中山', '蒋介石', '毛泽东', '周恩来'],
    color: 'from-gray-500 to-slate-600'
  },
  {
    id: 'contemporary',
    name: '当代',
    range: '1949年-2000年',
    icon: '🌆',
    description: '新中国成立，社会主义建设，改革开放，经济腾飞',
    features: ['土地改革', '两弹一星', '改革开放', '经济特区'],
    figures: ['毛泽东', '邓小平', '袁隆平', '钱学森'],
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'recent',
    name: '近年',
    range: '2000年-至今',
    icon: '🌐',
    description: '加入WTO，北京奥运，高铁时代，数字中国',
    features: ['互联网+', '高铁网络', '移动支付', '人工智能'],
    figures: ['马云', '任正非', '屠呦呦', '杨利伟'],
    color: 'from-emerald-500 to-teal-600'
  },
]

// 相关地点数据
export const RELATED_PLACES = {
  '北京': [
    { name: '故宫', type: '皇家宫殿', era: 'imperial' },
    { name: '长城', type: '军事防御', era: 'ancient' },
    { name: '颐和园', type: '皇家园林', era: 'imperial' },
    { name: '天坛', type: '祭祀建筑', era: 'imperial' },
  ],
  '西安': [
    { name: '兵马俑', type: '帝王陵墓', era: 'ancient' },
    { name: '大雁塔', type: '佛教建筑', era: 'imperial' },
    { name: '华清池', type: '皇家温泉', era: 'imperial' },
    { name: '城墙', type: '军事防御', era: 'imperial' },
  ],
  '南京': [
    { name: '中山陵', type: '陵墓建筑', era: 'modern' },
    { name: '明孝陵', type: '帝王陵墓', era: 'imperial' },
    { name: '夫子庙', type: '文化建筑', era: 'imperial' },
    { name: '总统府', type: '政治建筑', era: 'modern' },
  ],
  '杭州': [
    { name: '西湖', type: '自然景观', era: 'imperial' },
    { name: '灵隐寺', type: '佛教建筑', era: 'imperial' },
    { name: '雷峰塔', type: '佛教建筑', era: 'imperial' },
    { name: '岳王庙', type: '纪念建筑', era: 'imperial' },
  ],
  '上海': [
    { name: '外滩', type: '近代建筑群', era: 'modern' },
    { name: '豫园', type: '古典园林', era: 'imperial' },
    { name: '中共一大会址', type: '革命遗址', era: 'modern' },
    { name: '东方明珠', type: '现代地标', era: 'contemporary' },
  ],
  'default': [
    { name: '当地博物馆', type: '文化场所', era: 'contemporary' },
    { name: '古城遗址', type: '历史遗迹', era: 'ancient' },
    { name: '名人故居', type: '纪念建筑', era: 'modern' },
    { name: '传统街区', type: '历史街区', era: 'imperial' },
  ],
}

// 主状态管理
export const useTimeWarpStore = create(
  persist(
    (set, get) => ({
      // 用户地理位置
      userLocation: null,
      locationName: '',
      isLocating: false,
      locationError: null,

      // 当前选择的时代
      selectedEra: 'imperial',

      // 历史故事列表
      stories: [],
      currentStory: null,
      isLoadingStory: false,

      // 时光胶囊（用户保存的历史片段）
      timeCapsules: [],

      // 边缘节点信息
      edgeInfo: null,

      // 设置用户位置
      setUserLocation: (location) => set({
        userLocation: location,
        isLocating: false,
        locationError: null,
      }),

      // 设置位置名称
      setLocationName: (name) => set({ locationName: name }),

      // 设置定位状态
      setLocating: (isLocating) => set({ isLocating }),

      // 设置定位错误
      setLocationError: (error) => set({
        locationError: error,
        isLocating: false,
      }),

      // 选择时代
      selectEra: (eraId) => set({ selectedEra: eraId }),

      // 设置故事列表
      setStories: (stories) => set({ stories }),

      // 设置当前故事
      setCurrentStory: (story) => set({ currentStory: story }),

      // 设置加载状态
      setLoadingStory: (isLoading) => set({ isLoadingStory: isLoading }),

      // 添加时光胶囊
      addTimeCapsule: (capsule) => set((state) => ({
        timeCapsules: [
          {
            id: Date.now().toString(),
            createdAt: Date.now(),
            ...capsule,
          },
          ...state.timeCapsules,
        ].slice(0, 50), // 最多保存50个
      })),

      // 删除时光胶囊
      removeTimeCapsule: (id) => set((state) => ({
        timeCapsules: state.timeCapsules.filter((c) => c.id !== id),
      })),

      // 设置边缘信息
      setEdgeInfo: (info) => set({ edgeInfo: info }),

      // 重置状态
      reset: () => set({
        userLocation: null,
        locationName: '',
        stories: [],
        currentStory: null,
      }),
    }),
    {
      name: 'timewarp-storage',
      partialize: (state) => ({
        timeCapsules: state.timeCapsules,
        selectedEra: state.selectedEra,
      }),
    }
  )
)

// AI 生成状态
export const useAIStore = create((set) => ({
  isGenerating: false,
  progress: '',
  streamContent: '',

  setGenerating: (isGenerating) => set({ isGenerating }),
  setProgress: (progress) => set({ progress }),
  setStreamContent: (content) => set({ streamContent: content }),
  appendStreamContent: (chunk) => set((state) => ({
    streamContent: state.streamContent + chunk,
  })),
  reset: () => set({
    isGenerating: false,
    progress: '',
    streamContent: '',
  }),
}))

// AI 模型配置
export const AI_MODELS = [
  { id: 'qwen-turbo', name: '通义千问 Turbo', provider: 'qwen', description: '快速响应，适合日常使用' },
  { id: 'qwen-plus', name: '通义千问 Plus', provider: 'qwen', description: '更强能力，适合复杂任务' },
  { id: 'qwen-max', name: '通义千问 Max', provider: 'qwen', description: '最强性能，适合专业场景' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek', description: '高性价比，中文优化' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek', description: '代码专家，技术场景' },
]

// 设置状态管理
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // API 配置
      apiProvider: 'qwen', // 'qwen' | 'deepseek'
      apiKey: '',
      selectedModel: 'qwen-turbo',

      // DeepSeek 配置
      deepseekApiKey: '',

      // 通用设置
      streamEnabled: true,
      temperature: 0.85,
      maxTokens: 1500,

      // 设置 API Provider
      setApiProvider: (provider) => set({ apiProvider: provider }),

      // 设置 API Key
      setApiKey: (key) => set({ apiKey: key }),

      // 设置 DeepSeek API Key
      setDeepseekApiKey: (key) => set({ deepseekApiKey: key }),

      // 设置模型
      setSelectedModel: (model) => set({ selectedModel: model }),

      // 设置流式响应
      setStreamEnabled: (enabled) => set({ streamEnabled: enabled }),

      // 设置温度
      setTemperature: (temp) => set({ temperature: temp }),

      // 设置最大 tokens
      setMaxTokens: (tokens) => set({ maxTokens: tokens }),

      // 获取当前有效的 API Key
      getActiveApiKey: () => {
        const state = get()
        if (state.apiProvider === 'deepseek') {
          return state.deepseekApiKey
        }
        return state.apiKey
      },

      // 检查是否已配置
      isConfigured: () => {
        const state = get()
        if (state.apiProvider === 'deepseek') {
          return !!state.deepseekApiKey
        }
        return !!state.apiKey
      },

      // 重置设置
      resetSettings: () => set({
        apiProvider: 'qwen',
        apiKey: '',
        deepseekApiKey: '',
        selectedModel: 'qwen-turbo',
        streamEnabled: true,
        temperature: 0.85,
        maxTokens: 1500,
      }),
    }),
    {
      name: 'timewarp-settings',
    }
  )
)
