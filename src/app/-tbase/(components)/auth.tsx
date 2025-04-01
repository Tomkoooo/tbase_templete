'use client'; // Ez egy kliensoldali komponens, mert useForm-ot használunk

import React from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { databaseClient } from '@/utils/tbase/bundler';
import toast from 'react-hot-toast';
import { redirect } from 'next/navigation';

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  passwordAgain: string;
};

export const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordAgain: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    databaseClient.users.createUser(data.name, data.email, data.password, true, (res: any) => {
      if (res.status === 'error') {
        toast.error(res.message);
      } else {
        toast.success('Successfully registered.');
        redirect('/-tbase/dashboard');
      }
    });
  };

  const password = watch('password'); // Jelszó figyelése az egyezés ellenőrzéséhez

  return (
    <>
      <div className="w-full flex items-end justify-around h-16">
        <Image
          src="/tbase/tbase_logo_white.svg"
          alt="tBase"
          width={128}
          height={128}
        />
        <h2 className="text-2xl font-bold text-center">Register - tBase admin</h2>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-control">
          <label className="label" htmlFor="name">
            <span className="label-text">Name</span>
          </label>
          <input
            type="text"
            id="name"
            placeholder="e.g jhon doe"
            className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
            {...register('name', {
              required: 'Name is required',
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: 'Invalid name',
              },
            })}
          />
          {errors.name && (
            <span className="text-error text-sm">{errors.name.message}</span>
          )}
        </div>
        <div className="form-control">
          <label className="label" htmlFor="email">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            id="email"
            placeholder="e.g super@user.com"
            className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <span className="text-error text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="form-control">
          <label className="label" htmlFor="password">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            id="password"
            placeholder="e.g. root"
            className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          {errors.password && (
            <span className="text-error text-sm">{errors.password.message}</span>
          )}
        </div>
        <div className="form-control">
          <label className="label" htmlFor="passwordAgain">
            <span className="label-text">Password Again</span>
          </label>
          <input
            type="password"
            id="passwordAgain"
            placeholder="e.g. root"
            className={`input input-bordered w-full ${errors.passwordAgain ? 'input-error' : ''}`}
            {...register('passwordAgain', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === password || 'Passwords do not match',
            })}
          />
          {errors.passwordAgain && (
            <span className="text-error text-sm">{errors.passwordAgain.message}</span>
          )}
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Register
        </button>
      </form>
    </>
  );
};

type LoginFormData = {
  email: string;
  password: string;
};

export const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    databaseClient.account.signIn(data.email, data.password, true, (res: any) => {
      if (res.status === 'error') {
        toast.error(res.message);
      } else {
        localStorage.setItem("t_auth_super", res.token); // Token mentése a middleware-nek megfelelően
        toast.success('Successfully logged in.');
        redirect('/-tbase/dashboard');
      }
    });
  };

  return (
    <>
      <div className="w-full flex items-end justify-around h-16">
        <Image
          src="/tbase/tbase_logo_white.svg"
          alt="tBase"
          width={128}
          height={128}
        />
        <h2 className="text-2xl font-bold text-center">Login - tBase admin</h2>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-control">
          <label className="label" htmlFor="email">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            id="email"
            placeholder="e.g super@user.com"
            className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && (
            <span className="text-error text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="form-control">
          <label className="label" htmlFor="password">
            <span className="label-text">Password</span>
          </label>
          <input
            type="password"
            id="password"
            placeholder="e.g. root"
            className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />
          {errors.password && (
            <span className="text-error text-sm">{errors.password.message}</span>
          )}
        </div>
        <button className="btn btn-primary w-full" type="submit">
          Login
        </button>
      </form>
    </>
  );
};