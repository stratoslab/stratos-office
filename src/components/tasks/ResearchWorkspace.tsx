import { TaskType } from '../../types';
import TaskWorkspace from '../workspace/TaskWorkspace';

interface ResearchWorkspaceProps {
  taskType: TaskType;
}

export default function ResearchWorkspace({ taskType }: ResearchWorkspaceProps) {
  return <TaskWorkspace taskType={taskType} />;
}
