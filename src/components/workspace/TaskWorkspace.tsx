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
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full p-3 md:p-4 lg:p-0">
      <div className="lg:w-1/2 space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-lg md:text-xl font-semibold text-white truncate">{config.label}</h2>
            <p className="text-xs md:text-sm text-gray-400 line-clamp-2">{config.description}</p>
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
