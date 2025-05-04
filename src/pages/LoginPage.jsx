import React, { useState } from 'react';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '@/api/api';
import Cookies from 'js-cookie';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/auth-context';

// Define Yup validation schema for the form
const schema = yup.object().shape({
  email: yup.string().email('Email is invalid').required('Email is required'),
  password: yup.string().required('Password is required').min(4, 'Password must be at least 4 characters'),
});

const Login = () => {
  const Navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();

    // Use Yup to validate form data
    try {
      await schema.validate({ email, password }, { abortEarly: false });
      setErrors({});
    } catch (validationErrors) {
      const errorsObj = {};
      validationErrors.inner.forEach(error => {
        errorsObj[error.path] = error.message;
      });
      setErrors(errorsObj);
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      // Place your login API call logic here
      let response = await api.post('/users/login', { email, password });
      console.log('Login response:', response);
      if (response.status === 200) {
        let token = response?.data.token;
        let isAdmin = response.data.isAdmin;
        if (isAdmin) {
          login(token, { expires: 7, secure: true });
          Navigate('/dashboard');
        }
      }
    } catch (error) {
      setLoginError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-6'>
          {loginError && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-gray-700 font-medium'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`h-12 ${
                  errors.email ? 'border-destructive' : ''
                } focus-visible:ring-2 focus-visible:ring-blue-500`}
              />
              {errors.email && (
                <p className='text-sm text-destructive flex items-center gap-1'>
                  <AlertCircle className='h-4 w-4' />
                  {errors.email}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <div className='relative space-y-2'>
                <Label htmlFor='password' className='text-gray-700 font-medium'>
                  Password
                </Label>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter Password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`h-12 ${
                    errors.password ? 'border-destructive pr-10' : 'pr-10'
                  } focus-visible:ring-2 focus-visible:ring-blue-500`}
                />
                <div onClick={() => setShowPassword(!showPassword)} className='absolute right-0 top-1/2 h-full px-3'>
                  {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                </div>
              </div>
              {errors.password && (
                <p className='text-sm text-destructive flex items-center gap-1'>
                  <AlertCircle className='h-4 w-4' />
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <Button
            type='submit'
            className='w-full h-11 bg-blue-500 hover:bg-blue-500 cursor-pointer text-white transition-colors duration-200'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
