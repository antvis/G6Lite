# Tooltip configuration (/en/docs/guides/tooltip)



```ts
behaviors: [
  {
    type: 'tooltip',
    getContent: ({ itemType, data }) =>
      `<strong>${itemType}</strong><br />${String(data?.label ?? '')}`,
  },
];
```

Use application-safe rendering when content contains user input. Tooltip positioning follows the shared pointer and picking pipeline. Style the generated surface through the documented tooltip class names or your own controlled content.
