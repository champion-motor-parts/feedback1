"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHART_COLORS } from "@/lib/constants";

type Datum = { name: string; value: number };
type LineDatum = { date: string; count: number };

function ChartFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">{children}</div>
      </CardContent>
    </Card>
  );
}

export function AnalyticsCharts({
  byType,
  byBranch,
  byStaff,
  averageByStaff,
  complaintsByStaff,
  complimentsByStaff,
  byStatus,
  dailyTrend
}: {
  byType: Datum[];
  byBranch: Datum[];
  byStaff: Datum[];
  averageByStaff: Datum[];
  complaintsByStaff: Datum[];
  complimentsByStaff: Datum[];
  byStatus: Datum[];
  dailyTrend: LineDatum[];
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartFrame title="Feedback by Type">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={byType} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={2}>
              {byType.map((entry, index) => (
                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Feedback by Branch">
        <SimpleBarChart data={byBranch} color="#121212" />
      </ChartFrame>

      <ChartFrame title="Feedback by Staff">
        <SimpleBarChart data={byStaff} color="#c8102e" />
      </ChartFrame>

      <ChartFrame title="Average Rating by Staff">
        <SimpleBarChart data={averageByStaff} color="#2563eb" />
      </ChartFrame>

      <ChartFrame title="Complaint Count by Staff">
        <SimpleBarChart data={complaintsByStaff} color="#64748b" />
      </ChartFrame>

      <ChartFrame title="Compliment Count by Staff">
        <SimpleBarChart data={complimentsByStaff} color="#0f766e" />
      </ChartFrame>

      <ChartFrame title="Case Status Distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={2}>
              {byStatus.map((entry, index) => (
                <Cell key={entry.name} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame title="Daily Feedback Trend">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyTrend} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="#e6e8ec" vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={32} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#c8102e" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

function SimpleBarChart({ data, color }: { data: Datum[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 0, right: 12, top: 8, bottom: 8 }}>
        <CartesianGrid stroke="#e6e8ec" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} interval={0} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} width={32} />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
