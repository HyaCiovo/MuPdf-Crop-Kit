import './App.css'
import MuPdf from './components/mupdf'
import Logo from './assets/logo.png'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const App = () => {

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-blue-100 to-white flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-50">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative floating elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
            style={{
              backgroundColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`,
              width: `${Math.random() * 10 + 5}rem`,
              height: `${Math.random() * 10 + 5}rem`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      <div className="z-10 text-center flex flex-col items-center w-full">
        <h1 className="title flex flex-col justify-center items-center text-2xl sm:text-3xl md:text-4xl lg:text-6xl select-none hover:scale-105 transform duration-300
            font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FD8F2F] to-[#FD4D07] mb-6">
          <img alt="logo" src={Logo} className="size-32 md:size-40"  />
          MuPdf-Crop-Kit
        </h1>
        <div className="select-none text-sm sm:text-lg md:text-xl pb-10 max-w-[70vw] hover:scale-105 transform duration-300">
          Crop PDF files from A3 to A4 size.
        </div>
        <MuPdf />
        <div className="text-sm text-gray-500 text-center mt-16 select-none hover:scale-105 transform duration-300">
          <span className="mr-2">Made with ❤️ by</span>
          <a href="https://github.com/HyaCiovo" target="_blank" className="hover:underline">
            <svg className='inline-block text-xl mb-1' viewBox="64 64 896 896" focusable="false" data-icon="github" width="1em" height="1em" fill="currentColor" aria-hidden="true">
              <path d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9a127.5 127.5 0 0138.1 91v112.5c.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"></path></svg>
            <span className="text-[#FD4D07] ml-2">HyaCiovo</span>
          </a>
        </div>
      </div>
      {/* Decorative shapes */}
      <div className="absolute top-10 left-10 w-20 h-20 border-4 border-blue-300 rounded-full opacity-50" />
      <div className="absolute bottom-10 right-10 w-16 h-16 bg-[#fd4d0772] rounded-lg animate-bounce opacity-50" />
      <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-yellow-300 rounded-full opacity-50" />
      <SpeedInsights />
      <Analytics />
    </div>
  )
}

export default App
