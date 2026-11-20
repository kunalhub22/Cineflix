import Link from "next/link";
import { supabase } from "../lib/supabase";

export const revalidate = 0;

export default async function Home() {
  const { data: movies } = await supabase.from("movies")
    .select("id,title,description,poster_url,release_year,genre,is_premium")
    .eq("published", true).order("created_at", { ascending: false }).limit(24);

  return <><section className="hero"><div className="container">
    <div className="eyebrow">Your independent cinema</div>
    <h1>Stories worth staying in for.</h1>
    <p className="muted">Discover movies and videos published by the CineFlix team.</p>
    <div className="row"><Link className="btn" href="#library">Explore library</Link><Link className="btn secondary" href="/premium">Explore Premium</Link></div>
  </div></section>
  <div className="container"><div className="adslot">Advertisement placement · Connect an approved ad provider</div>
    <section className="section" id="library"><div className="sectionhead"><h2>Latest releases</h2><span className="muted">{movies?.length || 0} titles</span></div>
      {movies?.length ? <div className="grid">{movies.map(m => <Link className="movie" href={`/watch/${m.id}`} key={m.id}>
        <img className="poster" src={m.poster_url || "https://placehold.co/400x600/171c29/ffffff?text=CineFlix"} alt={`${m.title} poster`}/>
        <div className="movieinfo"><h3>{m.title}</h3><div className="tag">{m.release_year || "Video"} · {m.genre || "Uncategorized"} {m.is_premium ? " · Premium" : ""}</div></div>
      </Link>)}</div> : <div className="panel"><h3>Your library is ready for its first title.</h3><p className="muted">Sign in with an administrator account and publish an authorized video from the admin dashboard.</p><Link className="btn" href="/login">Sign in</Link></div>}
    </section>
  </div></>;
}
