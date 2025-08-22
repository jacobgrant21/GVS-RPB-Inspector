'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/dashboard')
    })
  }, [router])

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/dashboard')
  }

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else alert('Check your email for confirmation, then sign in.')
  }

  return (
    <div className="card" style={{maxWidth:520}}>
      <h2>Rep Login</h2>
      <form onSubmit={signIn}>
        {error && <div className="card" style={{background:'#ffecec', color:'#900'}}>Error: {error}</div>}
        <label>Email</label>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <div className="toolbar" style={{marginTop:10}}>
          <button type="submit">Sign in</button>
          <button type="button" className="secondary" onClick={signUp}>Sign up</button>
        </div>
      </form>
    </div>
  )
}
