 "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(e){e.preventDefault();setBusy(true);setMessage("");const {error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error){setMessage(error.message);return;}router.push("/admin");}
  async function signup(){setBusy(true);setMessage("");const {error}=await supabase.auth.signUp({email,password});setBusy(false);setMessage(error?error.message:"Account created. Check your email if confirmation is enabled. An administrator must grant your profile admin access.");}
  return <div className="container section"><div className="panel" style={{maxWidth:480,margin:"30px auto"}}><h1>Welcome back</h1><p className="muted">Sign in to manage your CineFlix account.</p><form className="form" onSubmit={submit}><div className="field"><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/></div><button className="btn" disabled={busy}>Sign in</button><button type="button" className="btn secondary" disabled={busy} onClick={signup}>Create account</button>{message&&<div className="notice">{message}</div>}</form></div></div>;
}
