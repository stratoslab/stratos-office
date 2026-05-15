import { TaskType } from '../../types';
import TaskWorkspace from '../workspace/TaskWorkspace';

interface DocumentsWorkspaceProps {
  taskType: TaskType;
}

export default function DocumentsWorkspace({ taskType }: DocumentsWorkspaceProps) {
  return <TaskWorkspace taskType={taskType} />;
}
