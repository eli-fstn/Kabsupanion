function Card({ children }) {
  return (
    <div className="h-full bg-white dark:bg-[#1a1a1a] border-gray-100 dark:border-[#2a2a2a] border-2 shadow-md rounded-xl p-4 sm:p-5 hover:shadow-xl hover:-translate-y-1 transition duration-200 w-full sm:w-fit">
      {children}
    </div>
  )
}
export default Card;