import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [authStep, setAuthStep] = useState<'landing' | 'chooser' | 'input-email' | 'input-name' | 'loading'>('landing');
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [error, setError] = useState<string | null>(null);

  const handleGoogleClick = () => {
    setAuthStep('chooser');
    setError(null);
  };

  const handleAdminLogin = () => {
    setAuthStep('loading');
    setTimeout(() => {
      onLogin({
        name: 'Admin User',
        email: 'admin@netsentry.io',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NetSentry'
      });
    }, 1500);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (authStep === 'input-email' && formData.email) {
      // SECURITY CHECK: Whitelist Validation
      // Removed restriction to allow any user to register as requested
      /*
      if (formData.email.toLowerCase() !== 'admin@netsentry.io') {
        setError('Access Denied: This system is restricted to administrators only.');
        return;
      }
      */
      setAuthStep('input-name');
    } else if (authStep === 'input-name' && formData.name) {
      setAuthStep('loading');
      setTimeout(() => {
        onLogin({
          name: formData.name,
          email: formData.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
        });
      }, 1500);
    }
  };

  const renderContent = () => {
    switch (authStep) {
      case 'landing':
        return (
          <>
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">NetSentry</h1>
              <p className="text-slate-400">Secure Network Asset Tracking</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleGoogleClick}
                className="w-full bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all transform hover:scale-[1.02] active:scale-[0.98] group"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.7666 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                  <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
                  <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/>
                  <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
              
              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-700"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-600 text-xs uppercase">Enterprise Access Only</span>
                  <div className="flex-grow border-t border-slate-700"></div>
              </div>
              
              <div className="text-center text-xs text-slate-500">
                By logging in, you agree to the Asset Monitoring Protocols and Data Privacy Policy.
              </div>
            </div>
          </>
        );

      case 'chooser':
        return (
          <div className="animate-in fade-in zoom-in duration-300">
             <div className="text-center mb-6">
                <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.7666 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                    <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
                    <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/>
                    <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
                </svg>
                <h2 className="text-xl font-medium text-white">Choose an account</h2>
                <p className="text-slate-400 text-sm">to continue to NetSentry</p>
             </div>
             
             <div className="space-y-2">
                <button 
                  onClick={handleAdminLogin}
                  className="w-full flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors border-b border-slate-800/50 text-left"
                >
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=NetSentry" alt="Admin" className="w-10 h-10 rounded-full bg-slate-700 mr-4" />
                    <div>
                        <div className="font-medium text-white text-sm">Admin User</div>
                        <div className="text-xs text-slate-400">admin@netsentry.io</div>
                    </div>
                </button>
                <button 
                   onClick={() => setAuthStep('input-email')}
                   className="w-full flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-4 border border-slate-700">
                         <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                         </svg>
                    </div>
                    <div className="font-medium text-slate-200 text-sm">Use another account</div>
                </button>
             </div>
          </div>
        );

      case 'input-email':
      case 'input-name':
        return (
          <form onSubmit={handleNextStep} className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="text-center mb-8">
                 <svg className="w-10 h-10 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.7666 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                    <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
                    <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/>
                    <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
                </svg>
                <h2 className="text-xl font-medium text-white">{authStep === 'input-email' ? 'Sign in' : 'Welcome'}</h2>
                <p className="text-slate-400 text-sm">
                   {authStep === 'input-email' ? 'to continue to NetSentry' : 'Enter your name to finish setup'}
                </p>
             </div>

             {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm p-3 rounded-lg mb-6 flex items-start animate-in fade-in slide-in-from-top-1">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
             )}

             <div className="space-y-4">
               {authStep === 'input-email' ? (
                   <div>
                        <input
                            type="email"
                            required
                            placeholder="Email or phone"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className={`w-full bg-slate-900 border ${error ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-700 focus:border-indigo-500'} rounded px-4 py-3 text-white focus:outline-none transition-colors`}
                        />
                   </div>
               ) : (
                   <div>
                        <div className="flex items-center justify-center mb-4">
                            <span className="text-sm border border-slate-700 rounded-full px-3 py-1 text-slate-300">{formData.email}</span>
                        </div>
                        <input
                            type="text"
                            required
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                        />
                   </div>
               )}

               <div className="flex justify-end pt-2">
                   <button
                     type="submit"
                     className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                   >
                     Next
                   </button>
               </div>
             </div>
          </form>
        );

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500">
             <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-400 animate-pulse">Authenticating...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 blur-[80px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 min-h-[400px] flex flex-col justify-center">
          {renderContent()}
        </div>
        
        <div className="text-center mt-8 text-slate-600 text-xs">
          &copy; 2025 NetSentry Security Systems. v2.1.0
          <p className="mt-2 text-slate-700 opacity-70">Design by z@ShAm Malaysia Anonymous</p>
        </div>
      </div>
    </div>
  );
};

export default Login;