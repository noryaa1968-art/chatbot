import axios from 'axios'

const BaseURL = 'https://refactored-space-giggle-p7jjwrr9gw9rc7r4j-8000.app.github.dev'
const api = axios.create({
  baseURL: BaseURL,
})

export const signupUser = async (userData) => {
  const response = await api.post('/users', userData)
  return response.data
}

export const loginUser = async (email, password) => {
  const response = await api.post(
    '/login',
    null,
    {
      params: {
        email,
        password,
      },
    },
  )

  return response.data
}

export const sendMessage = async (message) => {
  const response = await api.post('/chat', { message })
  return response.data
}

export default api
