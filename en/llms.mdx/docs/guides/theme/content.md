# Themes (/en/docs/guides/theme)



```ts
theme: 'dark';
```

Override only the tokens your product needs:

```ts
theme: {
  type: 'light',
  tokens: {
    nodeFill: '#5B8FF9',
    edgeStroke: '#AAB7C4',
    background: '#F7F9FC',
  },
}
```

Explicit node and edge styles take precedence over theme defaults. Keep application design tokens in one place and map them to G6Lite theme tokens.
