import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  branches: string[];
  selectedBranches: string[];
  onBranchToggle: (branch: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const BranchSelector: React.FC<Props> = ({
  branches,
  selectedBranches,
  onBranchToggle,
  onSelectAll,
  onDeselectAll
}) => {
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">브랜치 선택</h3>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
          >
            전체 선택
          </button>
          <button
            onClick={onDeselectAll}
            className="text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
          >
            전체 해제
          </button>
        </div>
      </div>

      {/* 브랜치 목록 */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-custom pr-2">
        {branches.map((branch) => {
          const isSelected = selectedBranches.includes(branch);
          const isMain = branch === 'main' || branch === 'master';

          return (
            <button
              key={branch}
              onClick={() => onBranchToggle(branch)}
              className={`w-full group flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors
                ${isSelected
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'hover:bg-accent'
                }
                ${isMain ? 'font-medium' : ''}
              `}
            >
              <div className={`
                flex-shrink-0 w-4 h-4 rounded border transition-colors
                ${isSelected
                  ? 'bg-primary border-primary group-hover:bg-primary/90'
                  : 'border-input group-hover:border-primary'
                }
              `}>
                {isSelected && (
                  <Check className="w-3 h-3 text-primary-foreground m-0.5" />
                )}
              </div>
              <span className="flex-grow text-left truncate">{branch}</span>
              {isMain && (
                <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  메인
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BranchSelector; 