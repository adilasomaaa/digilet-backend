import { Controller, Get } from "@nestjs/common";
import { Public } from "src/auth/decorators/public.decorator";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('/')
export class HomeController {
    constructor(private prismaService: PrismaService) {}
    @Public()
    @Get()
    async index() {
        return {
            message: 'Digilet API',
            version: '1.0.0',
            status: 'running',
            createdBy: 'Yasdil Lasoma'
        };
    }

    @Public()
    @Get('testimoni')
    async testimoni() {
        // Ambil data announcement yang aktif (status = true)
        const announcements = await this.prismaService.announcement.findMany({
            where: {
                status: true,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                institution: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 10, // Ambil 10 announcement terbaru
        });

        return {
            message: 'Testimoni/Announcement Page',
            data: announcements,
        };
    }
}