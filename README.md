![Noxa Banner](https://user-images.githubusercontent.com/placeholder/noxa-banner.png)

<p align="center">
  <img src="https://img.shields.io/github/stars/NiklasNK-Creator/Noxa?style=for-the-badge">
  <img src="https://img.shields.io/github/downloads/NiklasNK-Creator/Noxa/total?style=for-the-badge">
  <img src="https://img.shields.io/github/v/release/NiklasNK-Creator/Noxa?style=for-the-badge">
  <img src="https://img.shields.io/github/license/NiklasNK-Creator/Noxa?style=for-the-badge">
</p>

---

# 🧠 What is Noxa?

Noxa is not a normal desktop app.
It is a **plugin-powered operating environment**.

Everything you use inside Noxa is a plugin:

* Apps
* Tools
* Web apps
* Themes
* Settings panels
* Extensions that modify the system itself

If it exists, it’s a plugin.

---

# 🔒 Security Model

Every plugin runs inside its own **sandbox**.
By default, plugins **cannot** access anything outside themselves.

Plugins must request permissions like:

| Permission      | What it allows            |
| --------------- | ------------------------- |
| `Filesystem`    | Read/write files          |
| `Network`       | Make internet requests    |
| `Clipboard`     | Read/write clipboard      |
| `Storage`       | Persistent local data     |
| `Notifications` | Show system notifications |

The user must approve every permission.

No silent access.
No hidden tracking.
No background spying.

---

# 🧩 Plugin Types

Noxa supports three different plugin types:

| Type          | What it does                                                             |
| ------------- | ------------------------------------------------------------------------ |
| **App**       | Normal applications (calculator, notepad, YouTube, Discord, tools)       |
| **Web**       | Embedded web apps                                                        |
| **Extension** | System-level plugins that can add themes, settings or modify Noxa itself |

⚠ Extensions run with **admin-level permissions** and are clearly warned before install.

---

# 🎨 Themes & UI

Noxa ships with:

* Multiple built-in themes
* Multiple languages
* Smooth Linux-style UI
* Fully animated and GPU-accelerated interface

Themes can be extended via **Theme Extensions** — no core modification required.

---

# 🔥 Plugin Store

Noxa includes a built-in **Plugin Store**.

It pulls plugins from the Noxa backend which syncs from GitHub.
No rate limits.
No client-side scraping.
No broken downloads.

Inside the store you get:

* Plugin name
* Description
* Type (App / Web / Extension)
* Icon
* One-click install

---

# ⚡ Hot-Swap System

Noxa supports **true hot-swap plugins**.

You can:

* Install plugins
* Remove plugins
* Import ZIP plugins

Without restarting the app.

They are loaded instantly and kept in memory for fast switching.

---

# 📦 Import Your Own Plugins

You can install plugins from anywhere.

Just:

1. Click **Install Plugin**
2. Select a `.zip` file
3. Noxa extracts and loads it

No restart.
No reload.
Instant.

---

# 🛠 What can people build?

Anything.

Examples:

* Password managers
* IDEs
* TikTok
* Roblox
* Discord
* YouTube
* Dev tools
* Admin panels
* Custom launchers
* Automation tools
* Notes systems
* Music players
* Dashboards

If it can be built in HTML + JS, it runs in Noxa.

---

# 🧬 Why Noxa is different

Noxa is not:

* An Electron app
* A browser shell
* A normal launcher

It is a **plugin OS**.

Users are not locked in.
Developers are not restricted.
The core stays clean forever.

Everything lives outside the core.

---

# 📥 Installation

1. Download the latest release from GitHub
2. Run the installer
3. Launch Noxa
4. Install plugins from the store or import your own

---

# 🧑‍💻 For Developers

Create a plugin by providing:

```
manifest.json
index.html
script.js
style.css (optional)
icon.png (optional)
```

No SDK required.
No compile step.
Just drop files into a zip and import.

---

# 🌍 Community

Join the Discord to:

* Get official plugins
* Share community plugins
* Report bugs
* Get updates

👉 **Discord link inside the app**

---

# 🧠 Final Words

Noxa is what happens when:

* Linux modularity
* Browser power
* Sandbox security
* Plugin freedom

are combined into one system.

This is not just an app.
This is a platform.
