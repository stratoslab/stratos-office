import { TaskType } from '../../types';
import TaskWorkspace from '../workspace/TaskWorkspace';

interface TextWorkspaceProps {
  taskType: TaskType;
}

export default function TextWorkspace({ taskType }: TextWorkspaceProps) {
  return <TaskWorkspace taskType={taskType} />;
}
