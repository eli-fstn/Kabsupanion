function Button({
  text,
  bgColor = "",
  typography = "",
  dimensions = "",
  padding = "",
  shadow = "",
  margin = "",
  animation = "",
  onClick,
  disabled,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${bgColor} ${typography} ${dimensions} ${padding} ${shadow} ${margin} ${animation}`.trim()}
    >
      {text}
    </button>
  );
}

export default Button