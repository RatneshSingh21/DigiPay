import LandingNavbar from './LandingNavbar'
import LandingSection from './LandingSection'

const LandingPageMain = () => {
  return (
    <div>
        <LandingNavbar />
        <LandingSection />
        {/* <div className="flex justify-center items-center min-h-[80vh] bg-cover bg-center">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md z-10 backdrop-blur-sm">
                <h1 className="text-2xl font-bold mb-4">Welcome to Our Landing Page</h1>
                <p className="text-gray-600 mb-4">This is a simple landing page layout.</p>
                <button className="bg-blue-500 text-white py-2 px-4 rounded">Get Started</button>
            </div>
        </div> */}
    </div>
  )
}

export default LandingPageMain