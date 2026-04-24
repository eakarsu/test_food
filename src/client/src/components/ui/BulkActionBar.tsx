import { Trash2, Edit } from 'lucide-react';

interface Props {
  count: number;
  onDelete?: () => void;
  onAction?: (action: string) => void;
  actions?: { label: string; action: string; icon?: React.ReactNode }[];
}

const BulkActionBar = ({ count, onDelete, actions = [] }: Props) => {
  if (count === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
      <span className="text-sm font-medium text-blue-800">
        {count} item{count > 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center gap-2">
        {actions.map((a) => (
          <button
            key={a.action}
            onClick={() => a.action}
            className="btn btn-secondary text-sm flex items-center gap-1"
          >
            {a.icon || <Edit className="w-4 h-4" />}
            {a.label}
          </button>
        ))}
        {onDelete && (
          <button
            onClick={onDelete}
            className="btn bg-red-600 text-white hover:bg-red-700 text-sm flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        )}
      </div>
    </div>
  );
};

export default BulkActionBar;
