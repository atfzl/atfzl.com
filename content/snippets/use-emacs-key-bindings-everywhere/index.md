+++
title = "Use emacs key bindings everywhere"
date = "2019-11-12"
+++

I am used to emacs keybinding.

My `caps lock` is mapped to `ctrl` to avoid [emacs pinky](https://www.google.com/search?q=emacs+pinky).

I am also used to making movements the emacs way , i.e.,

```
ctrl+f: right arrow
ctrl+b: left arrow
ctrl+p: up arrow
ctrl+n: down arrow
```

I have also remapped `Ctrl+g` to `escape` because I despise the escape key in the MacBook Pro touch bar.

Mac supports this keybinding in most applications but these do not work for all applications. Like in my case it was [Notability](https://itunes.apple.com/us/app/notability/id736189492). For any kind of text editing, easy movement is a must.

After a lot of googling I found out about [Karabiner-Elements](https://pqrs.org/osx/karabiner/) which modifies the key bindings in the most stable and reliable way. It also has some nice customisations like ignoring keybindings for some set of applications. I am ignoring emacs because it already has the correct keybinding and using the modified keybindings messes it up.

After installing, open up the config `~/.config/karabiner/karabiner.json`

This is my Karabiner configurations for above mentioned modifications:

`profiles[0].simple_modifications` =

```json
[
  {
    "from": {
      "key_code": "caps_lock"
    },
    "to": {
      "key_code": "left_control"
    }
  }
]
```

`profiles[0].complex_modifications.rules` = 

```json
[
  {
    "description": "Ctrl+F to right_arrow",
    "manipulators": [
      {
        "description": "emacs like movement",
        "from": {
          "key_code": "f",
          "modifiers": {
            "mandatory": [
              "left_control"
            ]
          }
        },
        "to": [
          {
            "key_code": "right_arrow"
          }
        ],
        "conditions": [
          {
            "type": "frontmost_application_unless",
            "bundle_identifiers": [
              "^org\\.gnu\\.Emacs"
            ]
          }
        ],
        "type": "basic"
      }
    ]
  },
  {
    "description": "Ctrl+B to left_arrow",
    "manipulators": [
      {
        "description": "emacs like movement",
        "from": {
          "key_code": "b",
          "modifiers": {
            "mandatory": [
              "left_control"
            ]
          }
        },
        "to": [
          {
            "key_code": "left_arrow"
          }
        ],
        "conditions": [
          {
            "type": "frontmost_application_unless",
            "bundle_identifiers": [
              "^org\\.gnu\\.Emacs"
            ]
          }
        ],
        "type": "basic"
      }
    ]
  },
  {
    "description": "Ctrl+P to up_arrow",
    "manipulators": [
      {
        "description": "emacs like movement",
        "from": {
          "key_code": "p",
          "modifiers": {
            "mandatory": [
              "left_control"
            ]
          }
        },
        "to": [
          {
            "key_code": "up_arrow"
          }
        ],
        "conditions": [
          {
            "type": "frontmost_application_unless",
            "bundle_identifiers": [
              "^org\\.gnu\\.Emacs"
            ]
          }
        ],
        "type": "basic"
      }
    ]
  },
  {
    "description": "Ctrl+N to down_arrow",
    "manipulators": [
      {
        "description": "emacs like movement",
        "from": {
          "key_code": "n",
          "modifiers": {
            "mandatory": [
              "left_control"
            ]
          }
        },
        "to": [
          {
            "key_code": "down_arrow"
          }
        ],
        "conditions": [
          {
            "type": "frontmost_application_unless",
            "bundle_identifiers": [
              "^org\\.gnu\\.Emacs"
            ]
          }
        ],
        "type": "basic"
      }
    ]
  },
  {
    "description": "Ctrl+G to Escape",
    "manipulators": [
      {
        "description": "emacs like escape",
        "from": {
          "key_code": "g",
          "modifiers": {
            "mandatory": [
              "left_control"
            ]
          }
        },
        "to": [
          {
            "key_code": "escape"
          }
        ],
        "conditions": [
          {
            "type": "frontmost_application_unless",
            "bundle_identifiers": [
              "^org\\.gnu\\.Emacs"
            ]
          }
        ],
        "type": "basic"
      }
    ]
  }
]
```
