# CipiBot

> A feature-rich, modular Discord bot built with microservices architecture

[![Status](https://img.shields.io/badge/status-early%20WIP-yellow)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)]()
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![pnpm](https://img.shields.io/badge/pnpm-9+-orange)]()

## Overview

CipiBot is an all-in-one Discord bot designed to combine the best features from various bots into a single, highly customizable solution. Built with a modern microservices architecture, it supports multiple servers with granular per-guild feature control.

## Key Features

- **Modular Design** - Enable or disable features per server
- **Multi-Server Support** - Scalable architecture for unlimited servers
- **Microservices Architecture** - Independent, maintainable services
- **Customizable** - Fine-grained control over bot behavior

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Primary language with Node.js runtime |
| **pnpm + Turbo** | Monorepo management and build optimization |
| **PostgreSQL** | Primary database |
| **Prisma** | Type-safe ORM for database operations |
| **Kafka** | Event streaming between microservices |
| **Fastify** | High-performance HTTP API framework |
| **Redis** | In-memory caching for fast data access |

## Development Status

🚧 This project is in early development. Features and architecture may change significantly.

## Contributing

This is my first project using microservices architecture, and I'm learning as I go! If you have suggestions, improvements, or spot something that could be done better — I'd love to hear from you.

Feel free to:
- 🐛 Open an issue with feedback or questions
- 💡 Submit a pull request with improvements
- 💬 Reach out with advice or best practices

All contributions and constructive criticism are welcome! 🙌

## Microservices

| Service | Description | Native Port (Local) |
| :--- | :--- | :---: |
| **Web** | User dashboard and landing page (Vue.js) | 3000 |
| **Discord-WS** | Receives Discord events and publishes to Kafka | 3001 |
| **Leveling** | Manages XP and level progression system | 3002 |
| **Config** | Handles guild-specific feature toggles and settings | 3003 |
| **Discord-REST** | Centralized Discord API interactions | 3004 |
| **API** | Public API for frontend | 3005 |
| **Welcoming** | Welcome and leave messages | 3006 |
| **Ticketing** | Support ticketing system | 3007 |
| *More coming...* | 

> **Docker Note:**
> Within the Docker environment, all microservices are configured to run on a uniform internal port (3000). Only the **web** service (Nginx) is exposed to the host. It acts as a reverse proxy, routing traffic to api service

## Planned Features

### Core Systems
- ✨ **Leveling System** - XP progression with public web leaderboard
- 🛡️ **Moderation Suite** - Comprehensive moderation tools
- 🔒 **User Verification** - CAPTCHA-based bot protection
- 📊 **Logging System** - Detailed server activity logs
- 🌐 **Multi-language Support** - Localization for global communities

### Engagement
- 🎮 **Fun Commands** - Interactive entertainment features
- 🎁 **Giveaways** - Automated giveaway management
- 🎭 **Reaction Roles** - Self-assignable roles via reactions
- 💬 **Welcome Messages** - Customizable greeting system

### Utility
- 🤖 **Custom Commands** - User-defined command creation
- 📢 **Social Alerts** - Notifications for YouTube, Twitter, Reddit
- 🎮 **Minecraft Integration** - Server status monitoring
- 🎫 **Ticketing System** - Support ticket management
- ⏰ **Reminders** - Scheduled messages and notifications

### Advanced Features
- 💰 **Economy System** - Virtual currency, shop, and games
- 🎵 **Music Player** - Multi-source audio streaming
- 🔧 **Web Panel** - Browser-based bot configuration
- 🎨 **Embed Builder** - Visual embed creation tool