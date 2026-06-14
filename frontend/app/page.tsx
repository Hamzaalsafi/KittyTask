"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThreeDot } from "react-loading-indicators";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, login, register } = useAuth();

  const [animate, setAnimate] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [name2, setName2] = useState("");
  const [email2, setEmail2] = useState("");
  const [password2, setPassword2] = useState("");
  const [error2, setError2] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in → go to dashboard.
  useEffect(() => {
    if (!authLoading && user) router.replace("/home");
  }, [authLoading, user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.push("/home");
    } catch {
      setError("Error logging in.");
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError2("");
    if (!name2 || !email2 || !password2) {
      setError2("Please fill in all fields (name, email, and password).");
      return;
    }
    setLoading(true);
    try {
      await register(name2, email2, password2);
      router.push("/home");
    } catch (err) {
      setError2("Error creating account: " + (err instanceof Error ? err.message : "unknown"));
      setLoading(false);
    }
  };

  const handleAnimation = () => setAnimate((a) => !a);

  return (
    <div className="h-screen w-screen flex justify-center items-center overflow-y-hidden">
      {loading && (
        <div className="flex flex-col justify-center items-center gap-6 p-4">
          <ThreeDot variant="bounce" color="#d33dad" size="large" text="" textColor="#f8f8f8" />
          <p className="text-[1.3rem] font-bold text-center text-gray-900" style={{ maxWidth: "350px" }}>
            Hang tight! We&apos;re preparing everything for you...
          </p>
        </div>
      )}
      {!loading && (
        <div
          className={`flex mx-52 my-auto p-20 py-52 shadow-2xl justify-center rounded-xl items-center gap-[17%] sm:gap-40 logincontainer ${
            animate ? "animate-right" : ""
          }`}
        >
          <div className="flex flex-col justify-center items-center">
            <div className="signinmode flex flex-col justify-start items-center">
              <h1 className="text-center text-2xl sm:text-2xl text-gray-100 mb-1">Already have an account?</h1>
              <p className="text-center text-lg text-gray-100">
                Welcome back! Sign in to continue organizing and making progress.
              </p>
              <button
                onClick={handleAnimation}
                className="bg-blue-500 hover:bg-blue-600 text-gray-100 m-4 py-1.5 px-20 rounded-2xl text-m"
              >
                Sign in
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cat.svg" className="hover:scale-110 w-[80%] max-w-[440px] hover:transform-cpu" alt="cat" />
            </div>

            <form className="singinfrom flex flex-col justify-center items-center" onSubmit={handleLogin}>
              <h1 className="text-2xl text-black font-bold opacity-85">Sign in</h1>
              <div className="flex relative">
                <svg className="size-6 absolute top-4 left-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input type="email" placeholder="Email" className="bg-neutral-300 bg-opacity-70 p-2 px-9 m-2 text-black rounded-2xl w-72" onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="flex relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6 absolute top-4 left-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <input type="password" placeholder="Password" className="bg-neutral-300 bg-opacity-70 p-2 px-9 m-2 text-black rounded-2xl w-72" onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-gray-100 m-4 sm:mt-5 py-1.5 px-9 rounded-2xl text-m">
                Sign in
              </button>
              {error && (
                <p className="text-center text-xs text-red-600">
                  Oops! It looks like your email or password is incorrect. Please try again.
                </p>
              )}
            </form>
          </div>

          <div className="flex flex-col justify-center items-center justify-self-end">
            <div className="signupmode flex flex-col justify-center items-center">
              <h1 className="text-center text-2xl sm:text-2xl text-gray-100 mb-1">New to KittyTask??</h1>
              <p className="text-center text-lg text-gray-100">
                Start organizing your life today! Sign up to manage your tasks, projects, and ideas all in one place.
              </p>
              <button onClick={handleAnimation} className="bg-blue-500 hover:bg-blue-600 text-gray-100 m-4 py-1.5 px-20 rounded-2xl text-m">
                Sign up
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cat2.svg" className="hover:scale-110 hover:transform-cpu w-[80%] max-w-[440px]" alt="cat" />
            </div>

            <form className="signupfrom flex flex-col items-center" onSubmit={handleCreateAccount}>
              <h1 className="text-2xl text-black font-bold opacity-85">Sign up</h1>
              <div className="flex relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6 absolute top-4 left-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <input type="text" placeholder="Username" className="bg-neutral-300 bg-opacity-70 p-2 px-9 m-2 text-black rounded-2xl w-72" onChange={(e) => setName2(e.target.value)} />
              </div>
              <div className="flex relative">
                <svg className="size-6 absolute top-4 left-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input type="email" placeholder="Email" className="bg-neutral-300 bg-opacity-70 p-2 px-9 m-2 text-black rounded-2xl w-72" onChange={(e) => setEmail2(e.target.value)} />
              </div>
              <div className="flex relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="size-6 absolute top-4 left-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <input type="password" placeholder="Password" className="bg-neutral-300 bg-opacity-70 p-2 px-9 m-2 mb-2 text-black rounded-2xl w-72" onChange={(e) => setPassword2(e.target.value)} />
              </div>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-gray-100 fm-4 sm:mt-5 py-1.5 px-9 rounded-2xl text-m">
                Sign up
              </button>
              {error2 && <p className="text-center text-xs text-red-600">{error2}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
