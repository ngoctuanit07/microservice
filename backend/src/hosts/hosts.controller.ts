// backend/src/hosts/hosts.controller.ts
import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { HostsService } from './hosts.service';
import { CreateHostDto } from './dto/create-host.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('hosts')
export class HostsController {
  constructor(private readonly service: HostsService) {}

  @Post()
  create(@Body() dto: CreateHostDto, @Param() params: any, @Query() query: any, @Body() body: any, @Req() req: any) {
    const userEmail = req.user?.email;
    return this.service.create(dto, userEmail);
  }

  @Get()
  list(@Query() q: any) {
    return this.service.findAll(q);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Get(':id/reveal')
  reveal(@Param('id') id: string) {
    return this.service.revealPassword(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateHostDto>, @Req() req: any) {
    const userEmail = req.user?.email;
    return this.service.update(+id, dto, userEmail);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: any) {
    const userEmail = req.user?.email;
    return this.service.remove(+id, userEmail);
  }
}
