+++
title = "Matching fonts with Figma"
date = "2025-03-01"
+++

When I joined [Clazar](https://clazar.io), I noticed that the fonts in our web application looked bolder than on Figma. The font weights and all other config was same as in Figma but, it looked different. The font looked bolder than on Figma.

![old_figma_vs_web_app](images/old_figma_vs_web_app.png)

Because I knew Figma is also a web app, I had a hunch that Figma might have anti-aliasing enabled and we had not. This was actually true when I tried it out. Just adding this line fixed the font rendering issue:

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

![fixed_figma_vs_web_app](images/fixed_figma_vs_web_app.png)

A curious case of [Leaky Abstraction](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/)!