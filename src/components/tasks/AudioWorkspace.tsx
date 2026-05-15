import { TaskType } from '../../types';
import TaskWorkspace from '../workspace/TaskWorkspace';

interface AudioWorkspaceProps {
  taskType: TaskType;
}

export default function AudioWorkspace({ taskType }: AudioWorkspaceProps) {
  return <TaskWorkspace taskType={taskType} />;
}
