import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = auth();
  
  // Redirect logged-in users to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-black dark:text-zinc-50">
            FlashCardsv2
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Your Personal Flashcard Learning Platform
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <SignInButton mode="modal">
            <button className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="flex h-12 items-center justify-center rounded-full border border-solid border-black/[.08] px-8 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}
