#!/bin/bash

echo "Waiting for Kafka..."
/opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9092 --list

topics=(
    "discord.guild.update"
    "discord.guild.create"
    "discord.guild.delete"
    "discord.message.create"
    "discord.guild.member.add"
    "discord.guild.member.remove"
    "discord.channel.create"
    "discord.channel.update"
    "discord.channel.delete"
    "discord.guild.role.create"
    "discord.guild.role.update"
    "discord.guild.role.delete"
    "discord.outbound.member.role.add"
    "discord.outbound.member.role.remove"
    "discord.outbound.send.message"
    "discord.outbound.send.dm"
    "discord.outbound.interaction.reply.update"
    "system.commands.update"
)

for topic in "${topics[@]}"; do
    echo "Creating topic: $topic"
    /opt/kafka/bin/kafka-topics.sh --bootstrap-server kafka:9092 --create --if-not-exists --topic "$topic" --replication-factor 1 --partitions 3
done

echo "All topics created."