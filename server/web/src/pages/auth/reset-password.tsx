import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { PasswordResetForm } from '@/feature/auth/components/PasswordResetForm'
import useAuthStore from '@/store/auth'

export default function ResetPasswordPage() {
    const { isAuthenticated } = useAuthStore()
    const navigate = useNavigate()


    useEffect(() => {
        // If not authenticated, redirect to login
        if (!isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <PasswordResetForm />
            </div>
        </div>
    )
} 