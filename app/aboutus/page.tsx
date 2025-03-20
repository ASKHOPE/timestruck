 
export default function HomePage() {
    return (
      <div className=" p-4 max-w-md mx-auto rounded-lg shadow-md ">
          {/* <main className="flex-grow p-6 text-center max-w-2xl mx-auto"> */}
          <h2 className="text-2xl font-bold  mb-4">🧑‍💻 About Us</h2>
          <p className=" mb-4">
            Welcome to <strong>TimeStruck</strong> – where every second counts! Our mission is to help individuals stay focused, track their progress, and achieve their goals efficiently.
          </p>
          <p className=" mb-4">
            Whether you are working on a personal project, managing daily tasks, or striving for long-term success, TimeStruck provides the tools and structure needed to maintain momentum.
          </p>
          <h3 className="text-xl font-semibold  mt-6 mb-2">Why TimeStruck?</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>✅ Productivity-Driven</strong> – Keep track of your priorities with a structured countdown clearing out confusion.</li>
            <li><strong>✅ User-Centric</strong> – Designed for efficiency and ease of use.</li>
            <li><strong>✅ Results-Oriented</strong> – Focus on what matters most, without distractions.</li>
          </ul>
          <p className=" mt-6">Join us on the journey of making time work for you! 🚀</p>
        {/* </main> */}
  
      </div>
    )
  }