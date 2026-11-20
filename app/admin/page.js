 "use client";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function Admin(){
 const router=useRouter(); const [user,setUser]=useState(null); const [allowed,setAllowed]=useState(false); const [loading,setLoading]=useState(true); const [movies,setMovies]=useState([]); const [msg,setMsg]=useState("");
 const [title,setTitle]=useState(""); const [description,setDescription]=useState(""); const [year,setYear]=useState(""); const [genre,setGenre]=useState(""); const [premium,setPremium]=useState(false); const [video,setVideo]=useState(null); const [poster,setPoster]=useState(null);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();setUser(user);if(!user){setLoading(false);return;}const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).single();if(profile?.role==="admin"){setAllowed(true);await load();}setLoading(false);})();},[]);
 async function load(){const {data}=await supabase.from("movies").select("id,title,published,created_at").order("created_at",{ascending:false});setMovies(data||[]);}
 async function publish(e){e.preventDefault();if(!video){setMsg("Choose a video file.");return;}setMsg("Uploading files…");const safe=(f)=>`${Date.now()}-${f.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;
 const videoPath=safe(video);const up=await supabase.storage.from("media").upload(videoPath,video,{upsert:false});if(up.error){setMsg(up.error.message);return;}
 let posterUrl=null;if(poster){const pp=safe(poster);const pu=await supabase.storage.from("posters").upload(pp,poster,{upsert:false});if(pu.error){setMsg(pu.error.message);return;}posterUrl=supabase.storage.from("posters").getPublicUrl(pp).data.publicUrl;}
 const videoUrl=supabase.storage.from("media").getPublicUrl(videoPath).data.publicUrl;
 const {error}=await supabase.from("movies").insert({title,description,release_year:year?Number(year):null,genre,is_premium:premium,video_url:videoUrl,poster_url:posterUrl,mime_type:video.type||"video/mp4",published:true,created_by:user.id});
 if(error){setMsg(error.message);return;}setMsg("Published successfully.");setTitle("");setDescription("");setYear("");setGenre("");setVideo(null);setPoster(null);await load();
 }
 async function toggle(id,published){const {error}=await supabase.from("movies").update({published:!published}).eq("id",id);if(error)setMsg(error.message);else load();}
 async function signout(){await supabase.auth.signOut();router.push("/");}
 if(loading)return <div className="container section">Loading admin…</div>;
 if(!user)return <div className="container section"><div className="panel"><h1>Admin sign-in required</h1><a className="btn" href="/login">Sign in</a></div></div>;
 if(!allowed)return <div className="container section"><div className="panel"><h1>Admin access not enabled</h1><p className="muted">Your account is signed in, but it does not have the admin role. An existing project owner must grant it using the Supabase SQL instructions in README.md.</p><button className="btn secondary" onClick={signout}>Sign out</button></div></div>;
 return <div className="container section"><div className="sectionhead"><div><div className="eyebrow">Control room</div><h1>Admin dashboard</h1><p className="muted">Signed in as {user.email}</p></div><button className="btn secondary" onClick={signout}>Sign out</button></div>
 <div className="panel"><h2>Publish a movie or video</h2><form className="form" onSubmit={publish}>
 <div className="field"><label>Title</label><input required value={title} onChange={e=>setTitle(e.target.value)}/></div>
 <div className="field"><label>Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)}/></div>
 <div className="row"><div className="field"><label>Release year</label><input type="number" min="1888" max="2100" value={year} onChange={e=>setYear(e.target.value)}/></div><div className="field"><label>Genre</label><input value={genre} onChange={e=>setGenre(e.target.value)} placeholder="Drama, Documentary…"/></div></div>
 <div className="field"><label>Video file (MP4/WebM recommended)</label><input required type="file" accept="video/mp4,video/webm,video/ogg" onChange={e=>setVideo(e.target.files?.[0]||null)}/></div>
 <div className="field"><label>Poster image (optional)</label><input type="file" accept="image/*" onChange={e=>setPoster(e.target.files?.[0]||null)}/></div>
 <label className="row"><input type="checkbox" checked={premium} onChange={e=>setPremium(e.target.checked)}/> Premium title</label>
 <button className="btn">Upload and publish</button>{msg&&<div className="notice">{msg}</div>}
 </form></div>
 <section className="section"><h2>Library management</h2><div className="adminlist">{movies.map(m=><div className="adminitem" key={m.id}><div><strong>{m.title}</strong><div className="tag">{m.published?"Published":"Unpublished"}</div></div><button className="btn secondary" onClick={()=>toggle(m.id,m.published)}>{m.published?"Unpublish":"Publish"}</button></div>)}</div></section>
 </div>;
}
