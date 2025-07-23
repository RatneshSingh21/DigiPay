export default function SummaryCard({
  stepTitle,
  summaryLines,
  onEdit,
  onPreview,
}) {
  return (
    <div className="relative bg-white/20 backdrop-blur-md border border-orange-200 rounded-xl p-6 mb-6 shadow-lg w-full max-w-2xl ms-24">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-yellow-300 via-orange-300 to-orange-500 opacity-10 rounded-xl pointer-events-none" />

      <div className="relative z-10 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-orange-800 mb-3">
            {stepTitle}
          </h3>
          <ul className="list-disc list-inside text-gray-800 font-medium space-y-1">
            {summaryLines.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center items-end">
          <button
            onClick={onEdit}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
          >
            Edit
          </button>
          <button
            onClick={onPreview}
            className="bg-orange-100 text-orange-800 px-4 py-2 rounded hover:bg-orange-200 transition"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}
