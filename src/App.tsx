import './App.less'
import { ConfigProvider, App as AntdApp, ThemeConfig } from 'antd'
import { GithubOutlined } from '@ant-design/icons';
import MuPdf from './components/mupdf';

const AntdTheme: ThemeConfig = {
  hashed: false,
  token: {
    colorTextBase: "#333",
    fontFamily: "Comic Sans MS",
    borderRadius: 12
  },
  components: {
    Modal: {
      titleColor: "#333",
      fontWeightStrong: 500
    },
    Message: {
      contentPadding: '12px',
    }
  }
};

const App = () => {

  return (
    <ConfigProvider theme={AntdTheme}>
      <AntdApp>
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
            <h1 className="title flex flex-col justify-center text-2xl sm:text-3xl md:text-4xl lg:text-6xl select-none hover:scale-105 transform duration-300
            font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FD8F2F] to-[#FD4D07] mb-6">
              <img src="https://mupdfjs.readthedocs.io/en/latest/_static/sidebar-logo-light.svg" className="h-12 md:h-20" />
              MuPdf-Convert-Kit
            </h1>
            <div className="select-none text-sm sm:text-lg md:text-xl pb-10 max-w-[70vw] hover:scale-105 transform duration-300">
              Convert PDF files from A3 to A4 size.
            </div>
            <MuPdf />
            <div className="text-sm text-gray-500 text-center mt-16 select-none hover:scale-105 transform duration-300">
              <span className="mr-2">Made with ❤️ by</span>
              <a href="https://github.com/HyaCiovo" target="_blank" className="hover:underline">
                <GithubOutlined
                  style={{ fontSize: "1.4em" }} />
                <span className="text-[#FD4D07] ml-2">HyaCiovo</span>
              </a>
            </div>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-10 left-10 w-20 h-20 border-4 border-blue-300 rounded-full opacity-50" />
          <div className="absolute bottom-10 right-10 w-16 h-16 bg-[#fd4d0772] rounded-lg animate-bounce opacity-50" />
          <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-yellow-300 rounded-full opacity-50" />
        </div>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
