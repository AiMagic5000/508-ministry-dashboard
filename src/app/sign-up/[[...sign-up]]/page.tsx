import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-light-900 mb-2">508 Ministry Dashboard</h1>
          <p className="text-light-500">Create an account to get started</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl"
            }
          }}
        />
      </div>
    </div>
  )
}
