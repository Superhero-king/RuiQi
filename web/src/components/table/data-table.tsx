import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { flexRender, Table as TableType, ColumnDef } from "@tanstack/react-table"
import { Loader2 } from "lucide-react"

interface DataTableProps<TData, TValue> {
    table: TableType<TData>
    columns: ColumnDef<TData, TValue>[]
    style?: 'default' | 'border' | 'simple'
    isLoading?: boolean
    loadingRows?: number
    loadingStyle?: 'centered' | 'skeleton'
}

// 加载状态骨架屏组件
const TableSkeleton = <TData, TValue>({
    columns,
    rows = 5
}: {
    columns: ColumnDef<TData, TValue>[],
    rows?: number
}) => (
    <>
        {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={`skeleton-row-${index}`} className="animate-pulse">
                {Array.from({ length: columns.length }).map((_, cellIndex) => (
                    <TableCell key={`skeleton-cell-${index}-${cellIndex}`}>
                        <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
                    </TableCell>
                ))}
            </TableRow>
        ))}
    </>
)

// 中心加载动画组件
const CenteredLoader = <TData, TValue>({
    columns
}: {
    columns: ColumnDef<TData, TValue>[]
}) => (
    <TableRow>
        <TableCell colSpan={columns.length} className="h-24">
            <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">加载中...</span>
            </div>
        </TableCell>
    </TableRow>
)

// 无数据状态组件
const NoResults = <TData, TValue>({
    columns
}: {
    columns: ColumnDef<TData, TValue>[]
}) => (
    <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
            没有找到相关数据
        </TableCell>
    </TableRow>
)

export function DataTable<TData, TValue>({
    table,
    columns,
    style = 'default',
    isLoading = false,
    loadingRows = 5,
    loadingStyle = 'centered',
}: DataTableProps<TData, TValue>) {
    // 渲染表格主体内容
    const renderTableBody = () => {
        if (isLoading) {
            // 根据 loadingStyle 选项决定使用哪种加载动画
            return loadingStyle === 'centered'
                ? <CenteredLoader<TData, TValue> columns={columns} />
                : <TableSkeleton<TData, TValue> columns={columns} rows={loadingRows} />
        }

        if (!table.getRowModel().rows?.length) {
            return <NoResults<TData, TValue> columns={columns} />
        }

        return table.getRowModel().rows.map((row) => (
            <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
            >
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
        ))
    }

    // 表头渲染函数
    const renderTableHeader = () => (
        <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                            {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                )}
                        </TableHead>
                    ))}
                </TableRow>
            ))}
        </TableHeader>
    )

    switch (style) {
        case 'simple':
            return (
                <div className="w-full h-full">
                    <Table>
                        {renderTableHeader()}
                        <TableBody>
                            {renderTableBody()}
                        </TableBody>
                    </Table>
                </div>
            )

        case 'border':
            return (
                <div className="rounded-md border h-full w-full">
                    <Table>
                        {renderTableHeader()}
                        <TableBody>
                            {renderTableBody()}
                        </TableBody>
                    </Table>
                </div>
            )

        default:
            return (
                <div className="w-full h-full">
                    <Table>
                        {renderTableHeader()}
                        <TableBody className={isLoading ? "" : "[&_tr:last-child]:!border-b"}>
                            {renderTableBody()}
                        </TableBody>
                    </Table>
                </div>
            )
    }
}