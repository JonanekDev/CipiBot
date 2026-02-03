import { PrismaClient } from "./generated/prisma/client";

export class TicketingRepository {
  constructor(private prisma: PrismaClient) {}

    async getTicketCategories(guildId: string) {
        return await this.prisma.ticketCategories.findMany({
            where: {
                guildId
            },
        });
    }

    async getCategoryQuestions(categoryId: string) {
        return await this.prisma.ticketCategoryQuestions.findMany({
            where: {
                categoryId
            },
        });
    }

    async getTicketCategoryRoles(categoryId: string) {
        return await this.prisma.ticketCategoryRoles.findMany({
            where: {
                categoryId
            },
        });
    }

    async createTicket(guildId: string, userId: string, categoryId: string, channelId: string) {
        return await this.prisma.tickets.create({
            data: {
                guildId,
                userId,
                categoryId,
                channelId,
            },
        });
    }

    async closeTicket(ticketId: string) {
        return await this.prisma.tickets.update({
            where: {
                id: ticketId,
            },
            data: {
                status: 'CLOSED',
            },
        });
    }

    async reopenTicket(ticketId: string) {
        return await this.prisma.tickets.update({
            where: {
                id: ticketId,
            },
            data: {
                status: 'OPEN',
            },
        });
    }

}