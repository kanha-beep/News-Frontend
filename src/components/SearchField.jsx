export default function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  children = null,
  onFocus,
  onBlur,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
        />
        {children}
      </div>
    </div>
  );
}
