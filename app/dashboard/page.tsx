'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

type Row = { id: string, customer: any, distributor: any, status: string, created_at: string }

export default function Dashboard() {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return }
      const { data, error } = await supabase.from('inspections')
        .select('id, customer, distributor, status, created_at')
        .order('created_at', { ascending: false })
      if (!error) setRows(data || [])
    }
    load()
  }, [])

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = '/login' }

  return (
    <div>
      <div className="card">
        <h2>Recent Assessments</h2>
        <div className="toolbar">
          <Link href="/assessment/new"><button>New Assessment</button></Link>
          <button className="secondary" onClick={signOut}>Sign out</button>
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>Customer</th><th>Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{r.customer?.company || '-'}</td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td><span className="status">{r.status || 'Completed'}</span></td>
                <td><Link href={`/assessment/${r.id}`}>View</Link></td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={4}>No assessments yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
