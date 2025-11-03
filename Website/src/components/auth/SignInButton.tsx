import { Button } from '../ui/button'
import { authService } from '../../services/authService'

export function SignInButton() {
  const handleSignIn = () => {
    authService.signIn()
  }

  return (
    <Button
      onClick={handleSignIn}
      size="lg"
      className="w-full bg-[#1483EB] hover:bg-[#0d6fd1] text-white"
    >
      Sign in with Pipedrive
    </Button>
  )
}
