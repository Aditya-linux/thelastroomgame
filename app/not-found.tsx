import Link from "next/link";

export default function NotFound() {
  return (
    <main className="landing" style={{ justifyContent: "center" }}>
      <div className="geo-bg">
        <div className="geo-circle" style={{ top: "20%", left: "10%" }} />
        <div className="geo-square" style={{ top: "60%", right: "15%" }} />
      </div>

      <div className="landing-inner">
        <div className="facility-tag">ERROR 404</div>
        <h1 className="main-title" style={{ fontSize: "clamp(60px, 12vw, 120px)", color: "var(--pink)" }}>
          ROOM NOT FOUND
        </h1>
        <p className="title-sub" style={{ marginTop: "12px", marginBottom: "40px" }}>
          You have wandered out of bounds. The operators are watching.
        </p>
        
        <Link href="/" className="enter-btn">
          RETURN TO LOBBY
        </Link>
      </div>
    </main>
  );
}
