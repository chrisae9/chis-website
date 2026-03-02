interface YouTubeEmbedProps {
  videoId: string
}

export function YouTubeEmbed({ videoId }: YouTubeEmbedProps) {
  return (
    <div className="youtube-embed-container my-4 relative pb-[56.25%] h-0 overflow-hidden max-w-full border border-[var(--border)]">
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        title={`YouTube video player (ID: ${videoId})`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="absolute top-0 left-0 w-full h-full"
        aria-label="YouTube video embed"
      ></iframe>
    </div>
  )
}
