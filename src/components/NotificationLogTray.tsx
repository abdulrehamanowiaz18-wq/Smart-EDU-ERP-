/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, CheckCircle, Clock } from 'lucide-react';
import { NotificationLog } from '../types';

interface NotificationLogTrayProps {
  logs: NotificationLog[];
}

export default function NotificationLogTray({ logs }: NotificationLogTrayProps) {
  return (
    <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in-40 duration-200">
      
      <div className="pb-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-905 flex items-center gap-2">
            <Mail className="w-5 h-5 text-rose-500 animate-pulse-none" />
            <span>Automated SMTP Email Dispatch Logs</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time delivery tracing logs representing automated parent/faculty newsletters.
          </p>
        </div>
        <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase">
          SMTP Server status: Operational
        </span>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div 
              key={log.id} 
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition-colors flex items-start gap-4 text-xs font-semibold"
            >
              <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <span className="font-extrabold text-slate-900 block truncate leading-tight">
                      {log.subject}
                    </span>
                    <span className="text-[10px] text-slate-450 mt-1 block">
                      To: <b className="text-slate-700">{log.recipientName}</b> ({log.toEmail})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-550" />
                    <span className="text-[9px] text-emerald-700 uppercase font-black uppercase font-mono tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                      {log.status}
                    </span>
                  </div>
                </div>

                <p className="text-slate-500 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-150 font-mono text-[10px] whitespace-pre-line">
                  {log.message}
                </p>

                <div className="text-[10px] text-slate-400 font-bold font-mono pt-1">
                  Sent: {new Date(log.sentAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400">
            <Mail className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-350" />
            <span className="font-semibold block font-sans">No SMTP Emails Dispatched Yet</span>
            <p className="text-xs text-slate-400 mt-1">Actions like enrolling students, releasing grades, or marking absenteeism will fire automated alerts.</p>
          </div>
        )}
      </div>

    </div>
  );
}
