import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 历史时代定义
export const ERAS = [
  { id: 'ancient', name: '远古时代', range: '公元前3000年-公元前221年', icon: '🏛️' },
  { id: 'imperial', name: '帝国时代', range: '公元前221年-公元1912年', icon: '👑' },
  { id: 'modern', name: '近代', range: '1912年-1949年', icon: '🏭' },
  { id: 'contemporary', name: '当代', range: '1949年-2000年', icon: '🌆' },
  { id: 'recent', name: '近年', range: '2000年-至今', icon: '🌐' },
]

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
