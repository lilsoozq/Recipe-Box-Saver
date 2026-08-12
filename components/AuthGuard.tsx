"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthGuard({children}:{children:React.ReactNode}){
  const path=usePathname(); const router=useRouter(); const [ready,setReady]=useState(path==="/login");
  useEffect(()=>{
    if(path==="/login"){setReady(true);return;}
    const supabase=createClient();
    supabase.auth.getUser().then(({data})=>{ if(!data.user) router.replace("/login"); else setReady(true); });
  },[path,router]);
  if(!ready) return <div className="loading">Opening your Recipe Box…</div>;
  return <>{children}</>;
}
