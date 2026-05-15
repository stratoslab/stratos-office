import { TaskType } from '../../types';
import TaskWorkspace from '../workspace/TaskWorkspace';

interface VisualWorkspaceProps {
  taskType: TaskType;
}

export default function VisualWorkspace({ taskType }: VisualWorkspaceProps) {
  return <TaskWorkspace taskType={taskType} />;
}
