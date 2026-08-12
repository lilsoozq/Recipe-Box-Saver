"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage(){
 const router=useRouter(); const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
 const [mode,setMode]=useState<"signin"|"signup">("signin"); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
 async function submit(e:FormEvent){e.preventDefault();setLoading(true);setMessage("");const s=createClient();
   if(mode==="signup"){
     const {error}=await s.auth.signUp({email,password});
     if(error)setMessage(error.message); else setMessage("Account created. Check your email to confirm your address, then sign in.");
   }else{
     const {error}=await s.auth.signInWithPassword({email,password});
     if(error)setMessage(error.message); else {router.replace("/");router.refresh();}
   }
   setLoading(false);
 }
 return <main className="authPage"><section className="authCard"><div className="brand authBrand"><span className="brandMark">R</span><span>Recipe Box</span></div><div className="eyebrow">YOUR CLOUD COOKBOOK</div><h1>{mode==="signin"?"Welcome back.":"Create your Recipe Box."}</h1><p>Your recipes will be stored securely in your Supabase project and available wherever you sign in.</p>
 <form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={loading}>{loading?"Working…":mode==="signin"?"Sign In":"Create Account"}</button></form>{message&&<div className="authMessage">{message}</div>}
 <button className="switchAuth" onClick={()=>{setMode(mode==="signin"?"signup":"signin");setMessage("")}}>{mode==="signin"?"New here? Create an account":"Already have an account? Sign in"}</button></section></main>
}
