import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { LoginForm } from '@/feature/auth/components/LoginForm'
import useAuthStore from '@/store/auth'

export default function LoginPage() {
    const { isAuthenticated, needPasswordReset } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    // Get the redirect path from location state, or default to '/'
    const from = location.state?.from?.pathname || '/'

    useEffect(() => {
        // If already authenticated
        if (isAuthenticated) {
            // If needs password reset, redirect to reset page
            if (needPasswordReset) {
                navigate('/reset-password')
            } else {
                // Otherwise, redirect to the page they tried to access or home
                navigate(from)
            }
        }
    }, [isAuthenticated, needPasswordReset, navigate, from])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    )
}