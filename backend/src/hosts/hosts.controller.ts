// backend/src/hosts/hosts.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  Patch, 
  Delete, 
  UseGuards, 
  Req,
  Logger,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  BadRequestException,
  ParseIntPipe
} from '@nestjs/common';
import { HostsService } from './hosts.service';
import { CreateHostDto } from './dto/create-host.dto';
import { UpdateHostDto } from './dto/update-host.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('hosts')
export class HostsController {
  private readonly logger = new Logger(HostsController.name);
  
  constructor(private readonly service: HostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CreateHostDto,
    @Req() req: any
  ) {
    const userEmail = req.user?.email;
    this.logger.log(`Creating new host by user: ${userEmail}`);
    return this.service.create(dto, userEmail);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Query() q: {
      search?: string;
      page?: number;
      pageSize?: number;
      expiringInDays?: number;
      ip?: string;
      uid?: string;
      notes?: string;
      purchasedFrom?: string;
      purchasedTo?: string;
      expiredFrom?: string;
      expiredTo?: string;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    }
  ) {
    this.logger.debug(`Listing hosts with filters: ${JSON.stringify(q)}`);
    return this.service.findAll(q);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async get(@Param('id', ParseIntPipe) id: number) {
    this.logger.debug(`Getting host with ID: ${id}`);
    return this.service.findOne(id);
  }

  @Get(':id/reveal')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.OK)
  async reveal(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userEmail = req.user?.email;
    this.logger.log(`Password reveal requested for host ${id} by user: ${userEmail}`);
    return this.service.revealPassword(id, userEmail);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: UpdateHostDto,
    @Req() req: any
  ) {
    const userEmail = req.user?.email;
    this.logger.log(`Updating host ${id} by user: ${userEmail}`);
    return this.service.update(id, dto, userEmail);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const userEmail = req.user?.email;
    this.logger.log(`Deleting host ${id} by user: ${userEmail}`);
    return this.service.remove(id, userEmail);
  }
  
  @Post('batch-import')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.CREATED)
  async batchImport(
    @Body() data: { hosts: CreateHostDto[] },
    @Req() req: any
  ) {
    const userEmail = req.user?.email;
    this.logger.log(`Batch importing ${data.hosts.length} hosts by user: ${userEmail}`);
    return this.service.batchImport(data.hosts, userEmail);
  }
  
  @Post('batch-update')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.OK)
  async batchUpdate(
    @Body() data: { hosts: { id: number, data: UpdateHostDto }[] },
    @Req() req: any
  ) {
    const userEmail = req.user?.email;
    this.logger.log(`Batch updating ${data.hosts.length} hosts by user: ${userEmail}`);
    return this.service.batchUpdate(data.hosts, userEmail);
  }
}
