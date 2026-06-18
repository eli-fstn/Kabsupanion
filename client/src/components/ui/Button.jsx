function Button({ text, BGColor, typography, dimensions, padding, shadow, margin, onClick, disabled }) {
  return (
    <button onClick={onClick}  disabled={disabled} className={`rounded-md active:scale-95 transition-transform duration-100 ${BGColor} ${typography} ${dimensions} ${padding} ${shadow} ${margin}`}>{text}</button>
  );
}

export default Button