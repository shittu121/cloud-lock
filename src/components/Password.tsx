"use client"
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Shield, Check, X, AlertCircle, Key, Cloud } from 'lucide-react';
import { createClient } from '@/lib/client';
import bcrypt from 'bcryptjs';
import Link from 'next/link';

const PasswordSetupUI = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(1); // 1: setup, 2: confirm, 3: success
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength += 25;
    if (pwd.match(/\d/)) strength += 25;
    if (pwd.match(/[^a-zA-Z\d]/)) strength += 25;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-orange-500';
    if (strength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 25) return 'Weak';
    if (strength < 50) return 'Fair';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  useEffect(() => {
    if (password.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [password]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  const handleSubmit = async (e: any) => {
    if (step === 1 && password && passwordStrength >= 75) {
      setStep(2);
    } else if (step === 2 && password === confirmPassword) {
      setIsSubmitting(true);
      try {
        const supabase = createClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user?.id) {
          throw new Error('User not authenticated');
        }
        const userId = userData.user.id;
        // Hash password with bcryptjs before saving
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        // Upsert password hash to Supabase
        const { error: upsertError } = await supabase
          .from('password')
          .upsert([{ user_id: userId, password: hashedPassword }], { onConflict: 'user_id' });
        if (upsertError) {
          throw new Error(upsertError.message);
        }
        setIsSubmitting(false);
        setStep(3);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setIsSubmitting(false);
        alert(err.message || 'Failed to save password');
      }
    }
  };

  const resetForm = () => {
    setPassword('');
    setConfirmPassword('');
    setStep(1);
    setPasswordStrength(0);
  };

  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Upper & lowercase letters', met: password.match(/[a-z]/) && password.match(/[A-Z]/) },
    { text: 'At least one number', met: password.match(/\d/) },
    { text: 'At least one special character', met: password.match(/[^a-zA-Z\d]/) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Cloud className="h-12 w-12 text-blue-600 animate-pulse" />
              <Lock className="h-6 w-6 text-blue-800 absolute -bottom-1 -right-1 animate-bounce" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Your Files</h1>
          <p className="text-gray-600">
            {step === 1 && "Create a master password to encrypt your uploaded files"}
            {step === 2 && "Confirm your master password"}
            {step === 3 && "Your files are now secured!"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <div className={`w-16 h-1 transition-all duration-300 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <div className={`w-16 h-1 transition-all duration-300 ${
              step >= 3 ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {step >= 3 ? <Check className="h-4 w-4" /> : '3'}
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
          {step === 1 && (
            <div className="space-y-6">
              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className={`h-5 w-5 transition-colors duration-300 ${
                      isTyping ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Enter your master password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="space-y-3 animate-slide-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password Strength</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength >= 75 ? 'text-green-600' : 
                      passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {password && (
                <div className="space-y-2 animate-slide-in">
                  <p className="text-sm text-gray-600 mb-3">Password Requirements:</p>
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                        req.met ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {req.met ? <Check className="h-3 w-3 text-white" /> : <X className="h-3 w-3 text-gray-500" />}
                      </div>
                      <span className={`text-sm transition-colors duration-300 ${
                        req.met ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!password || passwordStrength < 75}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Master Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                    placeholder="Confirm your master password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className={`flex items-center space-x-2 animate-slide-in ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  {password === confirmPassword ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {password === confirmPassword ? 'Passwords match!' : 'Passwords do not match'}
                  </span>
                </div>
              )}

              {/* Warning Message */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 animate-slide-in">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Important!</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Make sure to remember this password. It will be required to access all your uploaded files.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!confirmPassword || password !== confirmPassword || isSubmitting}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Securing...</span>
                    </>
                  ) : (
                    'Secure My Files'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Set!</h3>
                <p className="text-gray-600">
                  Your master password has been configured. Your files are now protected with encryption.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  <strong>Remember:</strong> You&apos;ll need this password every time you want to access your uploaded files.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  Change Password
                </button>
                <Link href='/' className="flex-1">
                  <button
                    type="button"
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
                  >
                    Continue
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>🔒 This password is used to encrypt your files locally before upload</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PasswordSetupUI;