import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { certificatesApi } from '@/api/certificate'
import { CertificateCreateRequest, CertificateUpdateRequest } from '@/types/certificate'
import { useToast } from '@/hooks/use-toast'

export const useCreateCertificate = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)

    const mutation = useMutation({
        mutationFn: (data: CertificateCreateRequest) => certificatesApi.createCertificate(data),
        onSuccess: () => {
            toast({
                title: "创建成功",
                description: "证书已成功创建",
            })
            queryClient.invalidateQueries({ queryKey: ['certificates'] })
        },
        onError: (error: ApiError) => {
            console.error('创建证书失败:', error)
            setError(error.message || "创建证书时出现错误")
            toast({
                title: "创建失败",
                description: error.message || "创建证书时出现错误",
                variant: "destructive",
            })
        }
    })

    return {
        createCertificate: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

export const useDeleteCertificate = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)

    const mutation = useMutation({
        mutationFn: (id: string) => certificatesApi.deleteCertificate(id),
        onSuccess: () => {
            toast({
                title: "删除成功",
                description: "证书已成功删除",
            })
            queryClient.invalidateQueries({ queryKey: ['certificates'] })
        },
        onError: (error: ApiError) => {
            console.error('删除证书失败:', error)
            setError(error.message || "删除证书时出现错误")
            toast({
                title: "删除失败",
                description: error.message || "删除证书时出现错误",
                variant: "destructive",
            })
        }
    })

    return {
        deleteCertificate: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

export const useUpdateCertificate = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)

    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: CertificateUpdateRequest }) =>
            certificatesApi.updateCertificate(id, data),
        onSuccess: () => {
            toast({
                title: "更新成功",
                description: "证书已成功更新",
            })
            queryClient.invalidateQueries({ queryKey: ['certificates'] })
        },
        onError: (error: ApiError) => {
            console.error('更新证书失败:', error)
            setError(error.message || "更新证书时出现错误")
            toast({
                title: "更新失败",
                description: error.message || "更新证书时出现错误",
                variant: "destructive",
            })
        }
    })

    return {
        updateCertificate: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
} 