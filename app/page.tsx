import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <div className="card">
        <h1>Welcome back, User!</h1>
        <p>Manage your customer assessments and generate professional reports.</p>
      </div>
      <div className="row">
        <div className="card">
          <h3>New Assessment</h3>
          <p>Create a new customer assessment</p>
          <Link href="/assessment/new"><button>Start</button></Link>
        </div>
        <div className="card">
          <h3>Assessment History</h3>
          <p>View and manage past assessments</p>
          <Link href="/dashboard"><button className="secondary">Open</button></Link>
        </div>
      </div>
    </div>
  )
}
