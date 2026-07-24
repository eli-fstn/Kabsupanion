function Card({ children }) {
  return (
    <div className="h-full bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-[#444444] border-2 rounded-xl p-4 sm:p-5 hover:shadow-md dark:hover:shadow-black/40 hover:-translate-y-1 transition duration-200 hover:border-gray-200 dark:hover:border-[#7a7a7a] w-full sm:w-fit">
      {children}
    </div>
  )
}
export default Card;