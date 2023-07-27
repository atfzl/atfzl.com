+++
title = "Using flow and eslint in Emacs"
date = "2016-11-06"
+++

# Using flow and eslint in Emacs

```lisp
(require 'company)
(require 'web-mode)
(require 'flycheck)
(require 'flycheck-flow)

;; flow auto complete
;; skip this if you don't use company-mode
(eval-after-load 'company
  '(add-to-list 'company-backends 'company-flow))

;; add eslint and flow checkers to flycheck
(flycheck-add-mode 'javascript-eslint 'web-mode)
(flycheck-add-mode 'javascript-flow 'web-mode)

;;disable jshint since we prefer eslint checking
(setq-default flycheck-disabled-checkers
  (append flycheck-disabled-checkers
    '(javascript-jshint)))

(defun jsWithEslint ()
  "eslint for js files"
  (interactive)
  (web-mode)
  (web-mode-set-content-type "jsx")
  (flycheck-disable-checker 'javascript-flow)
  (flycheck-select-checker 'javascript-eslint)
  (flycheck-mode))

(defun jsWithEslintFlow ()
  "flow and eslint for js files"
  (interactive)
  (web-mode)
  (web-mode-set-content-type "jsx")
  (flycheck-select-checker 'javascript-eslint)
  (flycheck-add-next-checker 'javascript-eslint 'javascript-flow)
  (flycheck-mode))

;; set key shortcuts if you want
;; (global-set-key (kbd "C-c j") 'jsWithEslint)
;; (global-set-key (kbd "C-c f") 'jsWithEslintFlow)

(add-to-list 'auto-mode-alist '("\\.js\\'"      . jsWithEslint))
(add-to-list 'magic-mode-alist '("/\\* @flow \\*/" . jsWithEslintFlow))
```

Now all the .js files will use eslint.  
But if you have `/\* @flow \*/` comment at the first line, flow will also be used.

To use local eslint and flow-bin from your node_modules, check out this package: [add-node-modules-path](https://github.com/codesuki/add-node-modules-path).
