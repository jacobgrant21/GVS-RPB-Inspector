'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import { jsPDF } from 'jspdf'

type Assessment = {
  id: string
  task_name: string
  category: string
  hazard_type: string
  product_brand: string
  product_part_number: string
  product_description: string
  issue: string
  photo_url: string | null
}

export default function AssessmentView() {
  const params = useParams<{id:string}>()
  const [loading, setLoading] = useState(true)
  const [inspection, setInspection] = useState<any>(null)
  const [areas, setAreas] = useState<Assessment[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: insp } = await supabase.from('inspections').select('*').eq('id', params.id).single()
      const { data: ass } = await supabase.from('assessments').select('*').eq('inspection_id', params.id)
      setInspection(insp); setAreas(ass || []); setLoading(false)
    }
    load()
  }, [params.id])

  const hazardCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const a of areas) {
      const key = a.hazard_type || 'Unspecified'
      map[key] = (map[key] || 0) + 1
    }
    return map
  }, [areas])

  const makePdf = async () => {
    const doc = new jsPDF({ unit:'pt', format:'a4' })
    const pageW = doc.internal.pageSize.getWidth()
    const margin = 36
    let y = margin
    // Header
    doc.setFillColor('#003E7E')
    doc.rect(0,0,pageW,60,'F')
    doc.setTextColor('#ffffff')
    doc.setFontSize(18)
    doc.text('GVS / RPB Inspection Report', margin, 40)
    doc.setTextColor('#000000')
    doc.setFontSize(12)
    y = 80
    doc.text(`Customer: ${inspection.customer?.company}`, margin, y); y+=16
    doc.text(`Distributor: ${inspection.distributor?.company}`, margin, y); y+=16
    doc.text(`Areas: ${areas.length}`, margin, y); y+=24
    // Hazard summary
    doc.setFontSize(14); doc.setTextColor('#00A0DF'); doc.text('Hazard Summary', margin, y); y+=18
    doc.setFontSize(12); doc.setTextColor('#000000')
    Object.entries(hazardCounts).forEach(([k,v])=>{ doc.text(`• ${k}: ${v}`, margin, y); y+=14 })
    y+=12
    // Areas
    for (let i=0;i<areas.length;i++) {
      const a = areas[i]
      if (y > 740) { doc.addPage(); y = margin }
      doc.setFontSize(14); doc.setTextColor('#00A0DF')
      doc.text(`Area ${i+1}: ${a.task_name}`, margin, y); y+=18
      doc.setTextColor('#000000'); doc.setFontSize(12)
      const wrap = (t:string, w:number)=>doc.splitTextToSize(t || '-', w)
      doc.text(`Category: ${a.category}`, margin, y); y+=14
      doc.text(`Hazard: ${a.hazard_type}`, margin, y); y+=14
      doc.text(`Brand: ${a.product_brand}  Part #: ${a.product_part_number}`, margin, y); y+=14
      const desc = wrap(`Description: ${a.product_description || '-'}`, 480)
      doc.text(desc, margin, y); y+= (desc.length*14)
      const iss = wrap(`Issue: ${a.issue || '-'}`, 480)
      doc.text(iss, margin, y); y+= (iss.length*14)
      if (a.photo_url) {
        try {
          const blob = await fetch(a.photo_url).then(r=>r.blob())
          const reader = new FileReader()
          const dataUrl: string = await new Promise((res, rej) => {
            reader.onload = () => res(reader.result as string)
            reader.onerror = rej
            reader.readAsDataURL(blob)
          })
          doc.addImage(dataUrl, 'JPEG', pageW-220, y-80, 180, 120)
        } catch {}
      }
      y+=24
    }
    doc.save(`GVS_Inspection_${(inspection.customer?.company||'').replace(/\W+/g,'_')}.pdf`)
  }

  if (loading) return <div className="card">Loading...</div>
  if (!inspection) return <div className="card">Not found.</div>

  return (
    <div className="card">
      <h2>Assessment Summary</h2>
      <div className="row">
        <div>
          <strong>{inspection.customer?.company}</strong>
          <div className="badge">{new Date(inspection.created_at).toLocaleString()}</div>
        </div>
        <div>
          <strong>Distributor:</strong> {inspection.distributor?.company}
        </div>
      </div>

      <div className="card">
        <h3>Hazard Summary</h3>
        {Object.keys(hazardCounts).length===0 && <div>-</div>}
        {Object.entries(hazardCounts).map(([k,v])=>(
          <div key={k}>{k}: <strong>{v}</strong></div>
        ))}
      </div>

      <div style={{marginTop:12}}>
        {areas.map((a,i)=>(
          <details key={a.id} className="assessment" open={i===0}>
            <summary>Area {i+1}: {a.task_name}</summary>
            <div className="body">
              <div><strong>Category:</strong> {a.category}</div>
              <div><strong>Hazard:</strong> {a.hazard_type}</div>
              <div><strong>Brand:</strong> {a.product_brand} <strong>Part #:</strong> {a.product_part_number}</div>
              <div><strong>Description:</strong> {a.product_description}</div>
              <div><strong>Issue:</strong> {a.issue}</div>
              {a.photo_url && <img src={a.photo_url} alt="product" style={{maxWidth:'100%', borderRadius:8, marginTop:8}}/>}
            </div>
          </details>
        ))}
      </div>
      <div className="toolbar" style={{marginTop:12}}>
        <button onClick={makePdf}>Download Branded PDF</button>
      </div>
    </div>
  )
}
