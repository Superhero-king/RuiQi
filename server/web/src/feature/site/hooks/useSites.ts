import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { siteApi } from '@/api/site'
import { CreateSiteRequest, UpdateSiteRequest } from '@/types/site'
import { useToast } from '@/hooks/use-toast'

type ApiError = {
    message: string
}

/**
 * 创建站点Hook
 */
export const useCreateSite = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)

    const mutation = useMutation({
        mutationFn: (data: CreateSiteRequest) => siteApi.createSite(data),
        onSuccess: () => {
            toast({
                title: "创建成功",
                description: "站点已成功创建",
            })
            queryClient.invalidateQueries({ queryKey: ['sites'] })
        },
        onError: (error: ApiError) => {
            console.error('创建站点失败:', error)
            setError(error.message || "创建站点时出现错误")
            toast({
                title: "创建失败",
                description: error.message || "创建站点时出现错误",
                variant: "destructive",
            })
        }
    })

    return {
        createSite: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

/**
 * 删除站点Hook
 */
export const useDeleteSite = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)

    const mutation = useMutation({
        mutationFn: (id: string) => siteApi.deleteSite(id),
        onSuccess: () => {
            toast({
                title: "删除成功",
                description: "站点已成功删除",
            })
            queryClient.invalidateQueries({ queryKey: ['sites'] })
        },
        onError: (error: ApiError) => {
            console.error('删除站点失败:', error)
            setError(error.message || "删除站点时出现错误")
            toast({
                title: "删除失败",
                description: error.message || "删除站点时出现错误",
                variant: "destructive",
            })
        }
    })

    return {
        deleteSite: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}

/**
 * 更新站点Hook
 */
export const useUpdateSite = () => {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [error, setError] = useState<string | null>(null)

    const mutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: UpdateSiteRequest }) =>
            siteApi.updateSite(id, data),
        onSuccess: () => {
            toast({
                title: "更新成功",
                description: "站点已成功更新",
            })
            queryClient.invalidateQueries({ queryKey: ['sites'] })
        },
        onError: (error: ApiError) => {
            console.error('更新站点失败:', error)
            setError(error.message || "更新站点时出现错误")
            toast({
                title: "更新失败",
                description: error.message || "更新站点时出现错误",
                variant: "destructive",
            })
        }
    })

    return {
        updateSite: mutation.mutate,
        isLoading: mutation.isPending,
        error,
        clearError: () => setError(null),
    }
}