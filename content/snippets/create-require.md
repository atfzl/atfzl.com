+++
title = "Create Require"
description = "require in node ESM"
date = "2024-09-11"
+++

# Using require in ESM Node.js

```js
import { createRequire } from 'module'


const require = createRequire(import.meta.url);
```
