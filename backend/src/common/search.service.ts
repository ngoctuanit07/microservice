import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SearchResult {
  id: number;
  type: 'host' | 'transaction' | 'team' | 'organization';
  title: string;
  description: string;
  url: string;
  icon: string;
  relevance: number;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async globalSearch(query: string, userId: number): Promise<{ results: SearchResult[] }> {
    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search Hosts
    const hosts = await this.prisma.host.findMany({
      where: {
        userId,
        OR: [
          { ip: { contains: searchTerm } },
          { uid: { contains: searchTerm } },
          { notes: { contains: searchTerm } },
        ]
      },
      take: 5
    });

    hosts.forEach(host => {
      results.push({
        id: host.id,
        type: 'host',
        title: `${host.ip}:${host.port}`,
        description: `${host.uid} - ${host.status} - Expires: ${host.expiredAt.toLocaleDateString()}`,
        url: `/hosts/${host.id}/edit`,
        icon: '🖥️',
        relevance: this.calculateRelevance(searchTerm, `${host.ip} ${host.uid} ${host.notes || ''}`)
      });
    });

    // Search Transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { type: { contains: searchTerm } },
        ]
      },
      take: 5
    });

    transactions.forEach(transaction => {
      results.push({
        id: transaction.id,
        type: 'transaction',
        title: transaction.name,
        description: `${transaction.type} - ${transaction.amount} - ${transaction.date.toLocaleDateString()}`,
        url: `/transaction`,
        icon: '💰',
        relevance: this.calculateRelevance(searchTerm, `${transaction.name} ${transaction.type}`)
      });
    });

    // Search Teams (if user has access)
    const teams = await this.prisma.team.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ],
        users: {
          some: { userId }
        }
      },
      take: 3
    });

    teams.forEach(team => {
      results.push({
        id: team.id,
        type: 'team',
        title: team.name,
        description: team.description || 'Team',
        url: `/team/${team.id}/edit`,
        icon: '👥',
        relevance: this.calculateRelevance(searchTerm, `${team.name} ${team.description || ''}`)
      });
    });

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Save search query for suggestions
    await this.saveSearchQuery(query, userId);

    return { results: results.slice(0, 10) };
  }

  async getSearchSuggestions(query: string, userId: number): Promise<{ suggestions: string[] }> {
    if (!query || query.length < 1) {
      return { suggestions: [] };
    }

    const searchTerm = query.toLowerCase();
    const suggestions = new Set<string>();

    // Host-related suggestions
    const hosts = await this.prisma.host.findMany({
      where: {
        userId,
        OR: [
          { ip: { startsWith: searchTerm } },
          { uid: { startsWith: searchTerm } },
        ]
      },
      select: { ip: true, uid: true },
      take: 5
    });

    hosts.forEach(host => {
      if (host.ip.toLowerCase().startsWith(searchTerm)) {
        suggestions.add(host.ip);
      }
      if (host.uid.toLowerCase().startsWith(searchTerm)) {
        suggestions.add(host.uid);
      }
    });

    // Common search terms
    const commonTerms = [
      'active hosts',
      'expired hosts',
      'expiring hosts',
      'income transactions',
      'expense transactions',
      'team members',
      'subscription'
    ];

    commonTerms.forEach(term => {
      if (term.toLowerCase().includes(searchTerm)) {
        suggestions.add(term);
      }
    });

    return { suggestions: Array.from(suggestions).slice(0, 8) };
  }

  async getRecentSearches(userId: number): Promise<{ searches: string[] }> {
    // In a real app, you'd store recent searches in database
    // For now, return some sample recent searches
    return {
      searches: [
        'active hosts',
        'server-01',
        'expired',
        'team alpha'
      ]
    };
  }

  private calculateRelevance(query: string, text: string): number {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    if (textLower === queryLower) return 100;
    if (textLower.startsWith(queryLower)) return 80;
    if (textLower.includes(queryLower)) return 60;

    // Check word matches
    const queryWords = queryLower.split(' ');
    const textWords = textLower.split(' ');
    let wordMatches = 0;

    queryWords.forEach(qWord => {
      if (textWords.some(tWord => tWord.includes(qWord))) {
        wordMatches++;
      }
    });

    return (wordMatches / queryWords.length) * 40;
  }

  private async saveSearchQuery(query: string, userId: number): Promise<void> {
    // In a real app, you'd save this to a search_history table
    // This is just a placeholder
    console.log(`User ${userId} searched for: ${query}`);
  }
}