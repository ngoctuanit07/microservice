import { Controller, Post, Get, Body, UseGuards, Query } from '@nestjs/common';
import { GetUser } from '../common/decorators/get-user.decorator';
import { BulkOperationsService } from './bulk-operations.service';

interface BulkUpdateHostsDto {
  hostIds: number[];
  updates: {
    status?: string;
    notes?: string;
    tags?: string[];
  };
}

interface BulkDeleteDto {
  ids: number[];
}

@Controller('bulk')
export class BulkOperationsController {
  constructor(private bulkOperationsService: BulkOperationsService) {}

  @Post('hosts/update')
  async bulkUpdateHosts(
    @Body() bulkUpdateDto: BulkUpdateHostsDto,
    @GetUser() user: any
  ) {
    return this.bulkOperationsService.bulkUpdateHosts(
      bulkUpdateDto.hostIds,
      bulkUpdateDto.updates,
      user.id
    );
  }

  @Post('hosts/delete')
  async bulkDeleteHosts(
    @Body() bulkDeleteDto: BulkDeleteDto,
    @GetUser() user: any
  ) {
    return this.bulkOperationsService.bulkDeleteHosts(bulkDeleteDto.ids, user.id);
  }

  @Post('hosts/export')
  async exportHosts(
    @Body() filters: any,
    @GetUser() user: any
  ) {
    return this.bulkOperationsService.exportHosts(filters, user.id);
  }

  @Post('hosts/import')
  async importHosts(
    @Body() importData: { hosts: any[] },
    @GetUser() user: any
  ) {
    return this.bulkOperationsService.importHosts(importData.hosts, user.id);
  }

  @Get('operations/status/:operationId')
  async getOperationStatus(@Query('operationId') operationId: string) {
    return this.bulkOperationsService.getOperationStatus(operationId);
  }
}