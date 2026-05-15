import { TaskType } from '../../types';
import { getTaskConfig } from '../../taskRouter';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import ThinkingModeToggle from '../ui/ThinkingModeToggle';
import { useTask } from '../../context/TaskContext';

interface TaskWorkspaceProps {
  taskType: TaskType;
}

export default function TaskWorkspace({ taskType }: TaskWorkspaceProps) {
  const config = getTaskConfig(taskType);
  const { enableThinking, setEnableThinking } = useTask();

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="lg:w-1/2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{config.label}</h2>
            <p className="text-sm text-gray-400">{config.description}</p>
          </div>
          {config.supportsThinkingMode && (
            <ThinkingModeToggle enabled={enableThinking} onChange={setEnableThinking} />
          )}
        </div>
        <InputPanel taskType={taskType} />
      </div>
      <div className="lg:w-1/2">
        <OutputPanel taskType={taskType} />
      </div>
    </div>
  );
}
