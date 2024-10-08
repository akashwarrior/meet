'use client';

import React, { useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signUp } from '../lib/actions/signUp';
import Link from 'next/link';

const SignUp = () => {
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [checkingPassword, setCheckingPassword] = useState<boolean>(false);
    const [requiredError, setRequiredError] = useState({
        nameReq: false,
        emailReq: false,
        passReq: false
    });

    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleSubmit = async (e?: React.FormEvent<HTMLButtonElement>) => {
        e?.preventDefault();

        if (!emailRef.current?.value || !passwordRef.current?.value || !nameRef.current?.value) {
            setRequiredError({
                nameReq: !nameRef.current?.value,
                emailReq: !emailRef.current?.value,
                passReq: !passwordRef.current?.value,
            });
            return;
        }
        setCheckingPassword(true);
        try {
            await signUp(emailRef.current?.value, passwordRef.current?.value, nameRef.current?.value);
            const res = await signIn('credentials', {
                username: emailRef.current?.value,
                password: passwordRef.current?.value,
                redirect: false,
            });

            if (!res?.error) {
                router.push('/');
            } else {
                alert("Invalid credentials");
                setCheckingPassword(false);
            }
        } catch (error) {
            console.log(error);
            alert("Failed to sign up");
            setCheckingPassword(false);
        }
    };

    return (
        <section className="wrapper relative flex min-h-screen items-center justify-center overflow-hidden antialiased">
            <div className="flex w-full flex-col justify-between gap-12 rounded-2xl bg-primary p-8 md:max-w-[30vw]">
                <div className="flex flex-col text-center">
                    <h2 className="text-3xl font-semibold tracking-tighter md:text-4xl">
                        Welcome to {' '}
                        <span className="bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text pr-1 font-black tracking-tighter text-transparent">
                            Remote Share
                        </span>
                    </h2>
                    <p className="text-lg font-medium tracking-tighter text-white md:text-xl">
                        Sign Up to share screen!
                    </p>
                </div>
                <div className="flex flex-col gap-8">
                    <div className="grid w-full items-center gap-4">
                        <div className="relative flex flex-col gap-2">
                            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70' htmlFor="name">Name</label>
                            <input
                                className="focus:ring-none border-none bg-white/5 focus:outline-none flex h-10 w-full rounded-md border border-gray-700/50 px-2"
                                name="name"
                                id="name"
                                placeholder="name"
                                ref={nameRef}
                                onChange={() => {
                                    setRequiredError((prevState) => ({
                                        ...prevState,
                                        nameReq: false,
                                    }));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        emailRef.current?.focus();
                                    }
                                }}
                            />
                            {requiredError.nameReq && (
                                <span className="text-red-500">Name is required</span>
                            )}
                        </div>
                        <div className="relative flex flex-col gap-2">
                            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70' htmlFor="email">Email</label>
                            <input
                                className="focus:ring-none border-none bg-white/5 focus:outline-none flex h-10 w-full rounded-md border border-gray-700/50 px-2"
                                name="email"
                                type='email'
                                id="email"
                                placeholder="name@email.com"
                                ref={emailRef}
                                onChange={() => {
                                    setRequiredError((prevState) => ({
                                        ...prevState,
                                        emailReq: false,
                                    }));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        passwordRef.current?.focus();
                                    }
                                }}
                            />
                            {requiredError.emailReq && (
                                <span className="text-red-500">Email is required</span>
                            )}
                        </div>
                        <div className="relative flex flex-col gap-2">
                            <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Password</label>
                            <div className="flex">
                                <input
                                    className="focus:ring-none border-none bg-white/5 focus:outline-none flex h-10 w-full rounded-md border border-gray-700/50 px-2"
                                    name="password"
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    id="password"
                                    placeholder="••••••••"
                                    ref={passwordRef}
                                    onChange={() => {
                                        setRequiredError((prevState) => ({
                                            ...prevState,
                                            passReq: false
                                        }));
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setIsPasswordVisible(false);
                                            handleSubmit();
                                        }
                                    }}
                                />
                                <button
                                    className="absolute bottom-0 right-0 flex h-10 items-center px-4 text-neutral-500"
                                    onClick={() => setIsPasswordVisible((prevState) => !prevState)}
                                >
                                    {isPasswordVisible ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="h-5 w-5"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {requiredError.passReq && (
                                <span className="text-red-500">Password is required</span>
                            )}
                        </div>
                    </div>
                    <div className='flex flex-1 flex-col gap-3 items-center'>
                        <button
                            className='disabled:opacity-50 h-11 rounded-md px-8 bg-gradient-to-b from-blue-400 to-blue-700 text-white font-medium hover:opacity-80 transition-all duration-300 w-full'
                            disabled={!emailRef.current?.value || !passwordRef.current?.value || checkingPassword}
                            onClick={handleSubmit}
                        >
                            Sign Up
                        </button>
                        <p className="text-sm tracking-tighter text-white">
                            Already have an account?{' '}
                            <Link href={"/signin"}>
                                <span className="text-blue-500 hover:underline cursor-pointer font-bold">Login</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            <div className="absolute -bottom-[16rem] -z-20 size-[24rem] overflow-hidden rounded-full bg-gradient-to-t from-blue-400 to-blue-700 blur-[16em]" />
        </section>
    );
};

export default SignUp;