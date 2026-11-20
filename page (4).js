import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default async function Watch({ params }) {
  const { data: movie } = await supabase.from("movies").select("*").eq("id",params.id).eq("published",true).single();
  if(!movie) return <div className="container section"><h1>Title not found</h1><Link href="/">Back to CineFlix</Link></div>;
  return <div className="container section">
    <div className="row" style={{justifyContent:"space-between"}}><div><div className="eyebrow">{movie.genre || "CineFlix original"}</div><h1>{movie.title}</h1><p className="muted">{movie.release_year || ""} {movie.description ? "· "+movie.description : ""}</p></div><Link href="/" className="btn secondary">Back</Link></div>
    {movie.is_premium ? <PremiumGate /> : <video className="video" controls playsInline preload="metadata" poster={movie.poster_url || undefined}><source src={movie.video_url} type={movie.mime_type || "video/mp4"}/>Your browser does not support HTML video.</video>}
    <div className="adslot">Advertisement placement · Ads should not obstruct playback controls</div>
    <p className="muted">Please respect the creator's terms. Downloads, if enabled, must be authorized by the content owner.</p>
  </div>;
}

function PremiumGate(){return <div className="panel"><h2>Premium title</h2><p className="muted">This title is reserved for CineFlix Premium members. Sign in and activate your membership to watch.</p><Link className="btn" href="/premium">View Premium</Link></div>}
