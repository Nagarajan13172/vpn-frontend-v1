
import VpnLoginForm from './components/VpnLoginForm';
import BgImg from "../../public/bgimg.png"

const Login = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Half - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-dark opacity-60 z-10"></div>
        <img 
          src={BgImg}
          alt="VPN Security" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              Your Privacy
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Our Priority
              </span>
            </h1>
            <p className="text-lg text-gray-200 mb-8 leading-relaxed">
              Connect to our global network of secure servers and browse the internet with complete privacy and freedom.
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Military-grade encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Zero-log policy</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>Global server network</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-subtle">
        <div className="w-full max-w-md">
          <VpnLoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;