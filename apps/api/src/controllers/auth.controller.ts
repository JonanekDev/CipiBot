import { AuthService } from "../services/auth.service";
import { LoginReqType, LoginResType, MeResType } from "@cipibot/schemas";
import type { FastifyRequest, FastifyReply } from "fastify";

export class AuthController {

    constructor(private readonly authService: AuthService) {}

    login = async (
        request: FastifyRequest<{ Body: LoginReqType }>,
        reply: FastifyReply
    ): Promise<LoginResType> => {
        const { code } = request.body;
        const sessionData = await this.authService.login(code);

        const token = await reply.jwtSign({
            userId: sessionData.user.id,
        }, {
            expiresIn: '7d',
        });

        reply.setCookie('access_token', token, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
        })

        return {
            status: 'ok',
            data: sessionData
        }
    };

    me = async (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<MeResType> => {
        const userId = request.user.userId;
        const sessionData = await this.authService.getSessionData(userId);

        return {
            status: 'ok',
            data: sessionData
        };
    }
}