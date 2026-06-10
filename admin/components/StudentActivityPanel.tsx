"use client";

import { motion } from "framer-motion";
import { BarChart2, Clock, BookOpen, Users } from "lucide-react";

interface StudentActivityPanelProps {
  data: {
    days: { day: string; count: number }[];
    stats: {
      avgTopicsPerStudent: number;
      mostActiveHour: string;
      topSubject: string;
      retentionD7: number;
    };
  };
}

export default function StudentActivityPanel({ data }: StudentActivityPanelProps) {
  const maxCount = Math.max(...data.days.map((d) => d.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-emerald-600" />
        Student Activity (Last 7 Days)
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT: Bar Chart */}
        <div>
          <div className="flex items-end justify-between gap-2 h-48 px-2">
            {data.days.map((item, idx) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 rounded-t-md relative h-full flex items-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="w-full bg-emerald-500 rounded-t-md min-h-[4px]"
                  />
                </div>
                <span className="text-xs text-slate-500 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">Topics read per day</p>
        </div>

        {/* RIGHT: Stat List */}
        <div className="space-y-4">
          <StatItem
            icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
            label="Avg. topics per student"
            value={data.stats.avgTopicsPerStudent.toFixed(1)}
          />
          <StatItem
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            label="Most active hour"
            value={data.stats.mostActiveHour}
          />
          <StatItem
            icon={<BookOpen className="w-5 h-5 text-blue-600" />}
            label="Top subject"
            value={data.stats.topSubject}
          />
          <StatItem
            icon={<Users className="w-5 h-5 text-purple-600" />}
            label="Retention (D7)"
            value={`${data.stats.retentionD7}%`}
          />
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
      <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
