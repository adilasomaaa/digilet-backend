import { Controller, Get } from "@nestjs/common";
import { Public } from "src/auth/decorators/public.decorator";

@Controller('/')
export class HomeController {
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
}