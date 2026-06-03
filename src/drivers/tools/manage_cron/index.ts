import { ToolModule } from '../../../include/types';
import manifest from './manifest.json';

export const CronTool: ToolModule = {
  metadata: manifest as any,
  execute: async (args: any, context?: any) => {
    if (args.action === 'list') {
      const res = await fetch('/api/cron');
      return res.json();
    }
    
    if (args.action === 'add' || args.action === 'edit') {
      const id = args.action === 'edit' ? args.taskId : `task_${Date.now()}`;
      if (!id) return { error: "taskId is required for 'edit'" };
      
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: args.taskName,
          schedule: args.schedule || '5m',
          enabled: true,
          repeating: args.repeating ?? false,
          context_id: context?.contextId || 'live_stream',
          chat_type: args.targetChannel || context?.chatType || 'Live Chat',
          sender_name: context?.userName || 'Penonton'
        })
      });
      return res.json();
    }
    
    if (args.action === 'toggle') {
      const tasksRes = await fetch('/api/cron');
      const tasks = await tasksRes.json();
      const task = tasks.find((t: any) => t.id === args.taskId);
      if (!task) return { error: "Task not found" };
      
      const res = await fetch('/api/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, enabled: !task.enabled })
      });
      return res.json();
    }

    if (args.action === 'delete') {
      if (!args.taskId) return { error: "taskId is required for 'delete'" };
      const res = await fetch(`/api/cron/${args.taskId}`, {
        method: 'DELETE'
      });
      return res.json();
    }
    
    return { error: "Invalid action" };
  }
};
