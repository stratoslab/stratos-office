import { TaskType } from '../../types';
import TaskWorkspace from '../workspace/TaskWorkspace';

interface PrivacyWorkspaceProps {
  taskType: TaskType;
}

export default function PrivacyWorkspace({ taskType }: PrivacyWorkspaceProps) {
  return <TaskWorkspace taskType={taskType} />;
}
