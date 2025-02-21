+++
title = "Create Require"
description = "require in node ESM"
date = "2024-09-11"
+++

```js
import { createRequire } from 'module'


const require = createRequire(import.meta.url);
```
