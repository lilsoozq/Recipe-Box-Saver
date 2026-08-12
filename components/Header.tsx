"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
export default function Header(){
 const path=usePathname(); const router=useRouter();
 async function signOut(){await createClient().auth.signOut();router.replace("/login");router.refresh();}
 return <header className="topbar"><Link href="/" className="brand"><span className="brandMark">R</span><span>Recipe Box</span></Link><nav><Link className={path==="/"?"active":""} href="/">My Recipes</Link><Link className="button small" href="/add">+ Add Recipe</Link><button className="logout" onClick={signOut}>Sign out</button></nav></header>;
}
