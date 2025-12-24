import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import StoryPage from './pages/StoryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/:location" element={<ExplorePage />} />
        <Route path="/story/:storyId" element={<StoryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
