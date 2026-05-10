import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

function Login({API_BASE_URL}) {
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const navigate = useNavigate()
 
   const validate = () => {
     const e = {}
     if (!form.email.trim()) e.email = 'Email is required'
     else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
     if (!form.password) e.password = 'Password is required'
     return e
   }
 
   const handleChange = (e) => {
     setForm({ ...form, [e.target.name]: e.target.value })
     if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null })
   }
 
    const handleSubmit = async () => {
        const e = validate()
        if (Object.keys(e).length > 0) { setErrors(e); return }
     
        //Login check logic here
        const response = await fetch(`${API_BASE_URL}/login`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({email: form.email, password: form.password}) })
        
        //check if login successful and output messages
        if (response.ok) {navigate('/resume') } //change to the dash page actual name. Can check employer or not and immediately redirect
        else if (response.status === 401) alert("Invalid email or password")
        else alert("Server error. Please try again later.")
    }
 
   const EyeIcon = ({ visible }) => (
     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
       {visible
         ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
         : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>
       }
     </svg>
   )
 
   return (
     <div className="page">
       <div className="form-body">
         <div className="form-card">
           <h2 className="form-title">Login</h2>
 
           <div className="form-fields">
             <div className="field-group">
               <label className="field-label">Email <span className="required">*</span></label>
               <input
                 className={`field-input ${errors.email ? 'error' : ''}`}
                 name="email"
                 type="email"
                 placeholder="Enter email address"
                 value={form.email}
                 onChange={handleChange}
               />
               {errors.email && <span className="field-error">{errors.email}</span>}
             </div>
 
             <div className="field-group">
               <label className="field-label">Password <span className="required">*</span></label>
               <input
                 className={`field-input ${errors.password ? 'error' : ''}`}
                 name="password"
                 type="password"
                 placeholder="Enter password"
                 value={form.password}
                 onChange={handleChange}
               />
               {errors.password && <span className="field-error">{errors.password}</span>}
             </div>
 
             <button className="btn-primary" onClick={handleSubmit}>Login</button>
 
             <p className="form-footer">
               Don't have an account? <a href="/" className="form-link">Register</a>
             </p>
           </div>
         </div>
       </div>
     </div>
   )
}export default Login