import { useRef } from "react";

export default function OTPInput({ digits, onChange }) {
  const refs = useRef([]);

  const handleChange = (i, val) => {
    const next = [...digits];
    next[i] = val.slice(-1);
    onChange(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          className="otp-box"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onFocus={e => e.target.select()}
        />
      ))}
    </div>
  );
}
