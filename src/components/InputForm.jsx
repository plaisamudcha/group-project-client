function InputForm({
  name,
  label,
  register,
  errors,
  type = "text",
  placeholder = "",
}) {
  return (
    <div className="flex-1">
      <label className="block mb-1 font-medium">{label}</label>
      <input
        type={type}
        className="input w-full input-accent"
        {...register}
        placeholder={placeholder}
        step="any"
      />
      {errors[name] && (
        <p className="text-sm text-red-400">{errors[name]?.message}</p>
      )}
    </div>
  );
}

export default InputForm;
