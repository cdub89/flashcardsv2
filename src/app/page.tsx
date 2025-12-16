import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  
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
            <Button size="lg" className="rounded-full">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="outline" size="lg" className="rounded-full">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </main>
    </div>
  );
}
