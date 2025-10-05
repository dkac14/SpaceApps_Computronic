import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { apiSummarize } from "@/api/client";

export default function ArticlePage() {
  const [sp] = useSearchParams();
  const url = sp.get("url") || "";
  const title = sp.get("title") || "Article";
  const userType = (sp.get("userType") || "enthusiast").toLowerCase();

  // 👇 user context
  const userName = sp.get("userName") || "";
  const userInterests = (sp.get("userInterests") || "").split(",").map(s => s.trim()).filter(Boolean);
  const userExperience = sp.get("userExperience") || "";

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true); setErr(null);
      try {
        const data = await apiSummarize(url, userType, {
          name: userName,
          interests: userInterests,
          experience: userExperience
        });
        if (mounted) {
          // keep **bold text** + line breaks
          const formatted = (data?.summary || "")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>");
          setSummary(formatted);
        }
      } catch (e: any) {
        if (mounted) setErr(e?.message || "Error generating summary.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (url) run();
    return () => { mounted = false; };
  }, [url, userType, userName, userExperience, userInterests.join("|")]);

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mb-4">
        <Link to="/" className="text-sm underline">← Back</Link>
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="text-sm text-gray-600 mb-4">
        Original source:{" "}
        <a href={url} target="_blank" rel="noreferrer" className="underline">
          {url}
        </a>
      </div>
      {loading && <div>Generating summary…</div>}
      {err && <div className="text-red-600">⚠ {err}</div>}
      {!loading && !err && (
        <article
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: summary || "Could not generate the summary." }}
        />
      )}
    </div>
  );
}
