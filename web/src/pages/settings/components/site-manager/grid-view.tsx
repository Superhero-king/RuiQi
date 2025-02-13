import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Site } from "../types";

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
}

function SiteCard({ site, onEdit, onDelete }: SiteCardProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
        <span className="text-gray-600">站点名称：</span>
        <span>{site.name}</span>
        
        <span className="text-gray-600">SSL 开启状态：</span>
        <Switch checked={site.sslEnabled} />
        
        <span className="text-gray-600">端口：</span>
        <span>{site.port}</span>
        
        <span className="text-gray-600">备注：</span>
        <span>{site.note}</span>
        
        <span className="text-gray-600">保护状态：</span>
        <span>{site.protectionStatus}</span>
        
        <span className="text-gray-600">今日防护情况：</span>
        <span>{site.todayProtection}</span>
        
        <span className="text-gray-600">最后受到攻击时间：</span>
        <span>{site.lastAttackTime}</span>
        
        <span className="text-gray-600">上游：</span>
        <span>{site.upstream}</span>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="destructive" size="sm" onClick={() => onDelete(site)}>
          删除
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onEdit(site)}>
          编辑
        </Button>
      </div>
    </Card>
  );
}

export function GridView() {
  // Mock data - replace with real data later
  const sites: Site[] = [
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

  const handleEdit = (site: Site) => {
    console.log("Edit site:", site);
  };

  const handleDelete = (site: Site) => {
    console.log("Delete site:", site);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sites.map((site) => (
        <SiteCard
          key={site.id}
          site={site}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
} 