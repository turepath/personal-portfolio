import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import axios from 'axios'
import '@fortawesome/fontawesome-free/css/all.min.css'

// 配置axios基础路径
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// 响应拦截器 - 处理认证失效
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

// 添加axios请求拦截器
// 请求拦截器 - 自动携带令牌
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const app = createApp(App)

app.mount('#app')
