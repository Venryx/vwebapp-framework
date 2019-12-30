# vwebapp-framework

The framework code for my web-apps, collected into a library for easy reuse.

### Installation

```
npm install vwebapp-framework
```

### Setup

Add this line to the entry-point:
```
type __ = typeof import("../node_modules/js-vextensions/Helpers/@ApplyCETypes");
```

This will make typescript aware of the class-extensions that vwebapp-framework creates (as defined in js-vextensions).