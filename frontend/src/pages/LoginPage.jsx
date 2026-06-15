import { useState } from 'react'
import { loginUser } from '../services/api'

function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    try {
      const data = await loginUser(email, password)

      localStorage.setItem('token', data.access_token)

      alert('Login Successful')
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (error) {
      console.log(error)
      alert('Login Failed')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '0.75rem' }}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}

export default LoginPage
