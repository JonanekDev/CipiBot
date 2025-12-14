# CipiBot

> A feature-rich, modular Discord bot built with microservices architecture

[![Status](https://img.shields.io/badge/status-early%20WIP-yellow)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)]()

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

## Microservices

- **Gateway** - Receives Discord events and publishes to Kafka
- **Leveling** - Manages XP and level progression system
- **Config** - Handles guild-specific feature toggles and settings
- **Discord-REST** - Centralized Discord API interactions
- **More comming...**

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

## Development Status

🚧 This project is in early development. Features and architecture may change significantly.