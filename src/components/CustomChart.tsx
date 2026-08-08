/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, Award, Clock, Users } from 'lucide-react';

interface CustomChartProps {
  studentsCount: number;
  teachersCount: number;
  averageAttendance: number;
  gradesDistribution: { grade: string, count: number }[];
  weeklyAttendance: { day: string, percentage: number }[];
}

export default function CustomChart({ 
  studentsCount, 
  teachersCount, 
  averageAttendance, 
  gradesDistribution, 
  weeklyAttendance 
}: CustomChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'attendance' | 'grades'>('attendance');

  // Attendance Trend coordinates mapping (SVG dimensions 500x150)
  const maxVal = 100;
  const paddingX = 40;
  const paddingY = 20;
  const width = 460;
  const height = 110;

  const points = weeklyAttendance.map((d, index) => {
    const x = paddingX + (index * (width / (weeklyAttendance.length - 1)));
    const y = paddingY + height - (d.percentage / maxVal) * height;
    return { x, y, info: d };
  });

  const pathString = points.reduce((acc, p, index) => {
    return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Fill gradient coordinates path
  const fillPathString = points.length > 0 
    ? `${pathString} L ${points[points.length - 1].x} ${paddingY + height} L ${points[0].x} ${paddingY + height} Z`
    : '';

  // Grades bar sizing (dimension 500x150)
  const maxCount = Math.max(...gradesDistribution.map(g => g.count), 1);
  const barWidth = 45;
  const barSpacing = (500 - 80) / gradesDistribution.length;

  return (
    <div className="space-y-6">
      
      {/* Upper Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase block mb-1">Enrolled Students</span>
            <span className="text-3xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {studentsCount}
            </span>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">+12% this term</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase block mb-1">Active Faculty</span>
            <span className="text-3xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
              {teachersCount}
            </span>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">100% Retained</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase block mb-1">Avg Attendance Rate</span>
            <span className="text-3xl font-extrabold text-slate-900 group-hover:text-amber-550 transition-colors">
              {averageAttendance.toFixed(1)}%
            </span>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">Consistent (May/June)</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
          <div>
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase block mb-1">Academic Quality GPA</span>
            <span className="text-3xl font-extrabold text-slate-900 group-hover:text-purple-650 transition-colors">
              8.8 / 10
            </span>
            <div className="flex items-center gap-1 mt-1.5">
              <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-md font-bold">High performance</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
        </div>

      </div>

      {/* Primary Analytics Plot and Panel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Analytics Visual Graph Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-650" />
                <span>Interactive Campus Analytics</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time analytical trends for institutional benchmarks</p>
            </div>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setChartType('attendance')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'attendance'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Attendance Trends
              </button>
              <button
                onClick={() => setChartType('grades')}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  chartType === 'grades'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Grades Distribution
              </button>
            </div>
          </div>

          <div className="flex-1 py-8 flex items-center justify-center min-h-[220px]">
            {chartType === 'attendance' ? (
              // ATTENDANCE TRENDS LINE GRAPH SVG
              <div className="w-full relative">
                <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 150">
                  <defs>
                    <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline dashes */}
                  <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.5" />
                  <line x1="40" y1="75" x2="490" y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.5" />
                  <line x1="40" y1="130" x2="490" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Graph plot filling */}
                  {points.length > 0 && (
                    <>
                      <path d={fillPathString} fill="url(#glowGrad)" />
                      <path d={pathString} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}

                  {/* Render tracking dots */}
                  {points.map((p, index) => (
                    <g key={index}>
                      <circle 
                        cx={p.x} 
                        cy={p.y} 
                        r={hoveredIndex === index ? "7" : "5"} 
                        fill="#ffffff" 
                        stroke="#4f46e5" 
                        strokeWidth={hoveredIndex === index ? "4" : "2.5"}
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                      {/* Text label underneath */}
                      <text 
                        x={p.x} 
                        y="146" 
                        textAnchor="middle" 
                        className="text-[10px] font-bold text-slate-400 fill-current"
                      >
                        {p.info.day}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Floating dynamic hover indicator tip box */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                  <div 
                    className="absolute bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-[11px] font-bold shadow-lg pointer-events-none transition-all z-10"
                    style={{
                      left: `${(points[hoveredIndex].x / 500) * 100}%`,
                      top: `${((points[hoveredIndex].y - 35) / 150) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    Attendance: {points[hoveredIndex].info.percentage}%
                  </div>
                )}
              </div>
            ) : (
              // GRADES ALLOCATION BAR CHART SVG
              <div className="w-full relative">
                <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 150">
                  {/* Grid dashes */}
                  <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.5" />
                  <line x1="40" y1="75" x2="490" y2="75" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1.5" />
                  <line x1="40" y1="130" x2="490" y2="130" stroke="#e2e8f0" strokeWidth="1.5" />

                  {gradesDistribution.map((item, index) => {
                    const x = 50 + (index * barSpacing);
                    const barHeight = (item.count / maxCount) * 100;
                    const y = 130 - barHeight;

                    const isHovered = hoveredIndex === index;

                    return (
                      <g key={item.grade}>
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          rx="6"
                          className="cursor-pointer transition-colors"
                          fill={isHovered ? "#3b82f6" : "#6366f1"}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                        {/* Grade label */}
                        <text
                          x={x + barWidth / 2}
                          y="145"
                          textAnchor="middle"
                          className="text-[11px] font-bold text-slate-500 fill-current"
                        >
                          {item.grade}
                        </text>
                        {/* Top numerical density */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 8}
                          textAnchor="middle"
                          className="text-[10px] font-bold font-mono text-indigo-650 fill-current"
                        >
                          {item.count} student{item.count !== 1 ? 's' : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Startup Business Model Promo and Subscription Metrics Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <span className="bg-indigo-500/20 text-indigo-300 font-bold tracking-wider text-[10px] px-2.5 py-1 rounded-full uppercase inline-block border border-indigo-400/20">
              Pricing Model
            </span>
            <h3 className="text-xl font-bold tracking-tight">Launch the Premium Tier or Custom Package</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target coaching institutes, training academies, and primary colleges with SmartEdu SaaS configurations. Scalable starting at just <b className="text-white">₹2,000 to ₹10,000</b> per month.
            </p>
          </div>

          <div className="my-5 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Market Cap:</span>
              <span className="font-bold text-emerald-400">High Growth</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Average School ROI:</span>
              <span className="font-bold text-emerald-400">10x Time Saved</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Payment Gateway:</span>
              <span className="font-semibold text-sky-400">Stripe Sandbox ON</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>SaaS Subscription Health</span>
              <span>85% Capacity</span>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-400 to-emerald-400 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
