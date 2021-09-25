# vwebapp-framework

The framework code for my web-apps, collected into a library for easy reuse.

> MOVED: https://github.com/Venryx/web-vcore

### Installation

```
npm install vwebapp-framework

# install packages for Scripts folder
npm install -D node-sass @babel/plugin-proposal-nullish-coalescing-operator @babel/plugin-proposal-optional-chaining
```

Note: Make sure you use version 5.0.0 of immer exactly. There is some bug with the newer versions (eg. 5.3.2), when used with my npm-patches anyway, which causes perf issues in certain situations that are very hard to track down. (only when dev-tools are open, and only with certain Link.actionFunc code-blocks) [update: I don't think this requirement is true anymore, but not sure]