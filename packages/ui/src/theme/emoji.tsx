import { HTMLAttributes, component$ } from "@builder.io/qwik";
// copied from https://github.com/SeanMcP/qwik-emoji mit license

export interface EmojiProps extends HTMLAttributes<HTMLSpanElement> {
    label?: string;
    symbol: string;
  }
  
  export const Emoji = component$((props: EmojiProps) => {
    const { label, symbol, ...rest } = props;
    return (
      <span
        {...rest}
        aria-hidden={label ? undefined : "true"}
        aria-label={label}
        role="img"
      >
        {symbol}
      </span>
    );
  });