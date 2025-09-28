import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GetUser } from '../common/decorators/get-user.decorator';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async globalSearch(@Query('q') query: string, @GetUser() user: any) {
    if (!query || query.length < 2) {
      return { results: [] };
    }

    return this.searchService.globalSearch(query, user.id);
  }

  @Get('suggestions')
  async getSearchSuggestions(@Query('q') query: string, @GetUser() user: any) {
    return this.searchService.getSearchSuggestions(query, user.id);
  }

  @Get('recent')
  async getRecentSearches(@GetUser() user: any) {
    return this.searchService.getRecentSearches(user.id);
  }
}