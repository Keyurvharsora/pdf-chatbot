import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0d0d0d]">
      <SignUp />
    </div>
  )
}
