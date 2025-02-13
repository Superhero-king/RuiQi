import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Site } from "../types";

const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "name",
    header: "站点名称",
  },
  {
    accessorKey: "sslEnabled",
    header: "SSL 开启状态",
    cell: ({ row }) => (
      <Switch checked={row.original.sslEnabled} />
    ),
  },
  {
    accessorKey: "port",
    header: "端口",
  },
  {
    accessorKey: "note",
    header: "备注",
  },
  {
    accessorKey: "protectionStatus",
    header: "保护状态",
  },
  {
    accessorKey: "todayProtection",
    header: "今日防护情况",
  },
  {
    accessorKey: "lastAttackTime",
    header: "最后受到攻击时间",
  },
  {
    accessorKey: "upstream",
    header: "上游",
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const site = row.original;
      return (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => console.log("Delete site:", site)}
          >
            删除
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => console.log("Edit site:", site)}
          >
            编辑
          </Button>
        </div>
      );
    },
  },
];

export function TableView() {
  // Mock data - replace with real data later
  const data: Site[] = [
    {
      id: "1",
      name: "测试站点",
      sslEnabled: false,
      port: 8080,
      note: "CC 防护",
      protectionStatus: "防护中，模式...",
      todayProtection: "今日攻击数 30",
      lastAttackTime: "2022-12-8 07:52:52",
      upstream: "http://test.com"
    }
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
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
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
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
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                暂无数据
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 