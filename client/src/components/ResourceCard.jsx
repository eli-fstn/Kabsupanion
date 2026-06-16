function ResourceCard({ title, subject, uploadedBy, fileUrl }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition flex flex-col">
      
      <div className="h-40 bg-gray-100 border-b border-gray-200 flex items-center justify-center">
        <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrolling=0`} className="w-full h-full pointer-events-none"title={title}/>
      </div>

      <div className="p-4 flex flex-col gap-1">
        <p className="text-xs text-gray-500">{subject}</p>
        <p className="font-semibold text-md leading-tight">{title}</p>
        <p className="text-xs text-gray-400">{uploadedBy}</p>
      </div>

    </div>
  );
}

export default ResourceCard;