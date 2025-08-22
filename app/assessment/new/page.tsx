'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { HAZARD_OPTIONS } from '../../../lib/hazards'

type Contact = { name: string, title?: string, phone?: string, email?: string }
type Area = {
  task_name: string
  category: string
  hazard_type: string
  product_brand: string
  product_part_number: string
  product_description: string
  issue: string
  photoFile?: File | null
}

export default function NewAssessment() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [customer, setCustomer] = useState({ company:'', contacts: [] as Contact[] })
  const [distributor, setDistributor] = useState({ company:'', contacts: [] as Contact[] })
  const [notes, setNotes] = useState('')
  const [areas, setAreas] = useState<Area[]>([{
    task_name:'', category:'', hazard_type:'', product_brand:'', product_part_number:'', product_description:'', issue:''
  }])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addContact = (which:'customer'|'distributor') => {
    const add = { name:'', title:'', phone:'', email:'' }
    if (which==='customer') setCustomer(c=>({...c, contacts:[...c.contacts, add]}))
    else setDistributor(d=>({...d, contacts:[...d.contacts, add]}))
  }
  const updateContact = (which:'customer'|'distributor', idx:number, field: keyof Contact, value:string) => {
    const list = which==='customer' ? [...customer.contacts] : [...distributor.contacts]
    list[idx] = { ...list[idx], [field]: value }
    which==='customer' ? setCustomer({...customer, contacts:list}) : setDistributor({...distributor, contacts:list})
  }
  const addArea = () => setAreas(a => [...a, { task_name:'', category:'', hazard_type:'', product_brand:'', product_part_number:'', product_description:'', issue:'' }])
  const updateArea = (i:number, patch:Partial<Area>) => setAreas(arr => arr.map((a,idx)=> idx===i? {...a, ...patch}: a))

  const pct = Math.round((step-1)/4*100)

  const save = async () => {
    setBusy(true); setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not signed in.'); setBusy(false); return }
    const { data: insp, error: inspErr } = await supabase.from('inspections')
      .insert({ user_id: user.id, customer, distributor, prelim_notes: notes, status: 'Completed' })
      .select().single()
    if (inspErr || !insp) { setError(inspErr?.message || 'Failed to create.'); setBusy(false); return }
    for (let i=0;i<areas.length;i++) {
      const a = areas[i]
      let photo_url: string | null = null
      if (a.photoFile) {
        const ext = a.photoFile.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${insp.id}/${i}.${ext}`
        const { error: upErr } = await supabase.storage.from('inspection-photos').upload(path, a.photoFile, { upsert: true })
        if (!upErr) {
          const { data: pub } = supabase.storage.from('inspection-photos').getPublicUrl(path)
          photo_url = pub?.publicUrl || null
        }
      }
      await supabase.from('assessments').insert({
        inspection_id: insp.id,
        task_name: a.task_name,
        category: a.category,
        hazard_type: a.hazard_type,
        product_brand: a.product_brand,
        product_part_number: a.product_part_number,
        product_description: a.product_description,
        issue: a.issue,
        photo_url
      })
    }
    router.push(`/assessment/${insp.id}`)
  }

  return (
    <div className="card">
      <h2>New Assessment</h2>
      <div className="progress" aria-label="step progress"><span style={{width: pct+'%'}}/></div>
      {error && <div className="card" style={{background:'#ffecec', color:'#900'}}>Error: {error}</div>}

      {step===1 && (
        <div className="card">
          <h3>Step 1 of 5 — Customer Information</h3>
          <label>Company Name</label>
          <input value={customer.company} onChange={e=>setCustomer({...customer, company:e.target.value})}/>
          <div style={{marginTop:8}}>
            <button className="secondary" onClick={()=>addContact('customer')}>+ Add Contact</button>
          </div>
          {customer.contacts.map((c, i)=>(
            <div key={i} className="row" style={{marginTop:8}}>
              <div><label>Contact</label><input value={c.name} onChange={e=>updateContact('customer', i, 'name', e.target.value)}/></div>
              <div><label>Title</label><input value={c.title||''} onChange={e=>updateContact('customer', i, 'title', e.target.value)}/></div>
              <div><label>Phone</label><input value={c.phone||''} onChange={e=>updateContact('customer', i, 'phone', e.target.value)}/></div>
              <div><label>Email</label><input value={c.email||''} onChange={e=>updateContact('customer', i, 'email', e.target.value)}/></div>
            </div>
          ))}
        </div>
      )}

      {step===2 && (
        <div className="card">
          <h3>Step 2 of 5 — Distributor Information</h3>
          <label>Distributor Name</label>
          <input value={distributor.company} onChange={e=>setDistributor({...distributor, company:e.target.value})}/>
          <div style={{marginTop:8}}>
            <button className="secondary" onClick={()=>addContact('distributor')}>+ Add Contact</button>
          </div>
          {distributor.contacts.map((c, i)=>(
            <div key={i} className="row" style={{marginTop:8}}>
              <div><label>Contact</label><input value={c.name} onChange={e=>updateContact('distributor', i, 'name', e.target.value)}/></div>
              <div><label>Title</label><input value={c.title||''} onChange={e=>updateContact('distributor', i, 'title', e.target.value)}/></div>
              <div><label>Phone</label><input value={c.phone||''} onChange={e=>updateContact('distributor', i, 'phone', e.target.value)}/></div>
              <div><label>Email</label><input value={c.email||''} onChange={e=>updateContact('distributor', i, 'email', e.target.value)}/></div>
            </div>
          ))}
        </div>
      )}

      {step===3 && (
        <div className="card">
          <h3>Step 3 of 5 — Preliminary Notes</h3>
          <label>Notes</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={6}/>
        </div>
      )}

      {step===4 && (
        <div className="card">
          <h3>Step 4 of 5 — Assessment Areas</h3>
          {areas.map((a, idx) => (
            <details key={idx} className="assessment" open={idx===0}>
              <summary>Area {idx+1}: {a.task_name || '(untitled)'}</summary>
              <div className="body">
                <label>Task / Area name</label>
                <input value={a.task_name} onChange={e=>updateArea(idx,{task_name:e.target.value})}/>
                <label>Category</label>
                <input value={a.category} onChange={e=>updateArea(idx,{category:e.target.value})}/>
                <label>Hazard type</label>
                <input list="hazards" value={a.hazard_type} onChange={e=>updateArea(idx,{hazard_type:e.target.value})}/>
                <datalist id="hazards">
                  {HAZARD_OPTIONS.map(h => <option key={h} value={h}/>)}
                </datalist>
                <div className="row">
                  <div><label>Brand</label><input value={a.product_brand} onChange={e=>updateArea(idx,{product_brand:e.target.value})}/></div>
                  <div><label>Part Number</label><input value={a.product_part_number} onChange={e=>updateArea(idx,{product_part_number:e.target.value})}/></div>
                </div>
                <label>Description</label>
                <textarea value={a.product_description} onChange={e=>updateArea(idx,{product_description:e.target.value})}/>
                <label>Issue with current product</label>
                <textarea value={a.issue} onChange={e=>updateArea(idx,{issue:e.target.value})}/>
                <label>Photo (optional)</label>
                <input type="file" accept="image/*" onChange={e=>updateArea(idx,{photoFile: e.target.files?.[0] || null})}/>
              </div>
            </details>
          ))}
          <div className="toolbar">
            <button className="secondary" onClick={addArea}>Add New Area</button>
          </div>
        </div>
      )}

      {step===5 && (
        <div className="card">
          <h3>Step 5 of 5 — Review</h3>
          <p><strong>Customer:</strong> {customer.company || '-'}</p>
          <p><strong>Distributor:</strong> {distributor.company || '-'}</p>
          <p><strong>Areas:</strong> {areas.length}</p>
        </div>
      )}

      <div className="toolbar">
        {step>1 && <button className="secondary" onClick={()=>setStep(s=>s-1)}>Back</button>}
        {step<5 && <button onClick={()=>setStep(s=>s+1)}>Next</button>}
        {step===5 && <button onClick={save} disabled={busy}>{busy? 'Saving...' : 'Finish'}</button>}
      </div>
    </div>
  )
}
