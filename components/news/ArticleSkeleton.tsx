const ArticleSkeleton = () => {
  return (
    <div className="bg-gray-200 animate-pulse rounded-lg p-4 w-[300px] h-[200px] mb-4">
      <div className="bg-gray-300 h-5 w-2/3 mb-2 rounded" />
      <div className="bg-gray-300 h-4 w-full mb-1 rounded" />
      <div className="bg-gray-300 h-4 w-5/6 rounded" />
    </div>
  );
};

export default ArticleSkeleton;