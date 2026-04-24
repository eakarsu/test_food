interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
}

interface Props {
  filters: FilterGroup[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

const FilterBar = ({ filters, values, onChange }: Props) => {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((group) => (
        <div key={group.key} className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">{group.label}:</label>
          <select
            value={values[group.key] || ''}
            onChange={(e) => onChange(group.key, e.target.value)}
            className="input py-1.5 text-sm w-auto"
          >
            <option value="">All</option>
            {group.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

export default FilterBar;
