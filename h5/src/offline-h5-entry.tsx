import { createRoot } from 'react-dom/client'
import H5App from './App'

/* H5 打包入口：仅渲染 H5 产品（无 Next.js 运行时、无 Tailwind 依赖） */
createRoot(document.getElementById('root')!).render(<H5App />)
