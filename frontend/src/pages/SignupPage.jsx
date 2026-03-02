import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore.js';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { signup, isSigningUp } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      toast.error('Email must be a valid Gmail address');
      return;
    }

    if (email.length <= 6) {
      toast.error('Email must be longer than 6 characters');
      return;
    }

    if (password.length <= 6) {
      toast.error('Password must be longer than 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    await signup({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="bg-base-100 shadow-xl rounded-2xl p-10 w-full max-w-md">
        <h2 className="text-4xl font-extrabold text-center mb-8 tracking-wide">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {['username', 'email', 'password', 'confirmPassword'].map((field) => (
            <div key={field} className="relative">
              <input
                type={
                  field === 'password' || field === 'confirmPassword'
                    ? 'password'
                    : field === 'email'
                      ? 'email'
                      : 'text'
                }
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                className="peer w-full px-4 pt-6 pb-2 bg-base-200 placeholder-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                placeholder={
                  field === 'confirmPassword'
                    ? 'Confirm Password'
                    : field.charAt(0).toUpperCase() + field.slice(1)
                }
              />
              <label
                htmlFor={field}
                className="absolute left-4 top-2 text-sm text-base-content/70 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-base-content/50 peer-focus:top-2 peer-focus:text-sm peer-focus:text-base-content/70"
              >
                {field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
            </div>
          ))}
          <button
            type="submit"
            disabled={isSigningUp}
            className="btn btn-primary w-full"
          >
            {isSigningUp ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline hover:text-primary-focus transition">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
