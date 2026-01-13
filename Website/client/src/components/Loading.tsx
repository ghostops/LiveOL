export default function Loading() {
  return (
    <div className="flex items-center justify-center pt-48 pb-96">
      <div className="text-text-muted font-mono">
        Loading
        <span className="inline-block w-8">
          <span className="animate-ellipsis"></span>
        </span>
      </div>
    </div>
  );
} 